<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Activity;
use App\Models\Task;

use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\LogsAudit;
use App\Models\Scopes\TenantScope;

class Lead extends Model
{
    use SoftDeletes, LogsAudit;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $fillable = [
        'tenant_id',
        'user_id', // Owner
        'first_name',
        'last_name',
        'title',
        'company',
        'email',
        'phone',
        'status', // New, Contacted, Qualified, Lost
        'source',
        'address',
        'city',
        'state',
        'zip',
        'country',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
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
