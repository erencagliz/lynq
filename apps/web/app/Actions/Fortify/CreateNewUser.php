<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'company_name' => [Rule::requiredIf(!isset($input['invitation_token'])), 'nullable', 'string', 'max:255'],
            'invitation_token' => ['nullable', 'string', 'exists:tenant_invitations,token'],
        ])->validate();

        return \Illuminate\Support\Facades\DB::transaction(function () use ($input) {
            $tenant = null;
            $roleName = 'Admin'; // Default for new companies

            if (isset($input['invitation_token'])) {
                $invitation = \App\Models\TenantInvitation::where('token', $input['invitation_token'])->firstOrFail();

                // Validate email matches invitation
                if ($input['email'] !== $invitation->email) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'email' => ['This email does not match the invitation.'],
                    ]);
                }

                $tenant = $invitation->tenant;
                $roleName = $invitation->role;
            } else {
                $tenant = \App\Models\Tenant::create([
                    'name' => $input['company_name'],
                ]);
            }

            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'tenant_id' => $tenant->id,
            ]);

            $user->refresh(); // Load tenant_id

            setPermissionsTeamId($tenant->id);

            // Ensure role exists for this tenant
            $role = \Spatie\Permission\Models\Role::firstOrCreate([
                'name' => $roleName,
                'tenant_id' => $tenant->id,
            ]);

            $user->roles()->attach($role, ['tenant_id' => $tenant->id]);

            // If it was an invitation, delete it
            if (isset($invitation)) {
                $invitation->delete();
            }

            return $user;
        });
    }
}
