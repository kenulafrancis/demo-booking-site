// resources/js/Pages/PaymentCancel.jsx
import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';

const PaymentCancel = () => {

    useEffect(() => {
        // Clear session ID from local storage after payment is canceled
        localStorage.removeItem('sessionId');
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Canceled</h1>
                <p className="text-gray-600 mb-6">
                    Your payment was not completed. You can try again or contact support if you need assistance.
                </p>
                <Link href="/" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                    Retry the booking process
                </Link>
            </div>
        </div>
    );
};

export default PaymentCancel;
