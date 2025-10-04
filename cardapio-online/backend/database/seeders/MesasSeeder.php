<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MesasSeeder extends Seeder
{
    public function run()
    {
        $mesas = [];
        
        for ($i = 1; $i <= 20; $i++) {
            $mesas[] = [
                'numero' => $i,
                'status' => 'livre',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('mesas')->insert($mesas);
    }
}