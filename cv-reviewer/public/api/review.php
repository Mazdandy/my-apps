<?php
/**
 * Proxy same-origin untuk AtmoRouter (https://atmorouter.dev).
 *
 * AtmoRouter tidak mengirim header CORS, jadi browser tidak bisa memanggilnya
 * langsung dari situs statis. File ini ditaruh di hosting yang sama dengan
 * frontend (cPanel), sehingga permintaan dari browser bersifat same-origin
 * dan CORS tidak berlaku. API key AtmoRouter milik user tetap dikirim dari
 * browser (BYOK) dan hanya diteruskan ke atmorouter.dev — tidak disimpan.
 */

declare(strict_types=1);

const UPSTREAM_URL = 'https://atmorouter.dev/v1/chat/completions';
const MAX_BODY_BYTES = 262144; // 256 KB — cukup untuk CV + job description.

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => ['message' => 'Method not allowed.', 'type' => 'proxy']]);
    exit;
}

// BYOK: key "ar-..." dikirim browser lewat header Authorization.
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($auth === '' || !preg_match('/^Bearer\s+\S+$/i', $auth)) {
    http_response_code(401);
    echo json_encode(['error' => ['message' => 'Missing AtmoRouter API key.', 'type' => 'missing_api_key']]);
    exit;
}

$body = file_get_contents('php://input') ?: '';
if ($body === '' || strlen($body) > MAX_BODY_BYTES) {
    http_response_code(400);
    echo json_encode(['error' => ['message' => 'Empty or oversized request body.', 'type' => 'proxy']]);
    exit;
}

$decoded = json_decode($body, true);
if (!is_array($decoded) || !isset($decoded['model'], $decoded['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => ['message' => 'Body must be a chat-completions JSON object.', 'type' => 'proxy']]);
    exit;
}

$ch = curl_init(UPSTREAM_URL);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: ' . $auth,
        'Expect: ',
    ],
    CURLOPT_TIMEOUT => 120,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$response = curl_exec($ch);
$curlError = curl_error($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => ['message' => 'Upstream request failed: ' . $curlError, 'type' => 'upstream']]);
    exit;
}

http_response_code($status > 0 ? $status : 502);
echo $response;
