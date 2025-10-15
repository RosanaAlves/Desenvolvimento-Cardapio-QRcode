<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('expedientes', function (Blueprint $table) {
            $table->id();
            $table->date('data');
            $table->dateTime('inicio');
            $table->dateTime('fim')->nullable();
            $table->decimal('total_vendido', 10, 2)->default(0);
            $table->integer('total_pedidos')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('expedientes');
    }
};