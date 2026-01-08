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
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('trigger_event'); // e.g., 'deal.updated', 'contact.created'
            $table->json('conditions')->nullable(); // e.g., [{'field': 'status', 'operator': '=', 'value': 'Won'}]
            $table->json('actions')->nullable(); // e.g., [{'type': 'create_task', 'params': {'subject': 'Follow up'}}]
            $table->boolean('is_active')->default(true);
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflows');
    }
};
