<?php 
// Secure phpliteadmin configuration using Laravel's .env

$envPath = __DIR__ . '/../../.env';
$env = [];
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) == 2) {
            $key = trim($parts[0]);
            $val = trim(trim($parts[1]), '"\'');
            $env[$key] = $val;
        }
    }
}

// Security: Enable phpliteadmin via .env
$enabled = isset($env['PHPLITEADMIN_ENABLED']) && $env['PHPLITEADMIN_ENABLED'] === 'true';

if (!$enabled) {
    header('HTTP/1.0 403 Forbidden');
    die('phpLiteAdmin is disabled. Enable it by setting PHPLITEADMIN_ENABLED=true in .env');
}

//password to gain access
$password = isset($env['PHPLITEADMIN_PASSWORD']) && $env['PHPLITEADMIN_PASSWORD'] !== '' 
            ? $env['PHPLITEADMIN_PASSWORD'] 
            : 'cambiame_por_favor'; 

if ($password === 'cambiame_por_favor' || $password === 'admin') {
    die('Please set a secure PHPLITEADMIN_PASSWORD in your .env file.');
}

//directory relative to this file to search for databases (if false, manually list databases in the $databases variable)
$directory = false;

//whether or not to scan the subdirectories of the above directory infinitely deep
$subdirectories = false;

//if the above $directory variable is set to false, you must specify the databases manually in an array as the next variable
//if any of the databases do not exist as they are referenced by their path, they will be created automatically
$databases = array(
	array(
		'path'=> __DIR__ . '/../../database/database.sqlite',
		'name'=> 'Laravel Database (JA-Hidalgo)'
	),
);

/* ---- Interface settings ---- */
$theme = 'phpliteadmin.css';
$language = 'en';
$rowsNum = 30;
$charsNum = 300;
$maxSavedQueries = 10;

/* ---- Custom functions ---- */
$custom_functions = array(
	'md5', 'sha1', 'time', 'strtotime',
);

/* ---- Advanced options ---- */
$cookie_name = 'pla_laravel_secure';
$debug = false;
$allowed_extensions = array('db','db3','sqlite','sqlite3');
