<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Account;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('support/tickets/index', [
            'tickets' => Ticket::with(['account', 'contact', 'assignee'])
                ->filter($request->all())
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => $request->all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('support/tickets/create', [
            'accounts' => Account::all(),
            'contacts' => Contact::all(),
            'users' => User::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|string',
            'priority' => 'required|string',
            'account_id' => 'nullable|exists:accounts,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        Ticket::create($validated + [
            'ticket_number' => 'TKT-' . strtoupper(uniqid()),
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        return redirect()->route('tickets.index')->with('success', 'Ticket created successfully.');
    }

    public function show(Ticket $ticket)
    {
        $historyItems = collect()
            ->merge($ticket->activities()->with('user')->get()->map(fn($a) => [
                'date' => $a->created_at,
                'action' => $a->type === 'note' ? 'Note Added' : ucfirst($a->type) . ' Logged',
                'user' => $a->user->name ?? 'User',
                'type' => $a->type,
                'is_deleted' => false,
                'deleted_at' => null
            ]))
            ->merge($ticket->auditLogs()->with('user')->get()->map(function ($log) {
                $action = "";
                if ($log->event === 'updated') {
                    $changedFields = array_keys($log->new_values ?? []);
                    $action = "Updated fields: " . implode(', ', $changedFields);
                } else {
                    $action = ucfirst($log->event) . " Ticket";
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

        return Inertia::render('support/tickets/show', [
            'ticket' => $ticket->load([
                'account',
                'contact',
                'assignee',
                'activities.user',
                'tasks.assignee',
                'notes.creator',
                'attachments.uploader'
            ]),
            'history_items' => $historyItems,
        ]);
    }

    public function edit(Ticket $ticket)
    {
        return Inertia::render('support/tickets/edit', [
            'ticket' => $ticket,
            'accounts' => Account::all(),
            'contacts' => Contact::all(),
            'users' => User::all(),
        ]);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|string',
            'priority' => 'required|string',
            'account_id' => 'nullable|exists:accounts,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $ticket->update($validated);

        return redirect()->route('tickets.index')->with('success', 'Ticket updated successfully.');
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();
        return redirect()->route('tickets.index')->with('success', 'Ticket deleted successfully.');
    }
}
