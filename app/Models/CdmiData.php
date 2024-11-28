<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CdmiData extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'isDelete', 'files'];

    protected $casts = [
        'files' => 'array', // Cast the 'files' field as an array
    ];
}
