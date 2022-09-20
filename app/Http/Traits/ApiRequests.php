<?php

namespace App\Http\Traits;

use Carbon\Carbon;
use GuzzleHttp\Client;

trait ApiRequests {

    public function postToApi($email, $ip) {

        $apiURL = 'https://rockphase.com/api/post-data';
        $timeStamp = Carbon::now(new \DateTimeZone('America/New_York'));

        $postInput = [
            'email' => $email,
            'ip' => $ip,
            'time_stamp' => $timeStamp->toDateTimeString(),
            'source_id' => env('APP_NAME')
        ];

        $client = new Client(['headers' => [
            "Content-Type" => "application/json",
            "Authorization" => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMDJhNWVlZmM0NmVmMTRlNGIyOGM3MmU2OWNiNzc2ZTc3NTdiZWM4OWZjM2U0ODA0OWU4Y2NiNDAwZmE5ZDJkMDA3YjI5OTMxM2Q3NjY4NjIiLCJpYXQiOjE2MDkxMzAyMzMsIm5iZiI6MTYwOTEzMDIzMywiZXhwIjoxNjQwNjY2MjMzLCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.j7LolxwQefjVxk5LmOLb4N9f2ojHHY281xGSjgoPAb0-qHFJYwMwm8-AqeIPRaMLz4qzWBHMsW4Qf1pK_NznS-6jV0A6xBN--AylZGOSyx75EHVMNpxDnO6YWEo0bO5rYXyykVseXNbL2Lurybjyh-SSwBW-FYVPnJ1g2txJ1urJKVYXGCmqnyHderM_fDIWioL5verup-AOD_zcWPYogiESK4WJJV1gxhp-S7JnXnxA_old8YVUdB27st160WvZdaSUQsafy3_h5_WwlvivgFs9kLZqDbMOa5tbynWsoRSL-KmrBAEtgjnMGfyuHqCHeQfe9K8qLdCrn6bMyWWG9y7xcbSY_0L4POluEgeAhcnQaoP4BY0DSJAkEOWL_mwiYiJBrxv3FavnHzsAhVVPWzqMWF-A_iHPxzWlZgTTJfPW1vQtjRDnrPqEar0m54E7Fz2gF7wrqDKLO-JVvCJfNUiVMsuoMgDmaOIFYLnXYkR__Q94_lpTZ9weJlbdJITrXBww04R_QRSlzz8IBH7FZHAZdrpWfbXR_zT7xLjIJDtkLuprxHSOxLRUvWG_1XBa4mBfQRk837LwtlnNFjRJXyRKiKBJ6xsbJShhvckPkSytp9xmR6k68YaPnBMpkGnhXg5_Om5CiBR164iLbZYE-cfCB20_Eap0gbPiPQ-qZZg'
        ]]);
        $response = $client->request('POST', $apiURL, ['form_params' => $postInput]);

        //$statusCode = $response->getStatusCode();
        $responseBody = json_decode($response->getBody(), true);
    }
}
