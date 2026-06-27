<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('water_readings', function (Blueprint $table) {
            $table->string('id')->primary(); // T1-01-2025-Q2
            $table->string('department_id');
            $table->string('periodo');
            $table->decimal('lectura_inicial', 10, 2);
            $table->decimal('lectura_final', 10, 2);
            $table->decimal('excedente', 10, 2);
            $table->decimal('precio_por_m3', 10, 2);
            $table->decimal('monto_cobrado', 10, 2);
            $table->timestamps();

            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('water_readings');
    }
};
