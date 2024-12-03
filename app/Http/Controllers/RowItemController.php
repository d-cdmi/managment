<?php

namespace App\Http\Controllers;

use App\Models\RowItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RowItemController extends Controller
{
    // Create a new RowItem
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'files.*' => 'max:4048000' // Max size 2GB
        ]);

        // Handle file uploads
        $filePaths = [];
        if ($request->hasFile('files')) {
            $index = 1;
        if ($request->hasFile('files')) {
            $index = 1;
            foreach ($request->file('files') as $file) {
                if ($file->isValid()) {

                    $extension = $file->getClientOriginalExtension();
                    $dateTime = now()->format('Y-m-d_His');
                    $fileName = "{$index}_{$request->author}_{$request->title}_{$dateTime}.{$extension}";

                    // Store the file with the new name in the 'uploads/cdmi' folder
                    $path = $file->storeAs('uploads', $fileName, 'public');
                    $filePaths[] = $path;

                    // Increment the index for the next file
                    $index++;
                } 
            }
        } 
        } 

        // Store the data
        $rowItem = RowItem::create([
            'title' => $request->title,
            'description' => $request->description,
            'author' => $request->author,
            'files' => json_encode($filePaths),
        ]);

        return response()->json($rowItem, 201);
    }

    // Retrieve all RowItems
    public function index()
    {
        $rowItems = RowItem::orderBy('created_at', 'desc')->get();
        return response()->json($rowItems, 200);
    }
    
    // Retrieve a specific RowItem by ID
    public function show($id)
    {
        $rowItem = RowItem::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'RowItem not found'], 404);
        }

        return response()->json($rowItem, 200);
    }

    // Update a specific RowItem by ID
    public function update(Request $request, $id)
    {
        $rowItem = RowItem::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'RowItem not found'], 404);
        }

        // Validate the request
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes',
            'author' => 'sometimes|required|string|max:255',
            'files.*' => 'max:4048000' // Max size 2GB
        ]);

        // Handle file uploads
        $filePaths = json_decode($rowItem->files, true);
        if($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('uploads', 'public');
                $filePaths[] = $path;
            }
        }

        // Update the data
        $rowItem->update([
            'title' => $request->input('title', $rowItem->title),
            'description' => $request->input('description', $rowItem->description),
            'author' => $request->input('author', $rowItem->author),
            'files' => json_encode($filePaths),
        ]);

        return response()->json($rowItem, 200);
    }

    // Delete a specific RowItem by ID
    public function destroy($id)
    {
        $rowItem = RowItem::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'RowItem not found'], 404);
        }

        // Delete associated files
        $files = json_decode($rowItem->files, true);
        if ($files) {
            foreach ($files as $file) {
                Storage::disk('public')->delete($file);
            }
        }

        // Delete the RowItem
        $rowItem->delete();

        return response()->json(['message' => 'RowItem deleted successfully'], 200);
    }
    // Download a file
    public function download($id, $fileName)
    {
        // Find the RowItem by ID
        $rowItem = RowItem::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'RowItem not found'], 404);
        }

        // Decode the file paths
        $files = json_decode($rowItem->files, true);

        // Check if the requested file exists in the list
        if (!in_array($fileName, $files)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Return the file for download
        return response()->download(storage_path("app/public/{$fileName}"));
        return response()->download(storage_path("app/public/{$fileName}"));
    }

    // public function download($fileName)
    // {
    //     $filePath = 'uploads/' . $fileName;

    //     if (!Storage::disk('public')->exists($filePath)) {
    //         return response()->json(['message' => 'File not found'], 404);
    //     }

    //     return Storage::disk('public')->download($filePath);
    // }

    public function downloadZip($id)
    {
        // Find the RowItem entry by ID
        $rowItem = RowItem::find($id);

        if (!$rowItem) {
            return response()->json(['message' => 'CdmiData not found'], 404);
        }

        // Decode the file paths from the database
        $files = json_decode($rowItem->files, true);

        if (empty($files)) {
            return response()->json(['message' => 'No files to download'], 404);
        }

        // Create a ZIP file
        $zip = new \ZipArchive();
        $zipFileName = "row_item_{$id}_files.zip";
        $zipFilePath = storage_path("app/public/{$zipFileName}");

        if ($zip->open($zipFilePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Failed to create ZIP file'], 500);
        }

        // Add files to the ZIP archive
        foreach ($files as $file) {
            $filePath = storage_path("app/public/{$file}");
            if (file_exists($filePath)) {
                $zip->addFile($filePath, basename($file)); // Add the file to the ZIP archive
            }
        }

        // Close the ZIP archive
        $zip->close();

        // Return the ZIP file for download
        return response()->download($zipFilePath)->deleteFileAfterSend(true);
    }
}
