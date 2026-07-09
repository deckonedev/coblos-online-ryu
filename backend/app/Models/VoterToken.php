<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoterToken extends Model
{
    protected $fillable = ['token', 'is_used', 'used_at'];
}
