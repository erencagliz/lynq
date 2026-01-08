<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::with('user')
            ->latest()
            ->filter($request->only(['search', 'trashed', 'filter_column', 'filter_operator', 'filter_value']));

        return Inertia::render('leads/index', [
            'leads' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'filter_column', 'filter_operator', 'filter_value']),
        ]);
    }

    public function create()
    {
        return Inertia::render('leads/create', [
            'users' => \App\Models\User::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'status' => 'required|string',
        ]);

        Lead::create($validated + ['tenant_id' => auth()->user()->tenant_id, 'user_id' => auth()->id()]);

        return Redirect::route('leads.index')->with('success', 'Lead created successfully.');
    }

    public function show(Lead $lead)
    {
        $history_items = collect()
            ->merge($lead->activities()->with('user')->get()->map(fn($item) => [
                'id' => $item->id,
                'type' => $item->type,
                'action' => $item->description,
                'user' => $item->user?->name ?? 'System',
                'date' => $item->performed_at ?? $item->created_at,
                'old_values' => $item->properties['old'] ?? null,
                'new_values' => $item->properties['new'] ?? null,
            ]))
            ->merge($lead->auditLogs()->with('user')->get()->map(function ($log) {
                $action = "";
                if ($log->event === 'updated') {
                    $changedFields = array_keys($log->new_values ?? []);
                    $action = "Updated fields: " . implode(', ', $changedFields);
                } else {
                    $action = ucfirst($log->event) . " Lead";
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

        return Inertia::render('leads/show', [
            'lead' => $lead->load([
                'activities.user',
                'tasks.assignee',
                'user',
                'notes.creator',
                'attachments.uploader'
            ]),
            'history_items' => $history_items,
        ]);
    }

    public function edit(Lead $lead)
    {
        return Inertia::render('leads/edit', [
            'lead' => $lead,
            'users' => \App\Models\User::all(),
        ]);
    }

    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'status' => 'required|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $lead->update($validated);

        return Redirect::route('leads.index')->with('success', 'Lead updated successfully.');
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();
        return Redirect::route('leads.index')->with('success', 'Lead deleted successfully.');
    }

    public function convert(Lead $lead)
    {
        // Conversion logic: Create Contact, Account, Deal
        // For MVP, create Contact and Account if company exists

        $account = null;
        if ($lead->company) {
            $account = \App\Models\Account::create([
                'name' => $lead->company,
                'tenant_id' => $lead->tenant_id,
                'owner_id' => $lead->user_id,
            ]);
        }

        $contact = \App\Models\Contact::create([
            'first_name' => $lead->first_name,
            'last_name' => $lead->last_name,
            'email' => $lead->email,
            'phone' => $lead->phone,
            'account_id' => $account?->id,
            'tenant_id' => $lead->tenant_id,
            'owner_id' => $lead->user_id,
        ]);

        // Create Deal
        $deal = \App\Models\Deal::create([
            'name' => ($account?->name ?? $contact->first_name) . ' Deal',
            'pipeline_id' => \App\Models\Pipeline::where('is_default', true)->value('id') ?? 1,
            'pipeline_stage_id' => \App\Models\PipelineStage::where('pipeline_id', 1)->first()->id ?? 1,
            'account_id' => $account?->id,
            'contact_id' => $contact->id,
            'tenant_id' => $lead->tenant_id,
            'owner_id' => $lead->user_id,
        ]);

        $lead->update(['status' => 'Converted']);
        $lead->delete(); // Soft delete or archive

        return Redirect::route('deals.show', $deal)->with('success', 'Lead converted to Deal!');
    }

    public function updateStatus(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $lead->update(['status' => $validated['status']]);

        return back()->with('success', 'Lead status updated.');
    }
}
