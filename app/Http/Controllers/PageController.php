<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Session;
use Stevebauman\Location\Facades\Location;

class PageController extends Controller
{
    private $agentArray = [
        'mandy',
        'amy',
        'jennifer',
        'jillian',
        'lara',
        'liz',
        'michelle',
        'rosa'
    ];

    public function index(Request $request) {

        $agentNumber = $request->get('a');

        if ($agentNumber) {
            Session::put('agent', $this->agentArray[$agentNumber - 1]);
        }

        $images = File::glob(public_path('images/masseuse-images').'/*');
        $imageArray = [];
        foreach ($images as $image) {
            $exploded =  explode('masseuse-images/', $image);
            array_push($imageArray, $exploded[1]);
        }
        if (app()->environment('local')) {
            $ip = '174.86.205.0';
        } else {
            $ip = $request->ip();
        }

        $userInfo = Location::get($ip);
        $city = str_replace("City of ", "", $userInfo->cityName);
        Session::put('userCity', $city);

        return view('home', compact(['city', 'imageArray']));

    }

    public function showStepTwo(Request $request) {

        $modelName = $request->get('masseuse');
        $city = Session::get('userCity');
        $agent = Session::get('agent');

        return view('step-lander.step-two', compact(['modelName', 'city', 'agent']));

    }
}
