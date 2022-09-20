<?php

namespace App\Http\Controllers;

use App\Models\ContentSetting;
use App\Models\User;
use App\Notifications\WelcomeNotification;
use App\Providers\RouteServiceProvider;
use Carbon\Carbon;
use Haruncpi\LaravelIdGenerator\IdGenerator;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Http\Traits\ApiRequests;


class CustomRegisterController extends Controller
{
    use ApiRequests;

    /**
     * Display the registration view.
     *
     * @return \Illuminate\View\View
     */
    public function showRegisterTwo(Request $request) {

        $addUser = $request->query('add') ? $request->query('add') : null;
        $src = $request->query('src') ? $request->query('src') : null;

        $content = null;
        if ($addUser != null) {

            $userID = User::where('username', $addUser)->pluck('id')->first();
            if ($userID != null) {
                $content = ContentSetting::where('user_id', $userID)->first();
            }
        }

        return view('register-custom.register-two')->with([
            'addUser' => $addUser,
            'src' => $src,
            'background' => $content !== null ? $content->background : null,
        ]);
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\Contracts\View\View
     */
    public function showRegisterThree(Request $request) {

        $images = File::glob(public_path('images/slider-bottom').'/*');
        $imageArray = [];

        foreach ($images as $image) {
            $exploded =  explode('slider-bottom/', $image);
            array_push($imageArray, $exploded[1]);
        }

        $addUser = $request->query('add') ? $request->query('add') : null;
        $src = $request->query('src') ? $request->query('src') : null;

        $content = null;
        if ($addUser != null) {

            $userID = User::where('username', $addUser)->pluck('id')->first();
            if ($userID != null) {
                $content = ContentSetting::where('user_id', $userID)->first();
            }
        }

        return view('register-custom.register-three')->with([
            'addUser' => $addUser,
            'src' => $src,
            'images' => $imageArray,
            'background' => $content !== null ? $content->background : null,
        ]);
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\Contracts\View\View
     */
    public function showRegisterFour(Request $request) {

        $addUser = $request->query('add') ? $request->query('add') : null;
        $src = $request->query('src') ? $request->query('src') : null;

        $content = null;
        if ($addUser != null) {

            $userID = User::where('username', $addUser)->pluck('id')->first();
            if ($userID != null) {
                $content = ContentSetting::where('user_id', $userID)->first();
            }
        }


        return view('register-custom.register-four')->with([
            'addUser' => $addUser,
            'src' => $src,
            'profile' => $content !== null ? $content->profile : null,
            'background' => $content !== null ? $content->background : null,
            'attachment' => $content !== null ? $content->attachment : null,
        ]);
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\Contracts\View\View
     */
    public function showAgentRegister(Request $request) {

        return view('register-custom.register-agent');
    }

    /**
     * Handle an incoming registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {

        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
        ]);

        $id = IdGenerator::generate(['table' => 'users', 'length' => 8, 'prefix' => random_int(100000, 999999)]);

        $bytes = random_bytes(4);
        $password = (bin2hex($bytes));

        $name = strstr($request->email, '@', true);

        $user = User::create([
            'id' => $id,
            'name' => $name,
            'email' => $request->email,
            'password' => Hash::make($password),
        ]);

        event(new Registered($user));

        $referral = null;
        if( $request->add_chat_user || $request->src) {
            $ip = $request->ip();
            $referral = $request->add_chat_user ? : "";
            $src = $request->src ? : "";

            (New TrackingController)->store($user, $ip, $referral, $src);
        }

        Auth::login($user);
        $userdata = ([
            'email' =>   $user->email,
            'password' => $password,
        ]);

        //$user->notify(new WelcomeNotification($userdata));
        if ($request->date_time && $request->city) {

            $dateTime = Carbon::createFromTimestamp($request->date_time)->setTimezone($request->timezone)->format("F-j_g:ia");

            $city = $request->city;

            $chatUser = "?add_chat_user=" . $referral . "&city=" . $city . "&dateTime=" . $dateTime;

        } else {
            $chatUser = $referral ? "?add_chat_user=" . $referral : "";
        }

        $this->postToApi($request->email, $ip);

        return redirect(RouteServiceProvider::HOME . $chatUser);
    }

    public function storeAgentUser(Request $request) {

        $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'username' => ['required', 'string', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $id = IdGenerator::generate(['table' => 'users', 'length' => 8, 'prefix' => random_int(100000, 999999)]);

        $user = User::create([
            'id' => $id,
            'name' => $request->username,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => "agent"
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(RouteServiceProvider::HOME);

    }
}
