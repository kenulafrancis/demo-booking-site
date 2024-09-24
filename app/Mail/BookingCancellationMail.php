<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class BookingCancellationMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $bookingDetails;

    /**
     * Create a new message instance.
     *
     * @param array $bookingDetails
     */
    public function __construct(array $bookingDetails)
    {
        $this->bookingDetails = $bookingDetails;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build(): static
    {
        return $this->view('emails.booking_cancellation')
            ->subject('Booking Cancellation Confirmation')
            ->with('details', $this->bookingDetails);
    }
}
