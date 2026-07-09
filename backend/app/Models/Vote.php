<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    protected $fillable = ['candidate_id', 'voter_hash', 'ip_address'];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}
