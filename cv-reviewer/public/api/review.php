<?php
/**
 * Proxy same-origin untuk AtmoRouter (https://atmorouter.dev).
 *
 * AtmoRouter tidak mengirim header CORS, jadi browser tidak bisa memanggilnya
 * langsung dari situs statis. File ini ditaruh di hosting yang sama dengan
 * frontend (cPanel), sehingga permintaan dari browser bersikap same-origin
 * dan CORS tidak berlaku.
 *
 * API key AtmoRouter milik pemilik situs disimpan di config.php (sisi server,
 * tidak pernah sampai ke browser). Isi CV hanya diteruskan ke
 * atmorouter.dev — tidak disimpan di hosting.
 */

declare(strict_types=1);

const UPSTREAM_URL = 'https://atmorouter.dev/v1/chat/completions';
const MAX_BODY_BYTES = 262144; // 256 KB — cukup untuk CV + job description.

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => ['message' => 'Method not allowed.', 'type' => 'proxy']]);
    exit;
}

$apiKey = trim((string) ($config['atmorouter_api_key'] ?? ''));
if ($apiKey === '' || !str_starts_with($apiKey, 'ar-')) {
    http_response_code(503);
    echo json_encode(['error' => ['message' => 'Layanan AI belum dikonfigurasi. Isi atmorouter_api_key di api/config.php.', 'type' => 'missing_api_key']]);
    exit;
}

$body = file_get_contents('php://input') ?: '';
if ($body === '' || strlen($body) > MAX_BODY_BYTES) {
    http_response_code(400);
    echo json_encode(['error' => ['message' => 'Empty or oversized request body.', 'type' => 'proxy']]);
    exit;
}

$decoded = json_decode($body, true);
if (!is_array($decoded) || !isset($decoded['messages']) || !is_array($decoded['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => ['message' => 'Body must be a chat-completions JSON object.', 'type' => 'proxy']]);
    exit;
}

// Key ada di server: client tidak boleh memilih model sembarangan (harga bisa
// jauh beda antar model) — pakai model dari config.
$decoded['model'] = (string) ($config['default_model'] ?? 'cbcn/glm-5.3-flash');
$body = json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$ch = curl_init(UPSTREAM_URL);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
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
