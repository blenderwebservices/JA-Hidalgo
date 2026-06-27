<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->string('id')->primary(); // T1-01, T2-L1, etc.
            $table->string('torre');
            $table->string('tipo');
            $table->string('numero');
            $table->string('contacto_nombre')->nullable();
            $table->string('contacto_rol')->default('propietario');
            $table->string('contacto_email')->nullable();
            $table->string('contacto_celular')->nullable();
            $table->text('notas')->nullable();
            $table->string('status')->default('normal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
