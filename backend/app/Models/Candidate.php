<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    protected $fillable = ['name', 'vision', 'mission', 'image_ketua', 'image_wakil'];

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
}
