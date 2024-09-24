<?php

// app/Models/Schedule.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static where(string $string, mixed $facilityId)
 * @method static create(array $array)
 */
class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'facility_id', 'date', 'start_time', 'end_time', 'is_booked'
    ];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
