<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('configuracoes', function (Blueprint $table) {
            $table->id();
            $table->string('nome_estabelecimento')->default("Jetro's Lanches");
            $table->string('telefone')->default('99611-2820 | 3822-7097');
            $table->integer('numero_mesas')->default(10);
            $table->boolean('expediente_aberto')->default(false);
            $table->decimal('taxa_servico', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('configuracoes');
    }
};