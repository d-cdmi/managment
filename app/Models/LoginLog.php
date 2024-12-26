<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'password',
        'ip',
        'login_time',
        'platform',
        'language',
        'online',
        'screenWidth',
        'screenHeight',
        'cookiesEnabled',
        'hardwareConcurrency',
        'deviceMemory',
        'brands',
        'mobile',
    ];
}
