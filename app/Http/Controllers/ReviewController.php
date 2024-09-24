<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Review; // Import the Review model
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index($facilityId): JsonResponse
    {
        // Get reviews for the specified facility
        $reviews = Review::where('facility_id', $facilityId)
            ->with('user') // Eager load the user relationship
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request, $facilityId): JsonResponse
    {
        // Validate the incoming request
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:255',
        ]);

        // Create a new review
        Review::create([
            'facility_id' => $facilityId,
            'user_id' => Auth::id(), // Get the authenticated user's ID
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return response()->json(['message' => 'Review added successfully']);
    }
}
