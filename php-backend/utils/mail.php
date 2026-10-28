<?php
/**
 * Simple email helper for shared hosting (PHP mail()).
 * Failures are logged but never thrown — booking should still succeed.
 */

/**
 * @param string $to
 * @param string $subject
 * @param string $htmlBody
 * @param array{from?:string,fromName?:string,replyTo?:string} $options
 * @return bool
 */
function sendMail($to, $subject, $htmlBody, $options = [])
{
    $to = trim((string) $to);
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    $fromEmail = isset($options['from']) ? (string) $options['from'] : '';
    if ($fromEmail === '') {
        $envFrom = getenv('MAIL_FROM');
        $fromEmail = ($envFrom !== false && $envFrom !== '')
            ? (string) $envFrom
            : 'noreply@serendibgroups.com';
    }

    $fromName = isset($options['fromName']) ? (string) $options['fromName'] : '';
    if ($fromName === '') {
        $envName = getenv('MAIL_FROM_NAME');
        $fromName = ($envName !== false && $envName !== '')
            ? (string) $envName
            : 'Serendib Destinations';
    }

    $replyTo = isset($options['replyTo']) ? trim((string) $options['replyTo']) : '';
    $encodedFrom = sprintf('%s <%s>', encodeMailHeader($fromName), $fromEmail);

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $encodedFrom,
        'X-Mailer: PHP/' . phpversion(),
    ];

    if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

    try {
        return @mail($to, $encodedSubject, $htmlBody, implode("\r\n", $headers));
    } catch (Throwable $e) {
        error_log('sendMail failed: ' . $e->getMessage());
        return false;
    }
}

/**
 * @param string $value
 * @return string
 */
function encodeMailHeader($value)
{
    $value = str_replace(["\r", "\n"], '', (string) $value);
    if (preg_match('/[^\x20-\x7E]/', $value)) {
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }
    return $value;
}

/**
 * Notify ticketing inbox when a customer submits a booking.
 *
 * @param array $booking
 * @param int|string|null $bookingId
 * @return bool
 */
function notifyBookingSubmitted(array $booking, $bookingId = null)
{
    $envTo = getenv('BOOKING_NOTIFY_EMAIL');
    $to = ($envTo !== false && trim((string) $envTo) !== '')
        ? trim((string) $envTo)
        : 'ticketing@serendibgroups.com';

    $tourTitle = htmlspecialchars((string) ($booking['tourTitle'] ?? 'Tour'), ENT_QUOTES, 'UTF-8');
    $clientName = htmlspecialchars((string) ($booking['clientName'] ?? ''), ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars((string) ($booking['email'] ?? ''), ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars((string) ($booking['phone'] ?? ''), ENT_QUOTES, 'UTF-8');
    $bookingDate = htmlspecialchars((string) ($booking['bookingDate'] ?? ''), ENT_QUOTES, 'UTF-8');
    $guests = htmlspecialchars((string) ($booking['guests'] ?? ''), ENT_QUOTES, 'UTF-8');
    $totalPrice = htmlspecialchars((string) ($booking['totalPrice'] ?? ''), ENT_QUOTES, 'UTF-8');
    $specialRequests = htmlspecialchars((string) ($booking['specialRequests'] ?? ''), ENT_QUOTES, 'UTF-8');
    $idLabel = $bookingId !== null && $bookingId !== ''
        ? htmlspecialchars((string) $bookingId, ENT_QUOTES, 'UTF-8')
        : '—';

    $subject = 'New booking: ' . ($booking['tourTitle'] ?? 'Tour') . ' — ' . ($booking['clientName'] ?? 'Guest');

    $html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">'
        . '<h2 style="margin:0 0 12px">New booking received</h2>'
        . '<p style="margin:0 0 16px">A customer submitted a booking on the website.</p>'
        . '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:560px">'
        . rowHtml('Booking ID', $idLabel)
        . rowHtml('Tour', $tourTitle)
        . rowHtml('Guest name', $clientName)
        . rowHtml('Email', $email)
        . rowHtml('Phone', $phone)
        . rowHtml('Travel date', $bookingDate)
        . rowHtml('Guests', $guests)
        . rowHtml('Total (USD)', $totalPrice)
        . rowHtml('Special requests', $specialRequests !== '' ? nl2br($specialRequests) : '—')
        . '</table>'
        . '<p style="margin:20px 0 0;color:#64748b;font-size:13px">Reply to this email to contact the guest directly.</p>'
        . '</body></html>';

    return sendMail($to, $subject, $html, [
        'replyTo' => (string) ($booking['email'] ?? ''),
    ]);
}

/**
 * Forward a website contact-form message to the site inbox.
 *
 * @param array{message?:string,email?:string,name?:string} $payload
 * @param string $to
 * @return bool
 */
function notifyContactMessage(array $payload, $to)
{
    $message = trim((string) ($payload['message'] ?? ''));
    if ($message === '') {
        return false;
    }

    $name = trim((string) ($payload['name'] ?? ''));
    $email = trim((string) ($payload['email'] ?? ''));

    $safeName = htmlspecialchars($name !== '' ? $name : 'Website visitor', ENT_QUOTES, 'UTF-8');
    $safeEmail = htmlspecialchars($email !== '' ? $email : '—', ENT_QUOTES, 'UTF-8');
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

    $subject = 'Website message'
        . ($name !== '' ? ' from ' . $name : '')
        . ($email !== '' ? ' <' . $email . '>' : '');

    $html = '<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">'
        . '<h2 style="margin:0 0 12px">New website message</h2>'
        . '<p style="margin:0 0 16px">Someone sent a message from the site contact button.</p>'
        . '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:560px">'
        . rowHtml('Name', $safeName)
        . rowHtml('Email', $safeEmail)
        . rowHtml('Message', $safeMessage)
        . '</table>'
        . '</body></html>';

    $options = [];
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $options['replyTo'] = $email;
    }

    return sendMail($to, $subject, $html, $options);
}

/**
 * @param string $label
 * @param string $valueHtml
 * @return string
 */
function rowHtml($label, $valueHtml)
{
    return '<tr>'
        . '<td style="border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;width:160px">'
        . htmlspecialchars($label, ENT_QUOTES, 'UTF-8')
        . '</td>'
        . '<td style="border:1px solid #e2e8f0">' . $valueHtml . '</td>'
        . '</tr>';
}
