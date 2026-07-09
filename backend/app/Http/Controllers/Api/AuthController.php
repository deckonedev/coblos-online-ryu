<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VoterToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Admin Login (Password based)
    public function adminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    // Public Voter Login (Token based)
    public function voterLogin(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $voterToken = VoterToken::where('token', $request->token)->first();

        if (!$voterToken) {
            return response()->json(['message' => 'Token tidak valid'], 404);
        }

        if ($voterToken->is_used) {
            return response()->json(['message' => 'Token sudah digunakan'], 403);
        }

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $voterToken->token
        ]);
    }
}
