<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBookingsTable extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Reference to the user
            $table->unsignedBigInteger('facility_id'); // Reference to the facility
            $table->date('booking_date'); // The date of the booking
            $table->time('start_time'); // Start time of the slot
            $table->time('end_time'); // End time of the slot
            $table->decimal('price', 10, 2); // Price for the slot
            $table->boolean('is_paid')->default(false); // Payment status
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
}
