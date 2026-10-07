<?php
$api = json_decode(file_get_contents('api.json'), true, 512, JSON_THROW_ON_ERROR);
$local = json_decode(file_get_contents('data.json'), true, 512, JSON_THROW_ON_ERROR);

if ($api !== $local) {
    throw new RuntimeException('Los archivos JSON no son estructuralmente iguales.');
}

fwrite(
    STDOUT,
    sprintf(
        "JSON parsed successfully; structures equal: yes; personajes: %d; historias: %d\n",
        count($api['personajes']),
        count($api['historias'])
    )
);
