<?php
/**
 * Unit test ringan untuk rate-limit.php. Jalankan: php test-rate-limit.php
 * Output "OK" di akhir berarti semua asersi lolos.
 */
declare(strict_types=1);

require_once __DIR__ . '/rate-limit.php';

$dir = sys_get_temp_dir() . '/rl-test-' . getmypid();
@mkdir($dir, 0750, true);

$failures = 0;
function check(bool $cond, string $label): void
{
    global $failures;
    if ($cond) {
        echo "  ok: $label\n";
    } else {
        $failures++;
        echo "  FAIL: $label\n";
    }
}

// Skenario 1: limit 3/jam — request 1-3 lolos, ke-4 ditolak.
foreach (glob($dir . '/*.json') ?: [] as $f) @unlink($f);
echo "skenario 1: limit 3 per 3600s\n";
check(rate_limit_allow($dir, '1.2.3.4', 3, 3600) === true, 'request 1 lolos');
check(rate_limit_allow($dir, '1.2.3.4', 3, 3600) === true, 'request 2 lolos');
check(rate_limit_allow($dir, '1.2.3.4', 3, 3600) === true, 'request 3 lolos');
check(rate_limit_allow($dir, '1.2.3.4', 3, 3600) === false, 'request 4 DITOLAK');

// Skenario 2: IP lain tidak terpengaruh.
echo "skenario 2: IP lain independen\n";
check(rate_limit_allow($dir, '5.6.7.8', 3, 3600) === true, 'IP lain tetap lolos');

// Skenario 3: window lewat → reset. Simulasikan dengan menulis ulang
// window_start counter IP pertama ke masa lalu.
echo "skenario 3: reset setelah window lewat\n";
$file = $dir . '/' . hash('sha256', '1.2.3.4') . '.json';
$state = json_decode((string) file_get_contents($file), true);
$state['window_start'] = time() - 3601;
file_put_contents($file, json_encode($state));
check(rate_limit_allow($dir, '1.2.3.4', 3, 3600) === true, 'setelah window lewat, lolos lagi');

// Skenario 4: folder tidak writable → tolak (fail-closed).
echo "skenario 4: fail-closed saat storage mati\n";
check(rate_limit_allow('/nonexistent-root-' . uniqid() . '/x', '1.2.3.4', 3, 3600) === false, 'folder mati → ditolak');

// Skenario 5: client_ip memvalidasi header proxy.
echo "skenario 5: client_ip\n";
$_SERVER['REMOTE_ADDR'] = '10.0.0.1';
check(client_ip() === '10.0.0.1', 'fallback REMOTE_ADDR');
$_SERVER['HTTP_X_FORWARDED_FOR'] = 'evil-string, 9.9.9.9';
check(client_ip() === '10.0.0.1', 'XFF invalid diabaikan');
$_SERVER['HTTP_X_FORWARDED_FOR'] = '203.0.113.5, 9.9.9.9';
check(client_ip() === '203.0.113.5', 'XFF valid dipakai (IP pertama)');
$_SERVER['HTTP_CF_CONNECTING_IP'] = '198.51.100.7';
check(client_ip() === '198.51.100.7', 'CF IP diprioritaskan');

@rmdir($dir) || system("rm -rf " . escapeshellarg($dir));
echo $failures === 0 ? "\nOK — semua asersi lolos\n" : "\nGAGAL: $failures asersi\n";
exit($failures === 0 ? 0 : 1);
