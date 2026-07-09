<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CandidateSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('candidates')->insert([
            [
                'name' => 'Paslon 01: Budi & Iwan',
                'vision' => 'Mewujudkan kesejahteraan bersama.',
                'mission' => 'Meningkatkan ekonomi lokal dan pendidikan.',
                'image_url' => 'https://via.placeholder.com/150',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Paslon 02: Siti & Ani',
                'vision' => 'Transformasi digital untuk semua.',
                'mission' => 'Infrastruktur IT merata dan layanan publik cepat.',
                'image_url' => 'https://via.placeholder.com/150',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
