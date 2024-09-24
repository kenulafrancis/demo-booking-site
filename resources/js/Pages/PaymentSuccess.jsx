// resources/js/Pages/PaymentSuccess.jsx
import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';

const PaymentSuccess = () => {

    useEffect(() => {
        // Clear session ID from local storage after successful payment
        localStorage.removeItem('sessionId');
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your payment. Your transaction was completed successfully.
                </p>
                <p className="text-gray-600 mb-6">
                    A booking confirmation has been sent to your email.
                </p>
                <Link href='/booking-history' className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                    View Bookings
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
