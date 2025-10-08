<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pedidos', function (Blueprint $table) {
            // Verificar se as colunas já existem antes de adicionar
            if (!Schema::hasColumn('pedidos', 'mesa_id')) {
                $table->foreignId('mesa_id')->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('pedidos', 'cliente_nome')) {
                $table->string('cliente_nome')->nullable();
            }
            if (!Schema::hasColumn('pedidos', 'status')) {
                $table->enum('status', ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado'])->default('pendente');
            }
            if (!Schema::hasColumn('pedidos', 'total')) {
                $table->decimal('total', 8, 2)->default(0);
            }
        });
    }

    public function down()
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn(['mesa_id', 'cliente_nome', 'status', 'total']);
        });
    }
};