<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mesas', function (Blueprint $table) {
            $table->id();
            $table->integer('numero')->unique();
<<<<<<< Updated upstream:cardapio-online/backend/database/migrations/2025_10_04_020502_create_mesas_table.php
            $table->enum('status', ['livre', 'ocupada'])->default('livre');
=======
            $table->enum('status', ['livre', 'ocupada', 'reservada'])->default('livre');
            $table->string('cliente_nome')->nullable();
            $table->enum('status_pagamento', ['aberta', 'fechada', 'paga'])->default('fechada');
>>>>>>> Stashed changes:cardapio-online/backend/database/migrations/2025_10_14_145503_create_mesas_table.php
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mesas');
    }
};