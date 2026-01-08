<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantInvitation extends Model
{
    protected $fillable = [
        'email',
        'role',
        'token',
        'tenant_id',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\TenantScope);
    }
}
