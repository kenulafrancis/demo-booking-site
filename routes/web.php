<?php

use App\Http\Controllers\FacilityController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ScheduleController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

//route to render the BookingHistory.jsx
Route::get('/booking-history', function () {
    return Inertia::render('BookingHistory');
})->middleware(['auth', 'verified'])->name('booking.history');

//route to render the Wallet.jsx
Route::get('/wallet', function () {
    return Inertia::render('Wallet');
})->middleware(['auth', 'verified'])->name('wallet');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Facility Routes
Route::get('/api/facilities', [FacilityController::class, 'index']);  // Fetch all facilities
Route::get('/facilities', [FacilityController::class, 'showFacilitiesPage']);  // Facilities page



require __DIR__.'/auth.php';

// Tennis Reservations and DatePicker Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/tennis-reservations', function () {
        return Inertia::render('TennisReservations');
    })->name('tennis.reservations');

    Route::get('/date-picker', function () {
        return Inertia::render('DatePicker');
    })->name('date.picker');
});


// Route to check user's membership status
Route::middleware(['auth'])->get('/api/user/membership-status', function () {
    return response()->json(['isMember' => auth()->user()->isMember()]);

});

// Member Registration Routes

// Display the member registration form (for setting password)
Route::get('/member/register', function () {
    return Inertia::render('Auth/MemberRegister');  // Point to your Inertia member registration page
})->name('member.register');

// Handle the member registration (password setting)
Route::post('/member/register', [RegisteredUserController::class, 'storeMember'])
    ->name('member.register.submit');

// Route to create Stripe checkout session
Route::post('/api/create-checkout-session', [PaymentController::class, 'createCheckoutSession']);


// Handle success after Stripe payment
Route::get('/payment-success', function () {
    return Inertia::render('PaymentSuccess'); // Render a success page
})->name('payment.success');

use App\Http\Controllers\BookingController;

Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
Route::post('/check-availability', [BookingController::class, 'checkAvailability'])->name('check-availability');


Route::middleware('auth')->get('/api/bookings', [BookingController::class, 'getUserBookings'])->name('bookings.user');


// API route to fetch the specific facility's details (JSON)
Route::get('/api/facilities/{id}', [FacilityController::class, 'getFacilityDetails']);

// Route to render the FacilityDetails.jsx page
Route::get('/facilities/{id}', function ($id) {
    return Inertia::render('FacilityDetails', ['id' => $id]);
});


use App\Http\Controllers\WalletController;

Route::get('/api/wallet', [WalletController::class, 'getWallet']);
//route to do the payment with the wallet
Route::post('/wallet-payment', [WalletController::class, 'processWalletPayment'])->name('wallet.payment');

//route to get the reviews of a facility
Route::get('/api/facilities/{facilityId}/reviews', [ReviewController::class, 'index']);
Route::post('/api/facilities/{facilityId}/write/reviews', [ReviewController::class, 'store'])->middleware('auth');


// Time slot locking/unlocking routes
Route::post('/api/lock-slot', [BookingController::class, 'lockTimeSlot'])->middleware('auth');
Route::post('/check-locked-slots', [BookingController::class, 'checkLockedSlots']);
Route::post('/api/unlock-slot', [BookingController::class, 'unlockTimeSlot'])->middleware('auth');

// Booking session completion and cleanup routes
Route::post('/api/complete-booking', [BookingController::class, 'completeBooking'])->middleware('auth');
Route::post('/api/cleanup-sessions', [BookingController::class, 'cleanUpSessions'])->middleware('auth');

//route to set abandoned booking sessions
Route::post('/api/abandon-session', [BookingController::class, 'abandonSession'])->middleware('auth');
Route::get('/api/check-session-status/{sessionId}', [BookingController::class, 'checkSessionStatus'])->name('checkSessionStatus');

Route::get('/payment-cancel', [PaymentController::class, 'cancelCheckout']);
