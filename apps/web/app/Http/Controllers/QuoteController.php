<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Deal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('sales/quotes/index', [
            'quotes' => Quote::with(['account', 'contact'])
                ->filter($request->all())
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => $request->all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('sales/quotes/create', [
            'accounts' => Account::all(),
            'contacts' => Contact::all(),
            'deals' => Deal::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'valid_until' => 'nullable|date',
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

            $quote = Quote::create([
                'quote_number' => 'Q-' . strtoupper(uniqid()),
                'subject' => $validated['subject'],
                'account_id' => $validated['account_id'],
                'contact_id' => $validated['contact_id'],
                'deal_id' => $validated['deal_id'],
                'status' => 'Draft',
                'valid_until' => $validated['valid_until'],
                'total_amount' => $totalAmount,
                'currency' => $validated['currency'],
                'notes' => $validated['notes'],
                'tenant_id' => auth()->user()->tenant_id,
                'owner_id' => auth()->id(),
            ]);

            foreach ($validated['items'] as $item) {
                $quote->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return redirect()->route('quotes.index')->with('success', 'Quote created successfully.');
        });
    }

    public function show(Quote $quote)
    {
        $historyItems = collect()
            ->merge($quote->activities()->with('user')->get()->map(fn($a) => [
                'date' => $a->created_at,
                'action' => $a->type === 'note' ? 'Note Added' : ucfirst($a->type) . ' Logged',
                'user' => $a->user->name ?? 'User',
                'type' => $a->type,
                'is_deleted' => false,
                'deleted_at' => null
            ]))
            ->merge($quote->auditLogs()->with('user')->get()->map(function ($log) {
                $action = "";
                if ($log->event === 'updated') {
                    $changedFields = array_keys($log->new_values ?? []);
                    $action = "Updated fields: " . implode(', ', $changedFields);
                } else {
                    $action = ucfirst($log->event) . " Quote";
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

        return Inertia::render('sales/quotes/show', [
            'quote' => $quote->load([
                'items',
                'account',
                'contact',
                'deal',
                'activities.user',
                'tasks.assignee',
                'notes.creator',
                'attachments.uploader'
            ]),
            'history_items' => $historyItems,
        ]);
    }

    public function edit(Quote $quote)
    {
        return Inertia::render('sales/quotes/edit', [
            'quote' => $quote->load('items'),
            'accounts' => Account::all(),
            'contacts' => Contact::all(),
            'deals' => Deal::all(),
        ]);
    }

    public function update(Request $request, Quote $quote)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'valid_until' => 'nullable|date',
            'currency' => 'required|string|max:3',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $quote) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $quote->update([
                'subject' => $validated['subject'],
                'account_id' => $validated['account_id'],
                'contact_id' => $validated['contact_id'],
                'deal_id' => $validated['deal_id'],
                'valid_until' => $validated['valid_until'],
                'total_amount' => $totalAmount,
                'currency' => $validated['currency'],
                'notes' => $validated['notes'],
            ]);

            // Simple approach: delete old items and create new ones
            $quote->items()->delete();
            foreach ($validated['items'] as $item) {
                $quote->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return redirect()->route('quotes.index')->with('success', 'Quote updated successfully.');
        });
    }

    public function destroy(Quote $quote)
    {
        $quote->delete();
        return redirect()->route('quotes.index')->with('success', 'Quote deleted successfully.');
    }
}
