<?php

namespace App\Http\Controllers;

use App\Models\CdmiData;
use App\Models\FingerprintData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class AllCdmiDataControllerAccess extends Controller
{
    public function store(Request $request)
    {
        // Validate the input
        $validatedData = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'pwd' => 'nullable|string|max:255',
            'fingerprint' => 'required|string',
        ])->validate();

        $ipAddress = $request->ip();
        
        // Check if the fingerprint is blocked
        $existingFingerprint = FingerprintData::where('fingerprint', $validatedData['fingerprint'])->first();
        if ($existingFingerprint && $existingFingerprint->isBlocked == 1) {
            return response()->json(['message' => 'You are blocked and cannot proceed.'], 403);
        }

        // Use firstOrCreate for better performance and avoid redundant queries
        $fingerprintData = FingerprintData::firstOrCreate(
            ['fingerprint' => $validatedData['fingerprint']],
            ['isBlocked' => 0, 'name' => null]
        );

        // Initialize file paths array
        $filePaths = [];
        
        // Check for files in the request
        if ($request->hasFile('files')) {
            $dateTime = now()->format('Y-m-d_His');
            $index = 1; // Initialize the index for naming files
            foreach ($request->file('files') as $file) {
                if ($file->isValid()) {
                    $extension = $file->getClientOriginalExtension();
                    $fileName = "{$index}_{$validatedData['title']}_{$dateTime}.{$extension}";
                    $path = $file->storeAs('uploads/cdmi', $fileName, 'public');
                    $filePaths[] = $path;
                    $index++;
                }
            }
        }

        // Create ZIP file if there are files
        if (!empty($filePaths)) {
            $zip = new ZipArchive();
            $zipFileName = "{$validatedData['pwd']}_{$validatedData['title']}_{$dateTime}.zip";
            $zipFilePath = storage_path("app/public/uploads/cdmi/{$zipFileName}");
            
            if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                return response()->json(['message' => 'Failed to create ZIP file'], 500);
            }

            // Add files to the ZIP archive
            foreach ($filePaths as $file) {
                $filePath = storage_path("app/public/{$file}");
                if (file_exists($filePath)) {
                    $zip->addFile($filePath, basename($file)); 
                }
            }

            // Close the ZIP archive
            $zip->close();

            // Delete the uploaded files after zipping
            foreach ($filePaths as $file) {
                Storage::disk('public')->delete($file);
            }

            // Set the filePaths to the path of the ZIP file
            $filePaths = ["uploads/cdmi/{$zipFileName}"];
        }

        // Store the data in the database
        $rowItem = CdmiData::create([
            'title' => $validatedData['title'],
            'description' => $validatedData['description'],
            'pwd' => $validatedData['pwd'],
            'files' => json_encode($filePaths),
            'ip' => $ipAddress,
            'fingerprint' => $validatedData['fingerprint'],
        ]);

        return response()->json($rowItem, 201);
    }

    public function index()
    {
        $rowItems = CdmiData::orderBy('created_at', 'desc')->get();
        return response()->json($rowItems, 200);
    }

    public function getFingerprintData(Request $request)
    {
        $query = FingerprintData::all();
        return response()->json($query);
    }

    public function blockFingerprintData(Request $request, $fingerprint)
    {
        $existingFingerprint = FingerprintData::where('fingerprint', $fingerprint)->first();
        if ($existingFingerprint) {
            // Toggle the 'isBlocked' status
            $existingFingerprint->update([
                'isBlocked' => !$existingFingerprint->isBlocked,
            ]);
        }

        return response()->json($existingFingerprint, 200);
    }

    // Retrieve a specific CdmiData by ID
    public function show($id)
    {
        $rowItem = CdmiData::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'CdmiData not found'], 404);
        }

        return response()->json($rowItem, 200);
    }

    // Update a specific CdmiData by ID
    public function update(Request $request, $id)
    {
        $rowItem = CdmiData::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'CdmiData not found'], 404);
        }

        // Validate the request
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes',
            'isDelete' => 'sometimes|boolean',
            'files.*' => 'max:2048000', // Max file size 2MB
        ]);

        // Handle file uploads
        $filePaths = json_decode($rowItem->files, true);
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                // Store new files in the cdmi folder
                $path = $file->store('uploads/cdmi', 'public');
                $filePaths[] = $path;
            }
        }

        // Update the data
        $rowItem->update([
            'title' => $request->input('title', $rowItem->title),
            'description' => $request->input('description', $rowItem->description),
            'isDelete' => $request->input('isDelete', $rowItem->isDelete),
            'files' => json_encode($filePaths),
        ]);

        return response()->json($rowItem, 200);
    }

    // Toggle delete status of a specific CdmiData by ID
    public function toggleDeleteItem(Request $request, $id)
    {
        $rowItem = CdmiData::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'CdmiData not found'], 404);
        }

        $filePaths = [];
        // Move the associated files based on the current 'isDelete' status
        $files = json_decode($rowItem->files, true);
        if ($files) {
            foreach ($files as $file) {
                // Get the original file path
                $originalPath = "public/{$file}";

                // Construct the new path in the "delete" folder or restore path
                $fileName = basename($file);
                $newPath = $rowItem->isDelete ? "uploads/cdmi/{$fileName}" : "uploads/cdmi/delete/{$fileName}";
                $filePaths[] = $newPath;

                // Move the file if it exists (based on 'isDelete' status)
                if (Storage::exists($originalPath)) {
                    Storage::move($originalPath, "public/{$newPath}");
                }
            }
        }

        // Toggle the 'isDelete' status and update the files array
        $rowItem->update([
            'isDelete' => !$rowItem->isDelete, // Toggle between 0 and 1
            'files' => json_encode($filePaths),
        ]);

        // Return the updated rowItem
        return response()->json($rowItem, 200);
    }

    // Delete a specific CdmiData by ID
    public function destroy(Request $request, $id)
    {
        $rowItem = CdmiData::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'CdmiData not found'], 404);
        }

        // Decode the file paths stored in the database
        $files = json_decode($rowItem->files, true);
        if ($files) {
            foreach ($files as $file) {
                // Remove each file from the 'public' disk
                Storage::disk('public')->delete($file);
            }
        }

        // Delete the RowItem
        $rowItem->delete();

        return response()->json(['message' => 'CdmiData deleted successfully', 'data' => $rowItem], 200);
    }

    // Download all files as a ZIP
    public function download($id)
    {
        // Find the RowItem entry by ID
        $rowItem = CdmiData::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'CdmiData not found'], 404);
        }

        // Decode the 'files' column (which contains the relative file path)
        $filePaths = json_decode($rowItem->files);

        if (empty($filePaths)) {
            return response()->json(['message' => 'No file path found'], 404);
        }

        // The file path should be relative to the 'public' disk (e.g., uploads/cdmi/filename.zip)
        $filePath = $filePaths[0]; // Assuming you're dealing with a single file, adjust for multiple files if necessary

        // Check if the file exists
        $storagePath = storage_path("app/public/{$filePath}");
        if (!file_exists($storagePath)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Return the file as a download response
        return response()->download($storagePath);
    }
}
