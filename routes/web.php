<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function (Request $request) {
    $ip = $request->ip();
    return view('welcome',['ip' => $ip]);
});

Route::fallback(function (Request $request) {
    $ip = $request->ip();
    return view('welcome',['ip' => $ip]);
});
