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
        Schema::table('contacts', function (Blueprint $table) {
            $table->string('full_name')->virtualAs("TRIM(CONCAT(first_name, ' ', last_name))")->after('last_name');
            $table->string('title')->nullable()->after('full_name');
            $table->string('department')->nullable()->after('title');
            $table->string('mobile_phone')->nullable()->after('phone');
            $table->string('fax')->nullable()->after('mobile_phone');
            $table->string('assistant_name')->nullable()->after('fax');
            $table->string('assistant_phone')->nullable()->after('assistant_name');

            $table->unsignedBigInteger('reports_to')->nullable()->after('assistant_phone');
            $table->foreign('reports_to')->references('id')->on('contacts')->nullOnDelete();

            $table->string('lead_source')->nullable()->after('reports_to');
            $table->date('birthdate')->nullable()->after('lead_source');

            $table->string('mailing_street')->nullable()->after('birthdate');
            $table->string('mailing_city')->nullable()->after('mailing_street');
            $table->string('mailing_state')->nullable()->after('mailing_city');
            $table->string('mailing_postal_code')->nullable()->after('mailing_state');
            $table->string('mailing_country')->nullable()->after('mailing_postal_code');

            $table->text('description')->nullable()->after('mailing_country');

            $table->unsignedBigInteger('assigned_to')->nullable()->after('description');
            $table->foreign('assigned_to')->references('id')->on('users')->nullOnDelete();

            $table->string('status')->default('Active')->after('assigned_to');

            $table->unsignedBigInteger('created_by')->nullable()->after('status');
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            $table->softDeletes()->after('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropForeign(['reports_to']);
            $table->dropForeign(['assigned_to']);
            $table->dropForeign(['created_by']);
            $table->dropColumn([
                'full_name',
                'title',
                'department',
                'mobile_phone',
                'fax',
                'assistant_name',
                'assistant_phone',
                'reports_to',
                'lead_source',
                'birthdate',
                'mailing_street',
                'mailing_city',
                'mailing_state',
                'mailing_postal_code',
                'mailing_country',
                'description',
                'assigned_to',
                'status',
                'created_by',
                'deleted_at'
            ]);
        });
    }
};
