<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('AdminDashboard', [
            'stats' => [
                'totalStudents' => User::where('role', 'student')->count(),
                'totalOrganizers' => User::where('role', 'organizer')->count(),
            ],
            'adminName' => auth()->user()->name,
        ]);
    }
}