<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Schedule;

class ScheduleController extends Controller
{
    public function checkAvailability(Request $request): JsonResponse
    {
        $facilityId = $request->input('facility_id');
        $date = $request->input('date');
        $startTime = $request->input('start_time');
        $endTime = $request->input('end_time');

        $bookedSlots = Schedule::where('facility_id', $facilityId)
            ->where('date', $date)
            ->whereBetween('start_time', [$startTime, $endTime])
            ->where('is_booked', 1)
            ->get();

        return response()->json($bookedSlots);
    }
}
