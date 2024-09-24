<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use libphonenumber\NumberParseException;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     * @throws NumberParseException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['required', 'string'],
        ]);

        $phoneUtil = PhoneNumberUtil::getInstance();
        $parsedPhone = $phoneUtil->parse($request->phone, 'LK'); // null uses the country code included in the phone input
        $formattedPhone = $phoneUtil->format($parsedPhone, PhoneNumberFormat::E164);

        // Validate phone number format
        if (!$phoneUtil->isValidNumber($parsedPhone)) {
            throw ValidationException::withMessages(['phone' => 'The phone number is invalid.']);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone_number' => $formattedPhone, // Save the formatted phone number
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('dashboard');
    }

    // Store member logic where they set a password
    public function storeMember(Request $request): RedirectResponse
    {
        // Validate the input, ensuring that the email already exists
        $request->validate([
            'email' => 'required|string|email|max:255|exists:users,email', // Check if email exists
            'password' => 'required|string|confirmed|min:8',
        ]);

        // Find the user by email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return redirect()->back()->withErrors(['email' => 'Email does not exist in the system. Please contact support.']);
        }

        // Update the password for the existing userS
        $user->password = Hash::make($request->password);
        $user->save();

        // Optionally, resend the email verification notification if not verified
        if (!$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        // Redirect to login
        return redirect()->route('login')->with('status', 'Your password has been set. Please log in.');
    }
}
