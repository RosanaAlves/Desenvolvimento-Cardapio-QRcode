<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mesa_id')->constrained()->onDelete('cascade');
            $table->string('cliente_nome');
            $table->string('garcom_nome'); // 🔥 NOME DO GARÇOM
            $table->enum('status', ['pendente', 'preparando', 'pronto', 'entregue', 'cancelado'])->default('pendente');
            $table->decimal('total', 10, 2)->default(0);
            $table->text('observacoes')->nullable();
            // 🔥 CAMPOS DE CANCELAMENTO
            $table->string('cancelado_por')->nullable();
            $table->text('motivo_cancelamento')->nullable();
            $table->timestamp('cancelado_em')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pedidos');
    }
};