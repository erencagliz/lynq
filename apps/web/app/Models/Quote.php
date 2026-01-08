<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\Filterable;
use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    use Filterable, \App\Models\Traits\LogsAudit;

    protected $searchableFields = ['quote_number', 'subject'];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }
    protected $fillable = [
        'quote_number',
        'subject',
        'account_id',
        'contact_id',
        'deal_id',
        'status',
        'valid_until',
        'total_amount',
        'currency',
        'notes',
        'tenant_id',
        'owner_id',
    ];

    public function items()
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject')->latest('performed_at');
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
}
