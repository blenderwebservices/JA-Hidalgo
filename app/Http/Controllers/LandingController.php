<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LandingController extends \App\Http\Controllers\Controller
{
    public function index()
    {
        return view('landing');
    }
}
