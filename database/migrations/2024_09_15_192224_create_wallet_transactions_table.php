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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 8, 2); // Positive for credit, negative for debit
            $table->string('transaction_type'); // 'credit' or 'debit'
            $table->text('description'); // Reason for the transaction (e.g., refund for canceled booking or booking using wallet)
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null'); // Nullable because it could be a refund or booking
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
