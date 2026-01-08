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
        Schema::dropIfExists('custom_fields');

        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn('custom_fields');
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn('custom_fields');
        });

        Schema::table('deals', function (Blueprint $table) {
            $table->dropColumn('custom_fields');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->string('model_type');
            $table->string('name');
            $table->string('label');
            $table->string('type')->default('text');
            $table->boolean('required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->json('custom_fields')->nullable();
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->json('custom_fields')->nullable();
        });

        Schema::table('deals', function (Blueprint $table) {
            $table->json('custom_fields')->nullable();
        });
    }
};
