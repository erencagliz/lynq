<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\Filterable;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use Filterable, \App\Models\Traits\LogsAudit;

    protected $searchableFields = ['ticket_number', 'subject'];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }
    protected $fillable = [
        'ticket_number',
        'subject',
        'description',
        'status',
        'priority',
        'account_id',
        'contact_id',
        'user_id',
        'tenant_id',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'user_id');
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
