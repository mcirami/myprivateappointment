@component('mail::message')
# Welcome to {{config('app.name')}}!

Below you will find your login credentials:

Email: <span>{{ $data['email'] }}</span>
<br>
Password: <span>{{ $data['password'] }}</span>

@component('mail::button', ['url' => config('app.url') . "/login"])
    Login Now!
@endcomponent

Thanks,<br>
{{config('app.name')}}
@endcomponent
