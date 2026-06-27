<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->string('id')->primary(); // Support string IDs like AC-M-T1-01-2025-04
            $table->string('department_id');
            $table->date('fecha');
            $table->string('tipo'); // cargo, abono
            $table->string('concepto');
            $table->string('mes_correspondiente'); // YYYY-MM
            $table->string('destino_abono')->nullable();
            $table->decimal('monto', 10, 2);
            $table->timestamps();

            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
