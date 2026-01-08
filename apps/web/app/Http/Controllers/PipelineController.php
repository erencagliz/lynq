<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class PipelineController extends Controller
{
    public function index(Request $request)
    {
        $query = Pipeline::with('stages')->latest();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('pipelines/index', [
            'pipelines' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('pipelines/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'stages' => 'required|array|min:1',
            'stages.*.name' => 'required|string|max:255',
            'stages.*.probability' => 'required|integer|min:0|max:100',
        ]);

        DB::transaction(function () use ($validated) {
            $pipeline = Pipeline::create([
                'tenant_id' => auth()->user()->tenant_id,
                'name' => $validated['name'],
                'is_default' => Pipeline::count() === 0,
            ]);

            foreach ($validated['stages'] as $index => $stageData) {
                $pipeline->stages()->create([
                    'tenant_id' => auth()->user()->tenant_id,
                    'name' => $stageData['name'],
                    'probability' => $stageData['probability'],
                    'sort_order' => $index,
                ]);
            }
        });

        return Redirect::route('pipelines.index')->with('success', 'Pipeline created successfully.');
    }

    public function edit(Pipeline $pipeline)
    {
        return Inertia::render('pipelines/edit', [
            'pipeline' => $pipeline->load('stages'),
        ]);
    }

    public function update(Request $request, Pipeline $pipeline)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'stages' => 'required|array|min:1',
            'stages.*.id' => 'nullable|integer',
            'stages.*.name' => 'required|string|max:255',
            'stages.*.probability' => 'required|integer|min:0|max:100',
        ]);

        DB::transaction(function () use ($validated, $pipeline) {
            $pipeline->update(['name' => $validated['name']]);

            $existingStageIds = collect($validated['stages'])->pluck('id')->filter()->toArray();
            $pipeline->stages()->whereNotIn('id', $existingStageIds)->delete();

            foreach ($validated['stages'] as $index => $stageData) {
                if (isset($stageData['id'])) {
                    $pipeline->stages()->where('id', $stageData['id'])->update([
                        'name' => $stageData['name'],
                        'probability' => $stageData['probability'],
                        'sort_order' => $index,
                    ]);
                } else {
                    $pipeline->stages()->create([
                        'tenant_id' => auth()->user()->tenant_id,
                        'name' => $stageData['name'],
                        'probability' => $stageData['probability'],
                        'sort_order' => $index,
                    ]);
                }
            }
        });

        return Redirect::route('pipelines.index')->with('success', 'Pipeline updated successfully.');
    }

    public function destroy(Pipeline $pipeline)
    {
        // Add check if pipeline has deals before deleting
        if ($pipeline->is_default) {
            return back()->with('error', 'Cannot delete the default pipeline.');
        }

        $pipeline->delete();

        return Redirect::route('pipelines.index')->with('success', 'Pipeline deleted successfully.');
    }

    public function makeDefault(Pipeline $pipeline)
    {
        DB::transaction(function () use ($pipeline) {
            Pipeline::where('tenant_id', auth()->user()->tenant_id)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $pipeline->update(['is_default' => true]);
        });

        return back()->with('success', 'Default pipeline updated.');
    }
}
