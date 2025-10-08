<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('mesas', function (Blueprint $table) {
            $table->string('cliente_nome')->nullable()->after('numero');
            $table->enum('status_pagamento', ['aberta', 'fechada', 'paga'])->default('aberta')->after('status');
        });
    }

    public function down()
    {
        Schema::table('mesas', function (Blueprint $table) {
            $table->dropColumn(['cliente_nome', 'status_pagamento']);
        });
    }
};