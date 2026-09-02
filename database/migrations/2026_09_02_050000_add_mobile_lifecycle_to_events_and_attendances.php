<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'late_after_minutes')) {
                $table->unsignedSmallInteger('late_after_minutes')->default(15)->after('geofence_enabled');
            }
        });

        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'attendance_uuid')) {
                $table->uuid('attendance_uuid')->nullable()->unique()->after('attendance_id');
            }
            if (!Schema::hasColumn('attendances', 'attendance_time')) {
                $table->timestamp('attendance_time')->nullable()->after('logged_at')->index();
            }
            if (!Schema::hasColumn('attendances', 'sync_time')) {
                $table->timestamp('sync_time')->nullable()->after('attendance_time')->index();
            }
            if (!Schema::hasColumn('attendances', 'sync_status')) {
                $table->string('sync_status', 20)->default('online')->after('status');
            }
            if (!Schema::hasColumn('attendances', 'source')) {
                $table->string('source', 30)->default('web')->after('sync_status');
            }
            if (!Schema::hasColumn('attendances', 'liveness_passed')) {
                $table->boolean('liveness_passed')->default(false)->after('confidence_score');
            }
            if (!Schema::hasColumn('attendances', 'liveness_method')) {
                $table->string('liveness_method', 80)->nullable()->after('liveness_passed');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $columns = [
                'attendance_uuid', 'attendance_time', 'sync_time', 'sync_status',
                'source', 'liveness_passed', 'liveness_method',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('attendances', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'late_after_minutes')) {
                $table->dropColumn('late_after_minutes');
            }
        });
    }
};
