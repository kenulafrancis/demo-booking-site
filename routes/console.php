<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\Booking;
use App\Models\BookingSession;
use App\Mail\ReviewRequestMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schedule;

// Existing command to inspire every hour
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();


//Schedule to send review request emails after bookings end
Schedule::call(function () {
    $bookings = Booking::where('end_time', '<', now())
        ->where('review_requested', false)
        ->get();

    foreach ($bookings as $booking) {
        $facility = $booking->facility;
        $user = $booking->user;

        // Send review request email
        Mail::to($user->email)->send(new ReviewRequestMail($facility, $booking));

        // Mark the booking as review requested
        $booking->review_requested = true;
        $booking->save();
    }
})->everyMinute()->description('Send review request emails after bookings end');

// Schedule to clean up expired locked time slots
Schedule::call(function () {
    DB::table('locked_slots')->where('locked_until', '<', now())->delete();
})->everySecond()->description('Clean up expired locked time slots');

// Schedule to clean up expired booking sessions and their associated locked slots
Schedule::call(function () {
    $expiredSessions = BookingSession::where('session_status', 'active')
        ->where('created_at', '<', now()->subMinutes(10))
        ->get();

    foreach ($expiredSessions as $session) {
        // Delete associated locked slots
        DB::table('locked_slots')->where('session_id', $session->id)->delete();

        // Mark the session as abandoned
        DB::table('booking_sessions')
            ->where('id', $session->id)
            ->update(['session_status' => 'abandoned']);
    }
})->everySecond()->description('Clean up expired booking sessions and their associated locked slots');
