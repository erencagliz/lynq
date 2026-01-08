<?php

namespace App\Http\Controllers;

use App\Mail\UserInvitation;
use App\Models\TenantInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class InvitationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'role' => ['required', 'string'],
        ]);

        // Ensure user belongs to a tenant (middleware should handle this, but safe to check)
        $user = $request->user();
        $tenant = $user->tenant;

        if (!$tenant) {
            abort(403, 'User does not belong to a tenant.');
        }

        // Create Invitation
        $invitation = TenantInvitation::create([
            'email' => $request->email,
            'role' => $request->role,
            'token' => Str::random(32),
            'tenant_id' => $tenant->id,
        ]);

        // Generate Signed URL
        $url = URL::signedRoute('invitations.accept', ['token' => $invitation->token]);

        // Send Email
        Mail::to($invitation->email)->send(new UserInvitation($invitation, $url));

        return Redirect::back()->with('success', 'Invitation sent successfully.');
    }

    public function accept(Request $request, $token)
    {
        $invitation = TenantInvitation::where('token', $token)->firstOrFail();

        // Check if user already exists
        $user = User::where('email', $invitation->email)->first();

        if ($user) {
            // User exists, add to tenant directly
// Note: In strict multi-tenancy, a user usually belongs to only one tenant.
// If we support multiple tenants, we would attach here.
// For now, if they are already in a tenant, we might just switch them or reject.
// Let's assume for this MVP, if they have an account, we just switch their tenant_id
// OR error out. The requirement implies "Add to tenant".
// Re-reading plan: "If user exists -> MembershipController::add style logic."
// Since our User model has `tenant_id` (BelongsTo), it's 1:1.
// Replacing tenant_id might be dangerous.
// Ideally we should use Many-to-Many for users-to-tenants if we want multi-tenant users.
// But for this checklist, we are using foreign key `tenant_id`.
// So we will UPDATE their tenant_id.

            $user->update(['tenant_id' => $invitation->tenant_id]);

            // Assign role
// We need to set permission team id first
            setPermissionsTeamId($invitation->tenant_id);

            $role = \Spatie\Permission\Models\Role::firstOrCreate([
                'name' => $invitation->role,
                'tenant_id' => $invitation->tenant_id
            ]);

            $user->roles()->attach($role, ['tenant_id' => $invitation->tenant_id]);

            $invitation->delete();

            return Redirect::route('login')->with('status', 'You have joined the team!');
        }

        // User does not exist, redirect to register with token
        return Inertia::render('Auth/Register', [
            'invitation_token' => $token,
            'email' => $invitation->email,
        ]);
    }

    public function destroy(TenantInvitation $invitation)
    {
        // Ensure invitation belongs to user's tenant
        if ($invitation->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $invitation->delete();

        return Redirect::back()->with('success', 'Invitation revoked successfully.');
    }
}