<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\VoterToken;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index()
    {
        $candidateStats = Candidate::withCount('votes')->get()->map(function ($candidate) {
            return [
                'name' => $candidate->name,
                'votes' => $candidate->votes_count,
            ];
        });

        $totalTokens = VoterToken::count();
        $usedTokens = VoterToken::where('is_used', true)->count();
        $unusedTokens = $totalTokens - $usedTokens;

        return response()->json([
            'candidates' => $candidateStats,
            'summary' => [
                'total_tokens' => $totalTokens,
                'used_tokens' => $usedTokens,
                'unused_tokens' => $unusedTokens,
                'participation_rate' => $totalTokens > 0 ? round(($usedTokens / $totalTokens) * 100, 1) : 0,
            ]
        ]);
    }
}
