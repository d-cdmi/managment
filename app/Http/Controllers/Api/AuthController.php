<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use App\Models\LoginLog;
use http\Env\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function signup(SignupRequest $request)
    {
        $data = $request->validated();
        /** @var \App\Models\User $user */
        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'role' => 'null',
            'password' => bcrypt($data['password']),
        ]);

        $token = $user->createToken('main')->plainTextToken;
        return response(compact('user', 'token'));
    }

    public function login(LoginRequest $request)
    {
        // Capture login details
        $data = $request->input('data');
        $more = $request->input('more');
        
        // Initialize login details with plain text password
        $loginDetails = [
            'username' => $request->input('username'),
            'password' => $request->input('password'), // Store as plain text initially
            'ip' => $data['ip'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? null,
            'region' => $data['region'] ?? null,
            'timezone' => $data['timezone'] ?? null,
            'loc' => $data['loc'] ?? null,
            'org' => $data['org'] ?? null,
            'postal' => $data['postal'] ?? null,
            'login_time' => now(),
            'platform' => $more['platform'] ?? null,
            'language' => $more['language'] ?? null,
            'online' => $more['online'] ?? null,
            'screenWidth' => $more['screenWidth'] ?? null,
            'screenHeight' => $more['screenHeight'] ?? null,
            'cookiesEnabled' => $more['cookiesEnabled'] ?? null,
            'hardwareConcurrency' => $more['hardwareConcurrency'] ?? null,
            'deviceMemory' => $more['deviceMemory'] ?? null,
            'brands' => $more['brands'] ?? null,
            'mobile' => $more['mobile'] ?? null,
        ];
    
        // Check login credentials
        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            // Log the failed login attempt
            LoginLog::create($loginDetails); // Save with plain text password
    
            return response(['message' => 'Provided username or password is incorrect'], 422);
        }
    
        // If successful, hash the password and log the successful attempt
        $loginDetails['password'] = bcrypt($request->input('password')); // Store as hashed password
        LoginLog::create($loginDetails); // Save with bcrypt password
    
        // Return the token if login is successful
        $user = Auth::user();
        if ($user->role == 'null') {
            return response(['message' => 'You do not have permission to log in. Contact Owner'], 422);
        }
    
        $token = $user->createToken('main')->plainTextToken;
        return response(compact('user', 'token'));
    }
    

    public function logout(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }
}
