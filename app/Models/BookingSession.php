<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static find(mixed $sessionId)
 * @method static create(array $array)
 * @method static where(string $string, string $string1)
 */
class BookingSession extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'facility_id', 'start_time', 'end_time', 'session_date', 'session_status'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }
}
