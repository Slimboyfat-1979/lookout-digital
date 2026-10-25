<?php
declare(strict_types=1);

function redirectWithStatus(string $status): void
{
    header('Location: contact.html?status=' . rawurlencode($status), true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    exit('Method not allowed');
}

function postValue(string $key): string
{
    $value = $_POST[$key] ?? '';
    return is_string($value) ? trim($value) : '';
}

$name = strip_tags(postValue('name'));
$email = postValue('email');
$projectType = strip_tags(postValue('project-type'));
$message = str_replace(["\r\n", "\r", "\0"], ["\n", "\n", ''], postValue('message'));
$name = preg_replace('/[\r\n]+/', ' ', $name) ?? '';
$projectType = preg_replace('/[\r\n]+/', ' ', $projectType) ?? '';

if (
    $name === ''
    || strlen($name) > 120
    || filter_var($email, FILTER_VALIDATE_EMAIL) === false
    || strlen($email) > 254
    || strlen($projectType) > 100
    || $message === ''
    || strlen($message) > 5000
) {
    redirectWithStatus('invalid');
}

$subject = 'New website enquiry - Lookout Digital';
$body = "Name: {$name}\nEmail: {$email}\nProject: " . ($projectType !== '' ? $projectType : 'Not specified') . "\n\n{$message}";
$headers = [
    'From: Lookout Digital <hello@lookoutdigital.co.nz>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

if (!mail('hello@lookoutdigital.co.nz', $subject, $body, implode("\r\n", $headers))) {
    redirectWithStatus('failed');
}

redirectWithStatus('sent');
