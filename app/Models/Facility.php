<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


/**
 * @method static find(array|string $facilityId)
 * @method static findOrFail($id)
 * @method static where(string $string, mixed $facility)
 */
class Facility extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description','price_member' , 'price_non_member','image_path','detailed_description','detailed_image_path','rules_and_regulations'];

    protected $casts = [
        'detailed_description' => 'array',
        'rules_and_regulations' => 'array',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Get the reviews for the facility.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

}
