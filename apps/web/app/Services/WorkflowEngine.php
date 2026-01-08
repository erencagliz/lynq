<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Workflow;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class WorkflowEngine
{
    public function process(string $event, Model $model)
    {
        $workflows = Workflow::where('trigger_event', $event)
            ->where('is_active', true)
            ->get();

        foreach ($workflows as $workflow) {
            if ($this->evaluateConditions($workflow->conditions, $model)) {
                $this->executeActions($workflow->actions, $model);
            }
        }
    }

    protected function evaluateConditions(?array $conditions, Model $model): bool
    {
        if (empty($conditions)) {
            return true;
        }

        foreach ($conditions as $condition) {
            $field = $condition['field'];
            $operator = $condition['operator'];
            $value = $condition['value'];

            // Handle nested relationships (e.g., stage.name) -> simplistic approach for MVP
            $modelValue = $this->getModelValue($model, $field);

            switch ($operator) {
                case '=':
                    if ($modelValue != $value)
                        return false;
                    break;
                case '!=':
                    if ($modelValue == $value)
                        return false;
                    break;
                // Add more operators as needed
                default:
                    return false;
            }
        }

        return true;
    }

    protected function getModelValue(Model $model, string $field)
    {
        if (str_contains($field, '.')) {
            $parts = explode('.', $field);
            $relation = $parts[0];
            $attribute = $parts[1];
            return $model->$relation->$attribute ?? null;
        }
        return $model->$field;
    }

    protected function executeActions(?array $actions, Model $model)
    {
        if (empty($actions)) {
            return;
        }

        foreach ($actions as $action) {
            switch ($action['type']) {
                case 'create_task':
                    $this->createTask($action['params'], $model);
                    break;
                case 'send_email':
                    $this->sendEmail($action['params'], $model);
                    break;
            }
        }
    }

    protected function createTask(array $params, Model $model)
    {
        // Simple variable replacement
        $subject = str_replace('{deal_name}', $model->name ?? 'Deal', $params['subject']);

        Task::create([
            'subject' => $subject,
            'status' => 'Todo',
            'priority' => 'Medium',
            'tenant_id' => $model->tenant_id ?? auth()->user()->tenant_id,
            'created_by' => auth()->id() ?? 1, // Fallback for testing
            'taskable_type' => get_class($model),
            'taskable_id' => $model->id,
        ]);

        Log::info("Workflow: Created task '$subject' for model " . get_class($model) . " {$model->id}");
    }

    protected function sendEmail(array $params, Model $model)
    {
        $subject = str_replace('{deal_name}', $model->name ?? 'Deal', $params['subject']);
        $body = str_replace('{deal_name}', $model->name ?? 'Deal', $params['body']);

        // Ensure the model has a contact email logic. For now, assuming Deal has a related contact or we use a hardcoded/user email.
        // MVP: Send to the currently authenticated user if context is limited, or try to find a contact.
        // Let's assume we want to notify the internal user for now, or if it's external, we need an email field.
        // Let's just log if no email found for now to prevent crash.

        $recipient = auth()->user()->email ?? 'admin@example.com'; // Default to admin/current user for MVP notification

        if (isset($model->contact) && !empty($model->contact->email)) {
            $recipient = $model->contact->email;
        }

        \Illuminate\Support\Facades\Mail::to($recipient)->send(new \App\Mail\WorkflowEmail($subject, $body));

        Log::info("Workflow: Sent email '$subject' to $recipient");
    }
}
