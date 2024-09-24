<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('canceled_bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('facility_id');
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('price', 8, 2);
            $table->timestamp('canceled_at');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('cascade');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('canceled_bookings');
    }
};
