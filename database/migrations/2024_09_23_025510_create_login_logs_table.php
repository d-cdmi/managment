<?php

// database/migrations/xxxx_xx_xx_create_login_logs_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLoginLogsTable extends Migration
{
    public function up()
    {
        Schema::create('login_logs', function (Blueprint $table) {
            $table->id();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('ip')->nullable();
            $table->timestamp('login_time');
            $table->string('platform')->nullable();
            $table->string('language')->nullable();
            $table->string('online')->nullable();
            $table->string('screenWidth')->nullable();
            $table->string('screenHeight')->nullable();
            $table->string('cookiesEnabled')->nullable();
            $table->string('hardwareConcurrency')->nullable();
            $table->string('deviceMemory')->nullable();
            $table->string('brands')->nullable();
            $table->string('mobile')->nullable();



            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('login_logs');
    }
}
