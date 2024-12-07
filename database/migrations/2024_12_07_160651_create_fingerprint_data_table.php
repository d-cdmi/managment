<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFingerprintDataTable extends Migration
{
    public function up()
    {
        Schema::create('fingerprint_data', function (Blueprint $table) {
            $table->id(); // Primary key 'id'
            $table->string('fingerprint')->unique(); // Fingerprint is unique
            $table->string('name')->nullable(); // Name is nullable
            $table->integer('isBlocked')->default(0); // isBlocked, default value 0
            $table->timestamps(); // Created at and Updated at
        });
    }

    public function down()
    {
        Schema::dropIfExists('fingerprint_data');
    }
}

