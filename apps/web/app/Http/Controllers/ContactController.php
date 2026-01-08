<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Account;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Contact::with(['account', 'owner'])
            ->latest()
            ->filter($request->only(['search', 'trashed', 'filter_column', 'filter_operator', 'filter_value']));

        return Inertia::render('contacts/index', [
            'contacts' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'filter_column', 'filter_operator', 'filter_value']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('contacts/create', [
            'accounts' => Account::orderBy('name')->get(),
            'users' => \App\Models\User::all(),
            'contacts' => Contact::orderBy('first_name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'title' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'mobile_phone' => 'nullable|string|max:255',
            'fax' => 'nullable|string|max:255',
            'assistant_name' => 'nullable|string|max:255',
            'assistant_phone' => 'nullable|string|max:255',
            'reports_to' => 'nullable|exists:contacts,id',
            'lead_source' => 'nullable|string|max:255',
            'birthdate' => 'nullable|date',
            'mailing_street' => 'nullable|string|max:255',
            'mailing_city' => 'nullable|string|max:255',
            'mailing_state' => 'nullable|string|max:255',
            'mailing_postal_code' => 'nullable|string|max:255',
            'mailing_country' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|string|in:Active,Inactive,Prospect',
        ]);

        Contact::create($validated + [
            'tenant_id' => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return Redirect::route('contacts.index')->with('success', 'Contact created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Contact $contact)
    {
        $historyItems = collect()
            ->merge($contact->tasks()->withTrashed()->with('creator')->get()->map(fn($t) => [
                'date' => $t->created_at,
                'action' => 'Task Created: ' . $t->subject,
                'user' => $t->creator->name ?? 'User',
                'type' => 'task',
                'is_deleted' => $t->trashed(),
                'deleted_at' => $t->deleted_at
            ]))
            ->merge($contact->notes()->withTrashed()->with('creator')->get()->map(fn($n) => [
                'date' => $n->created_at,
                'action' => 'Note Added',
                'user' => $n->creator->name ?? 'User',
                'type' => 'note',
                'is_deleted' => $n->trashed(),
                'deleted_at' => $n->deleted_at
            ]))
            ->merge($contact->attachments()->withTrashed()->with('uploader')->get()->map(fn($f) => [
                'date' => $f->created_at,
                'action' => 'Attachment Uploaded: ' . $f->file_name,
                'user' => $f->uploader->name ?? 'User',
                'type' => 'attachment',
                'is_deleted' => $f->trashed(),
                'deleted_at' => $f->deleted_at
            ]))
            ->merge($contact->auditLogs()->with('user')->get()->map(function ($log) {
                $action = "";
                if ($log->event === 'updated') {
                    $changedFields = array_keys($log->new_values ?? []);
                    $action = "Updated fields: " . implode(', ', $changedFields);
                } else {
                    $action = ucfirst($log->event) . " Contact";
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

        return Inertia::render('contacts/show', [
            'contact' => $contact->load([
                'account',
                'manager',
                'owner',
                'creator',
                'deals.stage',
                'tasks.assignee',
                'notes.creator',
                'attachments.uploader',
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
    public function edit(Contact $contact)
    {
        return Inertia::render('contacts/edit', [
            'contact' => $contact,
            'accounts' => Account::orderBy('name')->get(),
            'users' => \App\Models\User::all(),
            'contacts' => Contact::where('id', '!=', $contact->id)->orderBy('first_name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'title' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'mobile_phone' => 'nullable|string|max:255',
            'fax' => 'nullable|string|max:255',
            'assistant_name' => 'nullable|string|max:255',
            'assistant_phone' => 'nullable|string|max:255',
            'reports_to' => 'nullable|exists:contacts,id',
            'lead_source' => 'nullable|string|max:255',
            'birthdate' => 'nullable|date',
            'mailing_street' => 'nullable|string|max:255',
            'mailing_city' => 'nullable|string|max:255',
            'mailing_state' => 'nullable|string|max:255',
            'mailing_postal_code' => 'nullable|string|max:255',
            'mailing_country' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|string|in:Active,Inactive,Prospect',
        ]);

        $contact->update($validated);

        return Redirect::route('contacts.index')->with('success', 'Contact updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contact $contact)
    {
        $contact->delete();

        return Redirect::route('contacts.index')->with('success', 'Contact deleted successfully.');
    }
}
