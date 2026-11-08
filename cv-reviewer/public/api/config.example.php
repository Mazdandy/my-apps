<?php
/**
 * Konfigurasi proxy — FILE INI TIDAK BOLEH DI-COMMIT ATAU DIBACA PUBLIK.
 *
 * Cara pakai di hosting cPanel:
 * 1. Duplikat file ini sebagai config.php di folder yang sama (public/api/).
 * 2. Isi API key AtmoRouter kamu (awalan "ar-", buat di Dashboard → API Keys).
 * 3. Via File Manager cPanel, set permission config.php ke 600
 *    (hanya owner yang bisa baca) supaya tidak bisa diakses dari web.
 *
 * Alternatif yang lebih aman kalau hostingmu mengizinkan: taruh config.php
 * DI LUAR public_html dan sesuaikan path require di review.php.
 */

declare(strict_types=1);

return [
    'atmorouter_api_key' => 'ar-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',

    // Model default — client tidak bisa mengganti model (harga antar model
    // bisa jauh berbeda, jadi pilihan model dikunci di sisi server).
    'default_model' => 'cbcn/glm-5.3-flash',
];
