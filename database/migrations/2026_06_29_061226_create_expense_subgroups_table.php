<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('expense_subgroups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_group_id')->constrained('expense_groups')->onDelete('cascade');
            $table->string('nombre');
            $table->timestamps();

            $table->unique(['expense_group_id', 'nombre']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_subgroups');
    }
};
