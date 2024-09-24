<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

//route to cancel the booking and send the data into the canceled_booking table
Route::post('/bookings/cancel', [BookingController::class, 'cancelBooking']);
Route::post('/bookings/check-cancel', [BookingController::class, 'checkIfCancelable']);

