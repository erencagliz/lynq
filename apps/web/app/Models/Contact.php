<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


use App\Models\Traits\LogsAudit;
use App\Models\Traits\Filterable;

class Contact extends Model
{
    use SoftDeletes, LogsAudit, Filterable;

    protected $fillable = [
        'tenant_id',
        'account_id',
        'first_name',
        'last_name',
        'title',
        'department',
        'email',
        'phone',
        'mobile_phone',
        'fax',
        'assistant_name',
        'assistant_phone',
        'reports_to',
        'lead_source',
        'birthdate',
        'mailing_street',
        'mailing_city',
        'mailing_state',
        'mailing_postal_code',
        'mailing_country',
        'description',
        'assigned_to',
        'status',
        'created_by',
    ];

    protected $searchableFields = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'mobile_phone',
        'title',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\TenantScope);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function manager()
    {
        return $this->belongsTo(Contact::class, 'reports_to');
    }

    public function subordinates()
    {
        return $this->hasMany(Contact::class, 'reports_to');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
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

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
