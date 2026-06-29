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
        Schema::create('expenses', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->date('fecha');
            $table->decimal('monto', 10, 2);
            $table->string('concepto');
            $table->foreignId('expense_group_id')->nullable()->constrained('expense_groups')->onDelete('set null');
            $table->foreignId('expense_subgroup_id')->nullable()->constrained('expense_subgroups')->onDelete('set null');
            $table->string('proveedor');
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('set null');
            $table->string('documento')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
