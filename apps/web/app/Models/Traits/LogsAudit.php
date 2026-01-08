<?php

namespace App\Models\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

trait LogsAudit
{
    protected static function bootLogsAudit()
    {
        static::created(function ($model) {
            $model->recordAudit('created');
        });

        static::updated(function ($model) {
            $model->recordAudit('updated');
        });

        static::deleted(function ($model) {
            $model->recordAudit('deleted');
        });
    }

    public function recordAudit(string $event)
    {
        $oldValues = $event === 'updated' ? array_intersect_key($this->getOriginal(), $this->getDirty()) : null;
        $newValues = $event === 'updated' ? $this->getDirty() : ($event === 'created' ? $this->getAttributes() : null);

        // Remove timestamps from audit
        if ($oldValues) {
            unset($oldValues['created_at'], $oldValues['updated_at'], $oldValues['deleted_at']);
        }
        if ($newValues) {
            unset($newValues['created_at'], $newValues['updated_at'], $newValues['deleted_at']);
        }

        if (empty($newValues) && $event === 'updated') {
            return;
        }

        AuditLog::create([
            'tenant_id' => $this->tenant_id ?? auth()->user()->tenant_id ?? null,
            'auditable_id' => $this->id,
            'auditable_type' => get_class($this),
            'user_id' => auth()->id(),
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'auditable');
    }
}
