<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->boolean('disponivel')->default(true)->after('descricao');
        });

        Schema::table('produtos', function (Blueprint $table) {
            $table->boolean('disponivel')->default(true)->after('preco');
        });
    }

    public function down()
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropColumn('disponivel');
        });

        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn('disponivel');
        });
    }
};