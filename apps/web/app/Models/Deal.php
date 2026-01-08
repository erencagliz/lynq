<?php

namespace App\Models;

use App\Models\Activity;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use App\Models\Scopes\TenantScope;
use App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Traits\LogsAudit;
use App\Models\Traits\Filterable;

class Deal extends Model
{
    use LogsAudit, Filterable;

    protected $fillable = [
        'tenant_id',
        'pipeline_id',
        'pipeline_stage_id',
        'account_id',
        'contact_id',
        'name',
        'value',
        'currency',
        'currency',
        'expected_close_date',
    ];

    protected $searchableFields = [
        'name',
    ];

    protected $casts = [
        'expected_close_date' => 'date',
        'value' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject')->latest('performed_at');
    }

    public function pipeline(): BelongsTo
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function stage(): BelongsTo
    {
        return $this->belongsTo(PipelineStage::class, 'pipeline_stage_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function tasks()
    {
        return $this->morphMany(Task::class, 'taskable');
    }

    public function notes()
    {
        return $this->morphMany(Note::class, 'notable');
    }

    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
