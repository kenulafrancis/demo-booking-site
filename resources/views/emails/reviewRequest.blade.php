<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review Request</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <h1 style="font-size: 24px; color: #111827;">We hope you enjoyed your experience at {{ $facility->name }} Facility!</h1>
    <p style="font-size: 16px; color: #6b7280;">We would love to hear your feedback. Please click the button below to leave a review:</p>

    <a href="{{ url('/facilities/' . $facility->id . '/#review-section') }}"
       style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 16px;">
        Leave a Review
    </a>

    <p style="font-size: 16px; color: #6b7280; margin-top: 20px;">Thank you!</p>

    <div style="margin-top: 40px; text-align: center;">
        <a href="{{ url('/') }}"
           style="display: inline-block; color: #4CAF50; text-decoration: underline; font-size: 14px;">
            Visit our website
        </a>
    </div>
</div>
</body>
</html>
