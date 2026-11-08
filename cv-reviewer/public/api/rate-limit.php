<?php
/**
 * Rate limiter sederhana per IP berbasis file counter di disk.
 *
 * Tidak butuh database: satu file per IP per jendela waktu, berisi timestamp
 * jendela + jumlah request. Cocok untuk hosting cPanel shared class (I/O disk
 * kecil, request AI mahal, jadi pembatasan kasarnya sudah cukup).
 *
 * @param string $dir       Folder penyimpanan counter (harus writable).
 * @param string $ip        Identitas client (IP atau hash-nya).
 * @param int    $limit     Maksimum request per jendela.
 * @param int    $windowSec Panjang jendela dalam detik.
 *
 * @return bool true jika request ini masih diizinkan.
 */
function rate_limit_allow(string $dir, string $ip, int $limit, int $windowSec): bool
{
    if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
        // Tidak bisa menulis counter: tolak saja daripada tanpa batas.
        return false;
    }

    $file = $dir . '/' . hash('sha256', $ip) . '.json';
    $now = time();

    $state = ['window_start' => $now, 'count' => 0];
    if (is_file($file)) {
        $decoded = json_decode((string) @file_get_contents($file), true);
        if (is_array($decoded) && isset($decoded['window_start'], $decoded['count'])) {
            $state = $decoded;
        }
    }

    // Jendela sudah lewat: reset.
    if ($now - (int) $state['window_start'] >= $windowSec) {
        $state = ['window_start' => $now, 'count' => 0];
    }

    $state['count']++;
    @file_put_contents($file, json_encode($state), LOCK_EX);

    // Bersihkan counter basi sesekali (1% request) supaya folder tidak menumpuk.
    if (random_int(0, 99) === 0) {
        foreach (glob($dir . '/*.json') ?: [] as $stale) {
            $decoded = json_decode((string) @file_get_contents($stale), true);
            if (!is_array($decoded) || $now - (int) ($decoded['window_start'] ?? 0) >= $windowSec * 24) {
                @unlink($stale);
            }
        }
    }

    return $state['count'] <= $limit;
}

/**
 * Ambil IP client di belakang proxy/CDN (Cloudflare) dengan aman: header
 * X-Forwarded-For hanya dipercaya berisi format IP valid.
 */
function client_ip(): string
{
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? null,
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null,
    ];
    foreach ($candidates as $header) {
        if (!is_string($header) || $header === '') continue;
        $first = trim(explode(',', $header)[0]);
        if (filter_var($first, FILTER_VALIDATE_IP)) return $first;
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}
