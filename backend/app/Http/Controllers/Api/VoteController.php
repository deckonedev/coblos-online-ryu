<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vote;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'token' => 'required|string',
        ]);

        $voterToken = \App\Models\VoterToken::where('token', $validated['token'])
            ->where('is_used', false)
            ->first();

        if (!$voterToken) {
            return response()->json(['message' => 'Token tidak valid atau sudah digunakan'], 403);
        }

        $vote = Vote::create([
            'candidate_id' => $validated['candidate_id'],
            'voter_hash' => $validated['token'], // Use token as unique hash
            'ip_address' => $request->ip(),
        ]);

        // Mark token as used
        $voterToken->update([
            'is_used' => true,
            'used_at' => now(),
        ]);

        return response()->json([
            'message' => 'Vote recorded successfully!',
            'data' => $vote
        ], 201);
    }
}
