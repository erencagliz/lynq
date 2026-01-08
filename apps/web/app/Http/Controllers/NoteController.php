<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'notable_id' => 'required',
            'notable_type' => 'required|string',
            'content' => 'required|string',
        ]);

        Note::create($validated + [
            'tenant_id' => auth()->user()->tenant_id,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Note added successfully.');
    }

    public function destroy(Note $note)
    {
        $note->delete();
        return back();
    }
}
