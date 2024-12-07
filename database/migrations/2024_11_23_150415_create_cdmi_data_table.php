<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCdmiDataTable extends Migration
{
    public function up()
    {
        Schema::create('cdmi_data', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('isDelete')->default(0);;
            $table->json('files')->nullable(); // Store file paths as a JSON array
            $table->text('pwd')->nullable();
            $table->text('ip')->nullable();
            $table->text('fingerprint')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cdmi_data');
    }
}