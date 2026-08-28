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
        Schema::create('students', function (Blueprint $table) {
            $table->unsignedInteger('student_id')->autoIncrement();

            // Academic & Identity Info
            $table->string('student_number', 15)->unique();
            $table->string('surname', 30)->nullable();
            $table->string('firstname', 30)->nullable();
            $table->string('middlename', 30)->nullable();
            $table->string('ext', 10)->nullable();
            $table->string('email', 100)->nullable();

            // Program / Academic Links
            $table->unsignedInteger('degree_id')->nullable();
            $table->unsignedInteger('curricula_id')->nullable();
            $table->unsignedInteger('entrance_status')->default(1);
            $table->text('rfid')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Form 5 Parsed Metadata Fields
            |--------------------------------------------------------------------------
            */
            $table->string('degree')->nullable();
            $table->string('year_section')->nullable();
            $table->string('semester')->nullable();
            $table->string('academic_year')->nullable();

            /*
            |--------------------------------------------------------------------------
            | OCR & Facial Liveness Verification Fields
            |--------------------------------------------------------------------------
            */
            // Path to saved Form 5 PDF document
            $table->string('form_5_path')->nullable();

            // Path to reference photo for future facial liveness checks
            $table->string('face_photo_path')->nullable();

            // Vector matrix/keypoints array from MediaPipe for fast face matching
            $table->json('face_embedding')->nullable();

            // Status tracking for automated/manual verification workflow
            $table->enum('verification_status', [
                'pending_verification',
                'pending',
                'verified',
                'rejected',
                'manual_review'
            ])->default('pending_verification');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};