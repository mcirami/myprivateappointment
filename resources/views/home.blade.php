@extends('layouts.header')

@section('content')

    <div class="page_wrap my_row">
        <section class="my_row top_section">
            <div class="container">

                @include('layouts.main-header')

                <article class="my_row heading_section">
                    <h2>Time to <span>book your appointment</span> in <span>{{$city}}!</span></h2>
                    {{--<a href="#free_for_everyone"><img src="{{asset('images/down-arrow.png')}}" alt="arrow" /></a>--}}
                </article>
                <article class="title">
                    <h3><span>Step 1:</span> Choose Your Masseuse</h3>
                </article>

                <section class="images_wrap">
                    @foreach($imageArray as $image)
                        @php
                            $name = str_replace(array(".jpg", ".jpeg", ".png"), "", $image)
                        @endphp
                        <article class="img_col">
                            <a href="{{route('step-two')}}?masseuse={{$name}}" data-name="mandy">
                                <img src="{{ asset('images/masseuse-images/'. $image) }}" alt="">
                            </a>
                        </article>
                    @endforeach
                </section>
            </div>
        </section>

        @include('layouts.footer')
    </div>


@endsection
