<?php

namespace App\Http\Controllers;

use App\Mail\BookingCancellationMail;
use App\Models\Booking;
use App\Models\BookingSession;
use App\Models\Facility;
use DateTime;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Mail\BookingConfirmationMail;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $user = Auth::user();
        $selectedFacility = $request->input('facility_id');
        $selectedSlots = $request->input('selectedSlots');
        $totalPrice = $request->input('totalPrice');

        // Fetch the booking session
        $sessionId = $request->input('session_id');
        $session = BookingSession::find($sessionId);

        if (!$session || $session->session_status !== 'active') {
            return response()->json(['message' => 'Session is invalid or expired'], 400);
        }

        // Create the booking
        foreach ($selectedSlots as $slot) {
            $startTime24 = DateTime::createFromFormat('h:i A', $slot['start_time'])->format('H:i:s');
            $endTime24 = DateTime::createFromFormat('h:i A', $slot['end_time'])->format('H:i:s');

            Booking::create([
                'user_id' => $userId,
                'facility_id' => $selectedFacility,
                'booking_date' => $slot['date'],
                'start_time' => $startTime24,
                'end_time' => $endTime24,
                'price' => $totalPrice / count($selectedSlots),
                'is_paid' => true,
            ]);
        }

        // Mark the session as completed
        $session->update(['session_status' => 'completed']);

        // Release locked slots
        DB::table('locked_slots')->where('session_id', $sessionId)->delete();

        // Prepare and send confirmation email
        $bookingDetails = [
            'user_name' => $user->name,
            'facility_name' => Facility::find($selectedFacility)->name,
            'date' => $selectedSlots[0]['date'], // Assuming all slots are for the same date
            'time_slots' => $selectedSlots,
            'total_price' => $totalPrice,
        ];

        Mail::to($user->email)->send(new BookingConfirmationMail($bookingDetails));

        return response()->json(['message' => 'Booking created successfully'], 201);
    }
    public function checkAvailability(Request $request): JsonResponse
    {
        $facilityId = $request->input('facility_id');
        $date = $request->input('date');
        $timeSlots = $request->input('timeSlots');
        $bookedSlots = [];

        // Check if time slots are already booked
        foreach ($timeSlots as $slot) {
            $startTime24 = DateTime::createFromFormat('h:i A', $slot['start_time'])->format('H:i:s');
            $endTime24 = DateTime::createFromFormat('h:i A', $slot['end_time'])->format('H:i:s');

            $isBooked = Booking::where('facility_id', $facilityId)
                ->where('booking_date', $date)
                ->where(function ($query) use ($startTime24, $endTime24) {
                    $query->where(function ($q) use ($startTime24, $endTime24) {
                        $q->where('start_time', '<=', $startTime24)
                            ->where('end_time', '>', $startTime24);
                    })
                        ->orWhere(function ($q) use ($startTime24, $endTime24) {
                            $q->where('start_time', '<', $endTime24)
                                ->where('end_time', '>=', $endTime24);
                        });
                })
                ->exists();

            if ($isBooked) {
                $bookedSlots[] = $slot;
            }
        }

        return response()->json($bookedSlots);
    }
    public function getUserBookings(): JsonResponse
    {
        $userId = Auth::id();

        $bookings = Booking::where('user_id', $userId)
            ->with('facility') // Eager load facility details
            ->get();

        return response()->json($bookings);
    }


    /**
     * @throws Exception
     */
    public function checkIfCancelable(Request $request): JsonResponse
    {
        $bookingId = $request->input('booking_id');
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $currentDateTime = new DateTime();
        $bookingStartTime = new DateTime($booking->booking_date . ' ' . $booking->start_time);

        // Calculate the time difference in hours
        $hoursDifference = ($bookingStartTime->getTimestamp() - $currentDateTime->getTimestamp()) / 3600;

        if ($hoursDifference >= 24) {
            // If more than 24 hours before the start time, allow cancellation and refund
            return response()->json(['can_cancel' => true, 'within_24_hours' => true], 200);
        } else {
            // If within 24 hours, allow cancellation but notify no refund
            return response()->json(['can_cancel' => true, 'within_24_hours' => false], 200);
        }
    }


    /**
     * @throws Exception
     */

    public function cancelBooking(Request $request): JsonResponse
    {
        $bookingId = $request->input('booking_id');
        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $currentDateTime = new DateTime();
        $bookingStartTime = new DateTime($booking->booking_date . ' ' . $booking->start_time);

        // Calculate the time difference in hours
        $hoursDifference = ($bookingStartTime->getTimestamp() - $currentDateTime->getTimestamp()) / 3600;

        if ($hoursDifference >= 24) {
            try {
                // Move booking to canceled_bookings table and credit wallet
                DB::table('canceled_bookings')->insert([
                    'user_id' => $booking->user_id,
                    'facility_id' => $booking->facility_id,
                    'booking_date' => $booking->booking_date,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'price' => $booking->price,
                    'canceled_at' => now(),
                ]);

                DB::table('wallet_transactions')->insert([
                    'user_id' => $booking->user_id,
                    'amount' => $booking->price,
                    'transaction_type' => 'credit',
                    'description' => 'Refund for canceled booking',
                    'booking_id' => $booking->id,
                    'created_at' => now(),
                ]);

                // Prepare booking details for email
                $bookingDetails = [
                    'user_name' => $booking->user->name,
                    'facility_name' => Facility::find($booking->facility_id)->name,
                    'date' => $booking->booking_date,
                    'time_slots' => [
                        ['start_time' => $booking->start_time, 'end_time' => $booking->end_time],
                    ]
                ];

                // Send cancellation email
                Mail::to($booking->user->email)->send(new BookingCancellationMail($bookingDetails));

                // Delete the booking from bookings table
                $booking->delete();

                return response()->json(['message' => 'Booking canceled and wallet credited'], 200);
            } catch (Exception $e) {
                Log::error('Wallet transaction failed: ' . $e->getMessage());
                return response()->json(['message' => 'Failed to credit wallet.'], 500);
            }
        } else {
            // Even though it's past 24 hours, allow cancellation without refund
            try {
                DB::table('canceled_bookings')->insert([
                    'user_id' => $booking->user_id,
                    'facility_id' => $booking->facility_id,
                    'booking_date' => $booking->booking_date,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'price' => $booking->price,
                    'canceled_at' => now(),
                ]);

                // Prepare booking details for email
                $bookingDetails = [
                    'user_name' => $booking->user->name,
                    'facility_name' => Facility::find($booking->facility_id)->name,
                    'date' => $booking->booking_date,
                    'time_slots' => [
                        ['start_time' => $booking->start_time, 'end_time' => $booking->end_time],
                    ]
                ];

                // Send cancellation email
                Mail::to($booking->user->email)->send(new BookingCancellationMail($bookingDetails));

                $booking->delete();

                return response()->json(['message' => 'Booking canceled without refund'], 200);
            } catch (Exception $e) {
                Log::error('Cancellation failed: ' . $e->getMessage());
                return response()->json(['message' => 'Failed to cancel booking.'], 500);
            }
        }
    }


    public function lockTimeSlot(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $facilityId = $request->input('facility_id');
        $slot = $request->input('slot');
        $date = $slot['date'];
        $startTime12 = $slot['startTime'];
        $endTime12 = $slot['endTime'];

        // Convert 12-hour times to 24-hour format
        $startTime24 = DateTime::createFromFormat('h:i A', $startTime12)->format('H:i:s');
        $endTime24 = DateTime::createFromFormat('h:i A', $endTime12)->format('H:i:s');

        // Check if a session ID is passed, if yes, use the existing session
        $sessionId = $request->input('session_id');
        if (!$sessionId) {
            // Check for an existing lock for the user and facility on the same date
            $existingLock = DB::table('locked_slots')
                ->where('facility_id', $facilityId)
                ->where('date', $date)
                ->where('user_id', $userId)
                ->first();

            if ($existingLock) {
                // Return existing session ID for subsequent slot locking
                $sessionId = $existingLock->session_id;
            } else {
                // Create a new session if no existing one
                $session = BookingSession::create([
                    'user_id' => $userId,
                    'facility_id' => $facilityId,
                    'start_time' => $startTime24,
                    'end_time' => $endTime24,
                    'session_date' => $date,
                    'session_status' => 'active',
                ]);
                $sessionId = $session->id;
            }
        }

        // Check if the time slot is already locked, excluding the current user's locks
        $isLockedByAnotherUser = DB::table('locked_slots')
            ->where('facility_id', $facilityId)
            ->where('date', $date)
            ->where(function ($query) use ($startTime24, $endTime24) {
                $query->where(function ($q) use ($startTime24, $endTime24) {
                    $q->where('start_time', '<=', $startTime24)
                        ->where('end_time', '>', $startTime24);
                })
                    ->orWhere(function ($q) use ($startTime24, $endTime24) {
                        $q->where('start_time', '<', $endTime24)
                            ->where('end_time', '>=', $endTime24);
                    });
            })
            ->where('locked_until', '>', now())
            ->where('user_id', '!=', $userId) // Exclude current user's locks
            ->exists();

        if ($isLockedByAnotherUser) {
            return response()->json(['message' => 'Time slot is already locked by another user'], 409);
        }

        // Lock the time slot and associate it with the session
        DB::table('locked_slots')->insert([
            'user_id' => $userId,
            'facility_id' => $facilityId,
            'date' => $date,
            'start_time' => $startTime24,
            'end_time' => $endTime24,
            'session_id' => $sessionId,
            'locked_until' => now()->addMinutes(5),
        ]);

        return response()->json(['message' => 'Time slot locked successfully', 'session_id' => $sessionId], 200);
    }


    public function unlockTimeSlot(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $facilityId = $request->input('facility_id');
        $slot = $request->input('slot');
        $startTime24 = DateTime::createFromFormat('h:i A', $slot['startTime'])->format('H:i:s');
        $endTime24 = DateTime::createFromFormat('h:i A', $slot['endTime'])->format('H:i:s');
        $date = $slot['date'];

        DB::table('locked_slots')->where([
            ['facility_id', $facilityId],
            ['date', $date],
            ['start_time', $startTime24],
            ['end_time', $endTime24],
            ['user_id', $userId]
        ])->delete();

        return response()->json(['message' => 'Time slot unlocked successfully'], 200);
    }

    public function checkLockedSlots(Request $request): JsonResponse
    {
        $facilityId = $request->input('facilityId');
        $selectedSlots = $request->input('selectedSlots');
        $userId = Auth::id();
        $lockedSlots = [];

        foreach ($selectedSlots as $slot) {
            $startTime24 = DateTime::createFromFormat('h:i A', $slot['startTime'])->format('H:i:s');
            $endTime24 = DateTime::createFromFormat('h:i A', $slot['endTime'])->format('H:i:s');
            $date = $slot['date'];

            $isLocked = DB::table('locked_slots')
                ->where('facility_id', $facilityId)
                ->where('date', $date)
                ->where(function ($query) use ($startTime24, $endTime24) {
                    $query->where(function ($q) use ($startTime24, $endTime24) {
                        $q->where('start_time', '<=', $startTime24)
                            ->where('end_time', '>', $startTime24);
                    })
                        ->orWhere(function ($q) use ($startTime24, $endTime24) {
                            $q->where('start_time', '<', $endTime24)
                                ->where('end_time', '>=', $endTime24);
                        });
                })
                ->where('locked_until', '>', now())
                ->where('user_id', '!=', $userId) // Exclude current user's locks
                ->get();

            if ($isLocked->count()) {
                foreach ($isLocked as $lockedSlot) {
                    $lockedSlots[] = [
                        'startTime' => $lockedSlot->start_time,
                        'endTime' => $lockedSlot->end_time,
                        'date' => $lockedSlot->date,
                    ];
                }
            }
        }

        return response()->json([
            'locked' => !empty($lockedSlots),
            'lockedSlots' => $lockedSlots
        ], 200);
    }

    public function completeBooking(Request $request): JsonResponse
    {
        $sessionId = $request->input('session_id');
        $totalPrice = $request->input('totalPrice');

        // Mark session as completed
        DB::table('booking_sessions')
            ->where('id', $sessionId)
            ->update(['session_status' => 'completed']);

        // Remove the lock for the session
        DB::table('locked_slots')
            ->where('session_id', $sessionId)
            ->delete();

        // Continue with other booking logic like charging the user and sending confirmation
        return response()->json(['message' => 'Booking completed successfully'], 200);
    }

    public function cleanUpSessions(): void
    {
        $expiredSessions = BookingSession::where('session_status', 'active')
            ->where('created_at', '<', now()->subMinutes(10))
            ->get();

        foreach ($expiredSessions as $session) {
            Log::info('Cleaning up session ID: ' . $session->id);

            // Clean up associated locked slots
            DB::table('locked_slots')->where('session_id', $session->id)->delete();

            // Update session status to abandoned
            $session->update(['session_status' => 'abandoned']);
        }
    }

    public function abandonSession(Request $request): JsonResponse
    {
        $sessionId = $request->input('session_id');

        // Update the session status to abandoned
        DB::table('booking_sessions')
            ->where('id', $sessionId)
            ->update(['session_status' => 'abandoned']);

        // Clean up any locked slots associated with the session
        DB::table('locked_slots')
            ->where('session_id', $sessionId)
            ->delete();

        return response()->json(['message' => 'Session abandoned successfully'], 200);
    }

    public function checkSessionStatus($sessionId): JsonResponse
    {
        $session = BookingSession::find($sessionId);

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        // Return the session status
        return response()->json(['session_status' => $session->session_status], 200);
    }
}
