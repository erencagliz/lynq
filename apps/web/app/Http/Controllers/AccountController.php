<?php

namespace App\Http\Controllers;

use App\Models\Account;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Account::with(['owner', 'parent'])
            ->latest()
            ->filter($request->only(['search', 'trashed', 'filter_column', 'filter_operator', 'filter_value']));

        return Inertia::render('accounts/index', [
            'accounts' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'filter_column', 'filter_operator', 'filter_value']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('accounts/create', [
            'accounts' => Account::select('id', 'name')->get(),
            'users' => \App\Models\User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:accounts,id',
            'account_type' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'fax' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address_street' => 'nullable|string|max:255',
            'address_city' => 'nullable|string|max:255',
            'address_state' => 'nullable|string|max:255',
            'address_postal_code' => 'nullable|string|max:255',
            'address_country' => 'nullable|string|max:255',
            'number_of_employees' => 'nullable|integer',
            'annual_revenue' => 'nullable|numeric',
            'rating' => 'nullable|string|max:255',
            'ownership' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|string|max:255',
        ]);

        $account = Account::create($validated + [
            'tenant_id' => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return Redirect::route('accounts.index')->with('success', 'Account created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Account $account)
    {
        $historyItems = collect()
            ->merge($account->tasks()->withTrashed()->with('creator')->get()->map(fn($t) => [
                'date' => $t->created_at,
                'action' => 'Task Created: ' . $t->subject,
                'user' => $t->creator->name ?? 'User',
                'type' => 'task',
                'is_deleted' => $t->trashed(),
                'deleted_at' => $t->deleted_at
            ]))
            ->merge($account->notes()->withTrashed()->with('creator')->get()->map(fn($n) => [
                'date' => $n->created_at,
                'action' => 'Note Added',
                'user' => $n->creator->name ?? 'User',
                'type' => 'note',
                'is_deleted' => $n->trashed(),
                'deleted_at' => $n->deleted_at
            ]))
            ->merge($account->attachments()->withTrashed()->with('uploader')->get()->map(fn($f) => [
                'date' => $f->created_at,
                'action' => 'Attachment Uploaded: ' . $f->file_name,
                'user' => $f->uploader->name ?? 'User',
                'type' => 'attachment',
                'is_deleted' => $f->trashed(),
                'deleted_at' => $f->deleted_at
            ]))
            ->merge($account->auditLogs()->with('user')->get()->map(function ($log) {
                $action = "";
                if ($log->event === 'updated') {
                    $changedFields = array_keys($log->new_values ?? []);
                    $action = "Updated fields: " . implode(', ', $changedFields);
                } else {
                    $action = ucfirst($log->event) . " Account";
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

        return Inertia::render('accounts/show', [
            'account' => $account->load([
                'contacts',
                'deals.pipeline',
                'deals.stage',
                'tasks.assignee',
                'notes.creator',
                'attachments.uploader',
                'parent',
                'children',
                'creator',
                'owner',
                'quotes',
                'invoices',
                'tickets.assignee'
            ]),
            'users' => \App\Models\User::select('id', 'name')->get(),
            'history_items' => $historyItems
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Account $account)
    {
        return Inertia::render('accounts/edit', [
            'account' => $account,
            'accounts' => Account::where('id', '!=', $account->id)->select('id', 'name')->get(),
            'users' => \App\Models\User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:accounts,id',
            'account_type' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'fax' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address_street' => 'nullable|string|max:255',
            'address_city' => 'nullable|string|max:255',
            'address_state' => 'nullable|string|max:255',
            'address_postal_code' => 'nullable|string|max:255',
            'address_country' => 'nullable|string|max:255',
            'number_of_employees' => 'nullable|integer',
            'annual_revenue' => 'nullable|numeric',
            'rating' => 'nullable|string|max:255',
            'ownership' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|string|max:255',
        ]);

        $account->update($validated);

        return Redirect::route('accounts.index')->with('success', 'Account updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $account)
    {
        $account->delete();

        return Redirect::route('accounts.index')->with('success', 'Account deleted successfully.');
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:accounts,id',
        ]);

        Account::whereIn('id', $request->input('ids'))->delete();

        return Redirect::route('accounts.index')->with('success', 'Accounts deleted successfully.');
    }
}
