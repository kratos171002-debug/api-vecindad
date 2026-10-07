<?php
$archivePath = 'C:\xampp\htdocs\API-de-la-Vecindad.zip';
$zip = new ZipArchive();

if ($zip->open($archivePath) !== true) {
    throw new RuntimeException('No se pudo abrir el archivo ZIP.');
}

$required = [
    'index.html',
    'styles.css',
    'script.js',
    'data-service.js',
    'api.json',
    'data.json'
];

foreach ($required as $file) {
    if ($zip->getFromName($file) === false) {
        throw new RuntimeException("Falta el archivo requerido: $file");
    }
}

fwrite(
    STDOUT,
    sprintf(
        "ZIP validated; required files: %d; entries: %d\n",
        count($required),
        $zip->numFiles
    )
);
$zip->close();
