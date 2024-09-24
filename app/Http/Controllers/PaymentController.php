<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\BookingSession;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request): JsonResponse
    {
        // Set your secret Stripe API key
        Stripe::setApiKey('sk_test_51Pp88307S2BI5VfCxuTDQQSJua4fHR8XqDI8xEbuK26HJvLxoZsen3QzbZcO9fQWr2tQWWfUHwayS3qtM6cKklqd00iMTUtfQU');

        try {
            // Create a Checkout Session
            $checkoutSession = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'lkr',
                        'product_data' => [
                            'name' => $request->facility . ' Reservation Payment',
                        ],
                        'unit_amount' => $request->totalPrice * 100, // amount in cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => url('/payment-success?session_id={CHECKOUT_SESSION_ID}'),
                'cancel_url' => url('/payment-cancel?session_id=' . $request->session_id),
            ]);

            // Return the checkout session ID to the frontend
            return response()->json([
                'url' => $checkoutSession->url,
                'sessionId' => $checkoutSession->id,
            ]);

        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function cancelCheckout(Request $request)
    {
        $sessionId = $request->query('session_id'); // Get the session ID from the query parameter

        if ($sessionId) {
            // Find the session by its ID
            $session = BookingSession::find($sessionId);

            if ($session) {
                // Update the session status to 'abandoned'
                $session->update(['session_status' => 'abandoned']);

                // Render the PaymentCancel page with a success message
                return inertia('PaymentCancel', [
                    'message' => 'Session marked as abandoned successfully.',
                ]);
            } else {
                // If session is not found, return an error message
                return inertia('PaymentCancel', [
                    'message' => 'Session not found.',
                ]);
            }
        }

        // Handle cases where no session ID is provided
        return inertia('PaymentCancel', [
            'message' => 'No session ID provided.',
        ]);
    }

}
