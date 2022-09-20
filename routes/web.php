<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CustomRegisterController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\PageContentController;
use App\Http\Controllers\PageController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [PageController::class, 'index'])->name('home');
Route::get('/step-two/', [PageController::class, 'showStepTwo'])->name('step-two');

Route::get('register-two', [CustomRegisterController::class, 'showRegisterTwo']);
Route::get('register-three', [CustomRegisterController::class, 'showRegisterThree']);
Route::get('register-four', [CustomRegisterController::class, 'showRegisterFour']);
Route::get('register-agent', [CustomRegisterController::class, 'showAgentRegister']);
Route::post('store-agent', [CustomRegisterController::class, 'storeAgentUser'])->name('storeAgent');
Route::post('custom-email-register', [CustomRegisterController::class, 'store'])->name('custom-email-register');
Route::get('email', [MailController::class, 'email']);

Route::group(['middleware' => ['auth', 'role']], function() {
    Route::get('settings', [SettingController::class, 'showEditSettings'])->name('botSettings');
    Route::post('store-setting', [SettingController::class, 'storeSetting']);
    Route::post('store-model-info', [SettingController::class, 'storeModelInfo']);
    Route::get('get-model-info', [SettingController::class, 'getModelInfo']);
    Route::post('store-image', [SettingController::class, 'storeImage']);
    Route::post('remove-image', [SettingController::class, 'removeImage']);

    Route::get('get-content', [PageContentController::class, 'getContent']);
    Route::get('get-username', [PageContentController::class, 'getUsername']);
    Route::get('get-all-user-names', [PageContentController::class, 'getAllUserNames']);
    Route::post('store-content', [PageContentController::class, 'storeContent']);
    Route::post('remove-content-image', [PageContentController::class, 'removeContentImage']);
});

Route::group(['middleware' => 'auth'], function() {

    Route::get('testing', [ChatController::class, 'testing']);
    Route::post('add-user/', [ChatController::class, 'addUser']);

    Route::post('chat/get-agents', [UserController::class, 'getAgentUsers']);
    Route::post('get-setting', [SettingController::class, 'getSetting']);
    Route::post('script-tracking', [SettingController::class, 'getTracking']);
    Route::view('/settings/{path?}', 'user.settings');
});



require __DIR__.'/auth.php';
