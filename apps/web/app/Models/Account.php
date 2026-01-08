<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


use App\Models\Traits\LogsAudit;
use App\Models\Traits\Filterable;

class Account extends Model
{
    use SoftDeletes, LogsAudit, Filterable;

    protected $fillable = [
        'tenant_id',
        'parent_id',
        'name',
        'account_type',
        'industry',
        'website',
        'phone',
        'fax',
        'email',
        'address_street',
        'address_city',
        'address_state',
        'address_postal_code',
        'address_country',
        'number_of_employees',
        'annual_revenue',
        'rating',
        'ownership',
        'description',
        'created_by',
        'assigned_to',
        'assigned_to',
        'status',
    ];

    protected $searchableFields = [
        'name',
        'email',
        'phone',
        'industry',
        'website',
        'address_city',
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

    public function parent()
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
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
