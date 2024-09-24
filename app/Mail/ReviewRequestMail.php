<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReviewRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $facility;
    public $booking;

    public function __construct($facility, $booking)
    {
        $this->facility = $facility;
        $this->booking = $booking;
    }

    public function build()
    {
        return $this->subject('Tell us about your experience at ' . $this->facility->name)
            ->view('emails.reviewRequest')
            ->with([
                'facility' => $this->facility,
                'booking' => $this->booking,
            ]);
    }
}
