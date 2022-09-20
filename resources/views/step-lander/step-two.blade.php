@extends('layouts.header')

@section('content')

    <div class="page_wrap my_row step_two">
        <section class="my_row top_section">
            <div class="container">

                @include('layouts.main-header')

                <article class="my_row heading_section">
                    <h2>Congrats you have selected <span class="text-capitalize">{{$modelName}}</span> in <span>{{$city}}!</span></h2>
                    {{--<a href="#free_for_everyone"><img src="{{asset('images/down-arrow.png')}}" alt="arrow" /></a>--}}
                    <div class="image_wrap">
                        <img src="{{ asset('images/masseuse-images'). "/" . $modelName . ".jpg" }}" alt="">
                    </div>
                </article>
                <article class="title my_row">
                    <h3><span>Step 2:</span> Choose your appointment time</h3>
                    <div id="date-time-picker"></div>
                </article>
                <div class="form_wrap register my_row">
                    <form method="POST" action="{{ route('custom-email-register') }}">
                        @csrf

                        <input id="add_chat_user" type="hidden" name="add_chat_user" value="{{$modelName}}"  />
                        {{--<input id="src" type="hidden" name="src" value=""  />--}}
                        <input id="date_time" name="date_time" type="hidden" value="">
                        <input id="city" name="city" type="hidden" value="{{str_replace(" ", "_", $city)}}">
                        <input type="hidden" name="timezone" id="timezone">

                        <!-- Name -->{{--<div>
                            <x-input id="name" class="block mt-1 w-full" type="text" name="name" :value="old('name')" required autofocus placeholder="Name"/>
                        </div>--}}


                        <!-- Email Address -->
                        <div class="mt-4">

                            <x-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required placeholder="Email"/>
                        </div>

                        <div class="mt-4 button_row">

                            <x-button>
                                {{ __('Confirm Appointment') }}
                            </x-button>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        @include('layouts.footer')
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.14/moment-timezone-with-data-2012-2022.min.js"></script>
    <script>
        $( document ).ready(function() {
            $('#timezone').val(moment.tz.guess())
        });
    </script>
@endsection
