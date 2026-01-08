<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Traits\Filterable;
use App\Models\Scopes\TenantScope;

class Workflow extends Model
{
    use HasFactory, Filterable;

    protected $fillable = [
        'name',
        'trigger_event',
        'conditions',
        'actions',
        'is_active',
        'user_id',
        'tenant_id',
    ];

    protected $searchableFields = [
        'name',
        'trigger_event',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $casts = [
        'conditions' => 'array',
        'actions' => 'array',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
