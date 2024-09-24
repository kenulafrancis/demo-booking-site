<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;


class FacilityController extends Controller
{

    public function index(): JsonResponse
    {
        // Fetch all facilities
        $facilities = Facility::all();

        // Return the facilities as JSON
        return response()->json($facilities);
    }

    public function showFacilitiesPage(): Response
    {
        return Inertia::render('FacilitiesPage', [
            'auth' => auth()->user(),
        ]);
    }

    public function getFacilityDetails($id): JsonResponse
    {
        $facility = Facility::find($id);

        if (!$facility) {
            Log::error("Facility with ID {$id} not found.");
            return response()->json(['error' => 'Facility not found'], 404);
        }

        return response()->json($facility);
    }


}
