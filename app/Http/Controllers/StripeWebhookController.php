<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    public function handleStripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = env('STRIPE_WEBHOOK_SECRET'); // Set this in your .env file

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Only handle the 'checkout.session.completed' event
        if ($event->type == 'checkout.session.completed') {
            $session = $event->data->object;

            // Assuming the session has a `client_reference_id` for the user ID
            $userId = $session->client_reference_id;
            $facilityId = $session->metadata->facility_id;

            // Log event for debugging
            Log::info('Payment successful for user ' . $userId . ', Facility ID: ' . $facilityId);

            // Update the bookings as paid for the user and facility
            Booking::where('user_id', $userId)
                ->where('facility_id', $facilityId)
                ->where('is_paid', false) // Only unpaid bookings
                ->update(['is_paid' => true]);
        }

        return response()->json(['status' => 'success'], 200);
    }
}
