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
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price_member' , 10, 2);
            $table->decimal('price_non_member' , 10, 2);
            $table->string('image_path')->nullable(); // Store the image path
            $table->json('detailed_description')->nullable();
            $table->json('rules_and_regulations')->nullable();
            $table->string('detailed_image_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};
