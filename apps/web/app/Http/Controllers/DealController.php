<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Pipeline;
use App\Models\Account;
use App\Models\Contact;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $pipelineId = $request->input('pipeline_id')
            ?? Pipeline::where('is_default', true)->value('id')
            ?? Pipeline::value('id');

        $query = Deal::with(['account', 'contact', 'stage'])
            ->where('pipeline_id', $pipelineId)
            ->latest()
            ->filter($request->only(['search', 'trashed', 'filter_column', 'filter_operator', 'filter_value']));

        return Inertia::render('deals/index', [
            'deals' => $pipelineId ? $query->paginate(20)->withQueryString() : [],
            'pipelines' => Pipeline::with('stages')->get(),
            'currentPipelineId' => $pipelineId ? (int) $pipelineId : null,
            'filters' => $request->only(['search', 'filter_column', 'filter_operator', 'filter_value']),
        ]);
    }

    public function create()
    {
        return Inertia::render('deals/create', [
            'accounts' => Account::all(),
            'contacts' => Contact::all(),
            'pipelines' => Pipeline::with('stages')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'pipeline_id' => 'required|exists:pipelines,id',
            'pipeline_stage_id' => 'required|exists:pipeline_stages,id',
            'account_id' => 'nullable|exists:accounts,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'value' => 'nullable|numeric',
            'currency' => 'nullable|string|max:3',
            'expected_close_date' => 'nullable|date',
        ]);

        Deal::create($validated + ['tenant_id' => auth()->user()->tenant_id]);

        return Redirect::route('deals.index')->with('success', 'Deal created successfully.');
    }

    public function show(Deal $deal)
    {
        $historyItems = collect()
            ->merge($deal->activities()->with('user')->get()->map(fn($a) => [
                'date' => $a->created_at,
                'action' => $a->type === 'note' ? 'Note Added' : ucfirst($a->type) . ' Logged',
                'user' => $a->user->name ?? 'User',
                'type' => $a->type,
                'is_deleted' => false,
                'deleted_at' => null
            ]))
            ->merge($deal->auditLogs()->with('user')->get()->map(function ($log) {
                $action = "";
                if ($log->event === 'updated') {
                    $changedFields = array_keys($log->new_values ?? []);
                    $action = "Updated fields: " . implode(', ', $changedFields);
                } else {
                    $action = ucfirst($log->event) . " Deal";
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

        return Inertia::render('deals/show', [
            'deal' => $deal->load([
                'account',
                'contact',
                'pipeline',
                'stage',
                'activities.user',
                'tasks.assignee',
                'notes.creator',
                'attachments.uploader',
                'quotes',
                'invoices'
            ]),
            'history_items' => $historyItems,
        ]);
    }

    public function edit(Deal $deal)
    {
        return Inertia::render('deals/edit', [
            'deal' => $deal,
            'accounts' => Account::all(),
            'contacts' => Contact::all(),
            'pipelines' => Pipeline::with('stages')->get(),
        ]);
    }

    public function update(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_id' => 'nullable|exists:accounts,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'pipeline_id' => 'required|exists:pipelines,id',
            'pipeline_stage_id' => 'required|exists:pipeline_stages,id',
            'value' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'expected_close_date' => 'nullable|date',
            'owner_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
        ]);

        $deal->update($validated);

        return Redirect::route('deals.index')->with('success', 'Deal updated successfully.');
    }

    public function updateStage(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'pipeline_stage_id' => 'required|exists:pipeline_stages,id',
        ]);

        $deal->update([
            'pipeline_stage_id' => $validated['pipeline_stage_id']
        ]);

        return back()->with('success', 'Deal stage updated.');
    }

    public function destroy(Deal $deal)
    {
        $deal->delete();

        return Redirect::route('deals.index')->with('success', 'Deal deleted successfully.');
    }
}
