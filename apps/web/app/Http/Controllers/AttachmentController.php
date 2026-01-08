<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'attachable_id' => 'required',
            'attachable_type' => 'required|string',
            'file' => 'required|file|max:10240', // 10MB limit
        ]);

        $file = $request->file('file');
        $path = $file->store('attachments/' . auth()->user()->tenant_id, 'public');

        Attachment::create([
            'tenant_id' => auth()->user()->tenant_id,
            'attachable_id' => $request->attachable_id,
            'attachable_type' => $request->attachable_type,
            'uploaded_by' => auth()->id(),
            'file_path' => '/storage/' . $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $this->formatBytes($file->getSize()),
            'mime_type' => $file->getMimeType(),
        ]);

        return back()->with('success', 'File uploaded successfully.');
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    public function destroy(Attachment $attachment)
    {
        $attachment->delete();
        return back()->with('success', 'Attachment deleted successfully.');
    }
}
