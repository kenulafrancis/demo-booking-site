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
        Schema::create('booking_sessions', function (Blueprint $table) {
            $table->id();  // Auto-increment ID
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');  // Link to users table
            $table->foreignId('facility_id')->constrained('facilities')->onDelete('cascade');  // Link to facilities
            $table->string('start_time');  // Store start time in HH:MM format
            $table->string('end_time');  // Store end time in HH:MM format
            $table->date('session_date');  // Date of booking
            $table->enum('session_status', ['active', 'completed', 'abandoned'])->default('active');  // Track status
            $table->timestamps();  // created_at and updated_at timestamps
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_sessions');
    }
};
