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
            $table->integer('capacidade')->default(4);
            $table->enum('status', ['livre', 'ocupada'])->default('livre');
            $table->enum('status_pagamento', ['aberta', 'fechada', 'paga'])->default('aberta');
            $table->string('garcom_nome')->nullable();
            $table->boolean('disponivel')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mesas');
    }
};