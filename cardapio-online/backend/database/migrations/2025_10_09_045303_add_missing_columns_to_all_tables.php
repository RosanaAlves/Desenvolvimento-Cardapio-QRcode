<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Adicionar coluna 'disponivel' à tabela categorias
        if (Schema::hasTable('categorias') && !Schema::hasColumn('categorias', 'disponivel')) {
            Schema::table('categorias', function (Blueprint $table) {
                $table->boolean('disponivel')->default(true);
            });
        }

        // Adicionar coluna 'disponivel' à tabela produtos
        if (Schema::hasTable('produtos') && !Schema::hasColumn('produtos', 'disponivel')) {
            Schema::table('produtos', function (Blueprint $table) {
                $table->boolean('disponivel')->default(true);
            });
        }

        // Criar tabela mesas se não existir
        if (!Schema::hasTable('mesas')) {
            Schema::create('mesas', function (Blueprint $table) {
                $table->id();
                $table->integer('numero')->unique();
                $table->enum('status', ['livre', 'ocupada'])->default('livre');
                $table->string('cliente_nome')->nullable();
                $table->enum('status_pagamento', ['aberta', 'fechada', 'paga'])->default('aberta');
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        // Reverter as mudanças se necessário
        if (Schema::hasColumn('categorias', 'disponivel')) {
            Schema::table('categorias', function (Blueprint $table) {
                $table->dropColumn('disponivel');
            });
        }

        if (Schema::hasColumn('produtos', 'disponivel')) {
            Schema::table('produtos', function (Blueprint $table) {
                $table->dropColumn('disponivel');
            });
        }
    }
};