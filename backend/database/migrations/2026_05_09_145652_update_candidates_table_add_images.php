<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('image_ketua')->nullable()->after('name');
            $table->string('image_wakil')->nullable()->after('image_ketua');
            $table->dropColumn('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('image_url')->nullable();
            $table->dropColumn(['image_ketua', 'image_wakil']);
        });
    }
};
