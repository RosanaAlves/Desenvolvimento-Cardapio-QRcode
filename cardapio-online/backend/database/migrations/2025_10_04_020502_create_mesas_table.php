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
            $table->enum('status', ['livre', 'ocupada'])->default('livre');
            $table->string('cliente_nome')->nullable();
            $table->enum('status_pagamento', ['aberta', 'fechada', 'paga'])->default('aberta');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mesas');
    }
};