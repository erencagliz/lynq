<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_id')->nullable()->after('tenant_id');
            $table->string('account_type')->nullable()->after('name');
            $table->string('industry')->nullable()->change(); // Already exists but ensuring it's nullable
            $table->string('phone')->nullable()->after('industry');
            $table->string('fax')->nullable()->after('phone');
            $table->string('email')->nullable()->after('fax');
            $table->string('address_street')->nullable()->after('email');
            $table->string('address_city')->nullable()->after('address_street');
            $table->string('address_state')->nullable()->after('address_city');
            $table->string('address_postal_code')->nullable()->after('address_state');
            $table->string('address_country')->nullable()->after('address_postal_code');
            $table->integer('number_of_employees')->nullable()->after('address_country');
            $table->decimal('annual_revenue', 15, 2)->nullable()->after('number_of_employees');
            $table->string('rating')->nullable()->after('annual_revenue');
            $table->string('ownership')->nullable()->after('rating');
            $table->text('description')->nullable()->after('ownership');
            $table->unsignedBigInteger('created_by')->nullable()->after('description');
            $table->unsignedBigInteger('assigned_to')->nullable()->after('created_by');
            $table->string('status')->default('Active')->after('assigned_to');
            $table->softDeletes()->after('updated_at');

            // Foreign keys
            $table->foreign('parent_id')->references('id')->on('accounts')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['assigned_to']);

            $table->dropColumn([
                'parent_id',
                'account_type',
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
                'status',
                'deleted_at',
            ]);
        });
    }
};
