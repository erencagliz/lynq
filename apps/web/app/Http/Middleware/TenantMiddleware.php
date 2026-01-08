<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            if (!$user->tenant_id) {
                // Orphaned user or system admin? 
                // For this starter kit, we enforce every user must have a tenant.
                Auth::logout();
                return redirect()->route('login')->withErrors(['email' => 'User does not belong to any tenant.']);
            }

            // Optionally share tenant with views/Inertia
            // Inertia::share('tenant', $user->tenant);
        }

        return $next($request);
    }
}
