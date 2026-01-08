<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class WorkflowController extends Controller
{
    public function index(Request $request)
    {
        $query = Workflow::query()
            ->latest()
            ->filter($request->only(['search', 'filter_column', 'filter_operator', 'filter_value']));

        return Inertia::render('settings/workflows/index', [
            'workflows' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'filter_column', 'filter_operator', 'filter_value']),
        ]);
    }

    public function create()
    {
        return Inertia::render('settings/workflows/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_event' => 'required|string',
            'conditions' => 'nullable|array',
            'actions' => 'required|array',
        ]);

        Workflow::create($validated + [
            'user_id' => auth()->id(),
            'tenant_id' => auth()->user()->tenant_id,
            'is_active' => true,
        ]);

        return Redirect::route('workflows.index')->with('success', 'Workflow created successfully.');
    }

    public function destroy(Workflow $workflow)
    {
        $workflow->delete();
        return Redirect::route('workflows.index')->with('success', 'Workflow deleted successfully.');
    }
}
