<?php

// app/Models/Booking.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static create(array $array)
 * @method static where(string $string, mixed $facilityId)
 * @method static find(mixed $bookingId)
 */
class Booking extends Model
{
    use HasFactory;

    // Specify the table name if it's not the pluralized form of the model name
    protected $table = 'bookings';

    // The attributes that are mass assignable
    protected $fillable = [
        'user_id',
        'facility_id',
        'booking_date',
        'start_time',
        'end_time',
        'price',
        'is_paid',
        'review_requested',  // Add this to allow mass assignment
    ];

    /**
     * Define a relationship to the User model
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Define a relationship to the Facility model
     */

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

}

