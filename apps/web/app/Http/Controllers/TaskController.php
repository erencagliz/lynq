<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['assignee', 'creator', 'taskable'])
            ->latest()
            ->filter($request->only(['search', 'trashed', 'filter_column', 'filter_operator', 'filter_value']));

        return Inertia::render('tasks/index', [
            'tasks' => $query->get(), // Send all for Kanban for now, or paginate if list view
            'filters' => $request->only(['search', 'filter_column', 'filter_operator', 'filter_value']),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function show(Task $task)
    {
        $historyItems = collect()
            ->merge($task->auditLogs()->with('user')->get()->map(function ($log) {
                $action = "";
                if ($log->event === 'updated') {
                    $changedFields = array_keys($log->new_values ?? []);
                    $action = "Updated fields: " . implode(', ', $changedFields);
                } else {
                    $action = ucfirst($log->event) . " Task";
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

        return Inertia::render('tasks/show', [
            'task' => $task->load(['assignee', 'creator', 'taskable']),
            'history_items' => $historyItems
        ]);
    }

    public function updateStatus(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Pending,Completed,Deferred',
        ]);

        $task->update(['status' => $validated['status']]);

        return back()->with('success', 'Task status updated.');
    }

    public function create()
    {
        return Inertia::render('tasks/create', [
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function edit(Task $task)
    {
        return Inertia::render('tasks/edit', [
            'task' => $task,
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'status' => 'required|string|in:Pending,Completed,Deferred',
            'priority' => 'required|string|in:Low,Normal,High',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
        ]);

        Task::create($validated + [
            'tenant_id' => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return Redirect::route('tasks.index')->with('success', 'Task created successfully.');
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'status' => 'required|string|in:Pending,Completed,Deferred',
            'priority' => 'required|string|in:Low,Normal,High',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
        ]);

        $task->update($validated);

        return Redirect::route('tasks.index')->with('success', 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return Redirect::route('tasks.index')->with('success', 'Task deleted successfully.');
    }
}
