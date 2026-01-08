<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Note: In a multi-tenant setup with 'teams' enabled, roles are usually created PER TENANT.
        // However, we can define global permissions or just rely on dynamic role creation during tenant registration.
        // For this seeder, we'll demonstrate creating roles for a specific tenant if needed, or just leave it basics.

        // Actually, with 'teams' => true, Role::create(['name' => 'Admin']) requires a team_id (tenant_id).
        // So this seeder might only be useful for testing or seeding a demo tenant.
        // We will primarily rely on CreateNewUser action to create roles for new tenants.

        // Example permission (global) if we want? No, permissions usually are global or per team too. 
        // With teams=true, permissions are also scoped to team_id in strict mode usually, 
        // but typically permissions are global definitions and roles are per-team.

        // Wait, Spatie documentation says: "If you want to use the same permissions across all teams, you can create them with a null team_id."
        // Let's create some global permissions.

        Permission::firstOrCreate(['name' => 'manage users', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'manage billing', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'view reports', 'guard_name' => 'web']);
    }
}
