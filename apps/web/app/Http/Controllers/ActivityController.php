<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class ActivityController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_type' => 'required|string',
            'subject_id' => 'required|integer',
            'type' => 'required|string|in:note,call,email,meeting',
            'description' => 'required|string',
            'performed_at' => 'nullable|date',
        ]);

        Activity::create($validated + [
            'user_id' => auth()->id(),
            'tenant_id' => auth()->user()->tenant_id,
            'performed_at' => $validated['performed_at'] ?? now(),
        ]);

        return back()->with('success', 'Activity added successfully.');
    }

    public function destroy(Activity $activity)
    {
        // specific authorization policy can be added here
        $activity->delete();
        return back()->with('success', 'Activity deleted.');
    }
}
