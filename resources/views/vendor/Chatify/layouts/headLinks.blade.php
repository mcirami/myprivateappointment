<title>{{ env('APP_NAME') }}</title>

{{-- Meta tags --}}
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
<meta name="id" content="{{ $id }}">
<meta name="type" content="{{ $type }}">
<meta name="bot" data-to="{{ null }}" data-from="{{ null }}">
<meta name="messenger-color" content="{{ $messengerColor }}">
<meta name="csrf-token" content="{{ csrf_token() }}">
<meta name="url" content="{{ url('').'/'.config('chatify.routes.prefix') }}" data-user="{{ Auth::user()->id }}">

{{-- scripts --}}
<script
  src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="{{ asset('js/chatify/font.awesome.min.js') }}"></script>
<script src="{{ asset('js/chatify/autosize.js') }}"></script>
<script src="{{ asset('js/app.js?v=2') }}" defer></script>
<script src='https://unpkg.com/nprogress@0.2.0/nprogress.js'></script>

{{-- styles --}}
<link rel='stylesheet' href='https://unpkg.com/nprogress@0.2.0/nprogress.css'/>
{{--<link href="{{ asset('css/chatify/style.css') }}" rel="stylesheet" />--}}
<link href="{{ asset('css/chatify/'.$dark_mode.'.mode.css') }}" rel="stylesheet" />
<link href="{{ asset('css/app.css?version=1.4') }}" rel="stylesheet" />
<link rel="icon" href="{{ asset('images/favicon.ico') }}">


{{-- Messenger Color Style--}}
@include('Chatify::layouts.messengerColor')
{{--

<script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async=""></script>
<script>
    const searchQueryString = window.location.search;
    const getUrlParams = new URLSearchParams(searchQueryString);
    let chatUserName = getUrlParams.get('add_chat_user');
    window.OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
        OneSignal.init({
            appId: "5c0a6e7a-810b-4df9-889f-72ea965b3a65",
            safari_web_id: "",
            /*notifyButton: {
                enable: true,
            },*/
            autoResubscribe: true,
            promptOptions: {
                slidedown: {
                    prompts: [
                        {
                            type: "push",
                            autoPrompt: true,
                            text: {
                                actionMessage: "Get notified when " + chatUserName + " messages you!",
                                acceptButtonText: "ALLOW",
                                cancelButtonText: "NO THANKS",
                            },
                            delay: {
                                pageViews: 1,
                                timeDelay: 20
                            }
                        },
                    ]
                }
            }
        });
        OneSignal.showSlidedownPrompt();
        /*OneSignal.sendTag("agent", chatUserName);*/

    });
</script>
--}}
