<?php

// app/Models/PriceToken.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'amount', 'expiry_date', 'status'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
