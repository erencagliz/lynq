<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Quote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('sales/invoices/index', [
            'invoices' => Invoice::with(['account', 'contact'])
                ->filter($request->all())
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => $request->all(),
        ]);
    }

    public function create(Request $request)
    {
        $quote = null;
        if ($request->has('quote_id')) {
            $quote = Quote::with('items')->find($request->quote_id);
        }

        return Inertia::render('sales/invoices/create', [
            'accounts' => Account::all(),
            'contacts' => Contact::all(),
            'deals' => Deal::all(),
            'quotes' => Quote::all(),
            'prefilled_quote' => $quote,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'quote_id' => 'nullable|exists:quotes,id',
            'due_date' => 'nullable|date',
            'currency' => 'required|string|max:3',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $invoice = Invoice::create([
                'invoice_number' => 'INV-' . strtoupper(uniqid()),
                'subject' => $validated['subject'],
                'account_id' => $validated['account_id'],
                'contact_id' => $validated['contact_id'],
                'deal_id' => $validated['deal_id'],
                'quote_id' => $validated['quote_id'],
                'status' => 'Draft',
                'due_date' => $validated['due_date'],
                'total_amount' => $totalAmount,
                'currency' => $validated['currency'],
                'notes' => $validated['notes'],
                'tenant_id' => auth()->user()->tenant_id,
                'owner_id' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return redirect()->route('invoices.index')->with('success', 'Invoice created successfully.');
        });
    }

    public function show(Invoice $invoice)
    {
        $historyItems = collect()
            ->merge($invoice->activities()->with('user')->get()->map(fn($a) => [
                'date' => $a->created_at,
                'action' => $a->type === 'note' ? 'Note Added' : ucfirst($a->type) . ' Logged',
                'user' => $a->user->name ?? 'User',
                'type' => $a->type,
                'is_deleted' => false,
                'deleted_at' => null
            ]))
            ->merge($invoice->auditLogs()->with('user')->get()->map(function ($log) {
                $action = "";
                if ($log->event === 'updated') {
                    $changedFields = array_keys($log->new_values ?? []);
                    $action = "Updated fields: " . implode(', ', $changedFields);
                } else {
                    $action = ucfirst($log->event) . " Invoice";
                }

                return [
                    'date' => $log->created_at,
                    'action' => $action,
                    'user' => $log->user->name ?? 'System',
                    'type' => 'history',
                    'is_deleted' => false,
                    'deleted_at' => null,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values
                ];
            }))
            ->sortByDesc('date')
            ->values();

        return Inertia::render('sales/invoices/show', [
            'invoice' => $invoice->load([
                'items',
                'account',
                'contact',
                'deal',
                'quote',
                'activities.user',
                'tasks.assignee',
                'notes.creator',
                'attachments.uploader'
            ]),
            'history_items' => $historyItems,
        ]);
    }

    public function edit(Invoice $invoice)
    {
        return Inertia::render('sales/invoices/edit', [
            'invoice' => $invoice->load('items'),
            'accounts' => Account::all(),
            'contacts' => Contact::all(),
            'deals' => Deal::all(),
            'quotes' => Quote::all(),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'quote_id' => 'nullable|exists:quotes,id',
            'due_date' => 'nullable|date',
            'status' => 'required|string',
            'currency' => 'required|string|max:3',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $invoice) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $invoice->update([
                'subject' => $validated['subject'],
                'account_id' => $validated['account_id'],
                'contact_id' => $validated['contact_id'],
                'deal_id' => $validated['deal_id'],
                'quote_id' => $validated['quote_id'],
                'status' => $validated['status'],
                'due_date' => $validated['due_date'],
                'total_amount' => $totalAmount,
                'currency' => $validated['currency'],
                'notes' => $validated['notes'],
            ]);

            $invoice->items()->delete();
            foreach ($validated['items'] as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return redirect()->route('invoices.index')->with('success', 'Invoice updated successfully.');
        });
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
    }
}
