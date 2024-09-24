<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static where(string $string, $facilityId)
 * @method static create(array $array)
 */
class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'facility_id',
        'user_id',
        'rating',
        'comment',
    ];

    /**
     * Get the facility that the review belongs to.
     */
    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    /**
     * Get the user who wrote the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
