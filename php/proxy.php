<?php

header('Content-type: application/json');

function getCurl($url)
{
    $curl = curl_init();

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $output = curl_exec($curl);
    curl_close($curl);

    return $output;
}

$data = $_GET;

echo getCurl($data['url']);