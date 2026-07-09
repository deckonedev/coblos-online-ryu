<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoterToken;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class TokenController extends Controller
{
    public function index()
    {
        return response()->json(VoterToken::latest()->get());
    }

    public function store(Request $request)
    {
        try {
            $count = (int) $request->input('count', 1);
            if ($count <= 0) $count = 1;
            if ($count > 500) $count = 500; // Allow up to 500 tokens

            $length = (int) $request->input('length', 6);
            if ($length < 1) $length = 1;
            if ($length > 9) $length = 9;

            $pool = '';
            if ($request->boolean('use_numbers', true)) {
                $pool .= '0123456789';
            }
            if ($request->boolean('use_lowercase', false)) {
                $pool .= 'abcdefghijklmnopqrstuvwxyz';
            }
            if ($request->boolean('use_uppercase', true)) {
                $pool .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            }
            if (empty($pool)) {
                $pool = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            }

            $tokens = [];
            $maxIdx = strlen($pool) - 1;

            for ($i = 0; $i < $count; $i++) {
                $attempts = 0;
                do {
                    $tokenStr = '';
                    for ($j = 0; $j < $length; $j++) {
                        $tokenStr .= $pool[random_int(0, $maxIdx)];
                    }
                    $attempts++;
                } while (VoterToken::where('token', $tokenStr)->exists() && $attempts < 20);

                $tokens[] = VoterToken::create([
                    'token' => $tokenStr,
                    'is_used' => false,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => "$count token berhasil dibuat",
                'data' => $tokens
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Token Generation Failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat token: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroyAll()
    {
        VoterToken::truncate();
        return response()->json(['message' => 'Semua token berhasil dihapus']);
    }

    public function restore(Request $request)
    {
        $tokens = $request->input('tokens', []);
        foreach ($tokens as $tokenData) {
            VoterToken::updateOrCreate(
                ['token' => $tokenData['token']],
                ['is_used' => $tokenData['is_used'], 'used_at' => $tokenData['used_at'] ?? null]
            );
        }
        return response()->json(['message' => 'Token berhasil dipulihkan']);
    }

    public function destroy($id)
    {
        VoterToken::destroy($id);
        return response()->json(['message' => 'Token deleted successfully']);
    }
}
