<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CandidateController extends Controller
{
    public function index()
    {
        $placeholder = "https://ui-avatars.com/api/?background=0f172a&color=94a3b8&size=512&name=";
        
        $candidates = Candidate::all()->map(function ($candidate) use ($placeholder) {
            $candidate->image_ketua_url = $candidate->image_ketua 
                ? asset('storage/' . $candidate->image_ketua) 
                : $placeholder . urlencode("Ketua");
                
            $candidate->image_wakil_url = $candidate->image_wakil 
                ? asset('storage/' . $candidate->image_wakil) 
                : $placeholder . urlencode("Wakil");
            return $candidate;
        });
        return response()->json($candidates);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'image_ketua' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_wakil' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $data = $request->only(['name', 'vision', 'mission']);

        if ($request->hasFile('image_ketua')) {
            $data['image_ketua'] = $request->file('image_ketua')->store('candidates', 'public');
        }

        if ($request->hasFile('image_wakil')) {
            $data['image_wakil'] = $request->file('image_wakil')->store('candidates', 'public');
        }

        $candidate = Candidate::create($data);

        return response()->json($candidate, 201);
    }

    public function update(Request $request, $id)
    {
        $candidate = Candidate::findOrFail($id);

        $request->validate([
            'name' => 'required|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'image_ketua' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_wakil' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $data = $request->only(['name', 'vision', 'mission']);

        if ($request->hasFile('image_ketua')) {
            if ($candidate->image_ketua) Storage::disk('public')->delete($candidate->image_ketua);
            $data['image_ketua'] = $request->file('image_ketua')->store('candidates', 'public');
        }

        if ($request->hasFile('image_wakil')) {
            if ($candidate->image_wakil) Storage::disk('public')->delete($candidate->image_wakil);
            $data['image_wakil'] = $request->file('image_wakil')->store('candidates', 'public');
        }

        $candidate->update($data);

        return response()->json($candidate);
    }

    public function destroy($id)
    {
        $candidate = Candidate::findOrFail($id);
        
        if ($candidate->image_ketua) {
            Storage::disk('public')->delete($candidate->image_ketua);
        }
        if ($candidate->image_wakil) {
            Storage::disk('public')->delete($candidate->image_wakil);
        }

        $candidate->delete();

        return response()->json(['message' => 'Candidate deleted successfully']);
    }
}
