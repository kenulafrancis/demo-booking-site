<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <h1 style="font-size: 24px; color: #111827;">Booking Confirmation</h1>
    <p style="font-size: 16px; color: #6b7280;">Hello {{ $bookingDetails['user_name'] }},</p>
    <p style="font-size: 16px; color: #6b7280;">Thank you for your booking!</p>
    <p style="font-size: 16px; color: #6b7280;">Here are your booking details:</p>

    <ul style="font-size: 16px; color: #6b7280;">
        <li><strong>Facility:</strong> {{ $bookingDetails['facility_name'] }}</li>
        <li><strong>Date:</strong> {{ $bookingDetails['date'] }}</li>
        <li><strong>Time Slots:</strong>
            <ul>
                @foreach($bookingDetails['time_slots'] as $slot)
                    <li>{{ $slot['start_time'] }} - {{ $slot['end_time'] }}</li>
                @endforeach
            </ul>
        </li>
        <li><strong>Total Price:</strong> Rs. {{ $bookingDetails['total_price'] }}</li>
    </ul>

    <p style="font-size: 16px; color: #6b7280; margin-top: 20px;">Thank you for booking with us!</p>

    <div style="margin-top: 40px; text-align: center;">
        <a href="{{ url('/') }}" style="display: inline-block; color: #4CAF50; text-decoration: underline; font-size: 14px;">
            Visit our website
        </a>
    </div>
</div>
</body>
</html>
