<?php

use App\Http\Controllers\CdmiDataController;
use App\Http\Controllers\RowItemController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\IpInfoController;
use App\Http\Controllers\GooglePhotoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum', 'auto.logout'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/users', UserController::class);
    // Todos
    Route::get('/todos', [TodoController::class, 'index']);
    Route::get('/todos/{id}', [TodoController::class, 'show']);
    Route::post('/todos', [TodoController::class, 'store']);
    Route::put('/todos/{id}', [TodoController::class, 'update']);
    Route::delete('/todos/{id}', [TodoController::class, 'destroy']);    
    
    //  Work
    Route::get('/works', [WorkController::class, 'index']);
    Route::get('/works/{id}', [WorkController::class, 'show']);
    Route::post('/works', [WorkController::class, 'store']);
    Route::put('/works/{id}', [WorkController::class, 'update']);
    Route::delete('/works/{id}', [WorkController::class, 'destroy']);    

    // row-items
    Route::get('/rows', [RowItemController::class, 'index']);          
    Route::post('/row', [RowItemController::class, 'store']);          
    Route::get('/row/{id}', [RowItemController::class, 'show']);       
    Route::put('/row/{id}', [RowItemController::class, 'update']);     
    Route::delete('/row/{id}', [RowItemController::class, 'destroy']);

    // API route for downloading a file
    Route::get('/row/{id}/download/{fileName}', [RowItemController::class, 'download']);
    Route::get('/row/{id}/download', [RowItemController::class, 'downloadZip']);
    
    Route::get('/log', [IpInfoController::class, 'index']);
    Route::delete('/log/{id?}', [IpInfoController::class, 'delete']);
    
    Route::get('/google-photos', [GooglePhotoController::class, 'index']);
    Route::get('/google-photos/{id}', [GooglePhotoController::class, 'show']);
    Route::put('/google-photos/{id}', [GooglePhotoController::class, 'update']);
    
    
});
Route::get('/get-ipinfo', [IpInfoController::class, 'getIpInfo']);

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// store the details like the google info is not protectd
Route::post('/google-photos', [GooglePhotoController::class, 'store']);

// cdmi-data


// Route to create a new CdmiData entry (POST)
Route::post('/cdmi-data', [CdmiDataController::class, 'store']);

// Route to get all CdmiData entries (GET)
Route::get('/cdmi-data', [CdmiDataController::class, 'index']);

// Route to get a specific CdmiData entry by ID (GET)
Route::get('/cdmi-data/{id}', [CdmiDataController::class, 'show']);

// Route to update a specific CdmiData entry by ID (PUT/PATCH)
Route::put('/cdmi-data/{id}', [CdmiDataController::class, 'update']);
Route::patch('/cdmi-data/{id}', [CdmiDataController::class, 'update']); // Optional: If you want to use PATCH too

// Route to delete a specific CdmiData entry by ID (DELETE)
Route::delete('/cdmi-data/{id}', [CdmiDataController::class, 'destroy']);

// Route to download a file from a specific CdmiData entry (GET)
Route::get('/cdmi-data/{id}/download', [CdmiDataController::class, 'download']);

// add Health Route
Route::get('/health', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Application is healthy',
        'timestamp' => now()
    ], 200);
});
