<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FingerprintData extends Model
{
    use HasFactory;

    // Specify the table name (optional if it follows Laravel's convention)
    protected $table = 'fingerprint_data';

    // Define the fillable fields
    protected $fillable = [
        'fingerprint',
        'isBlocked',
        'name',
    ];

    // Optionally, if you want to hide certain attributes from being returned, e.g., 'isBlocked' or others
    protected $hidden = [
         // Example of hiding an attribute
        'name', // Example of hiding an attribute
    ];

    // Optionally, you can also cast attributes like 'isBlocked' as boolean
    protected $casts = [
        'isBlocked' => 'boolean',
    ];
}
