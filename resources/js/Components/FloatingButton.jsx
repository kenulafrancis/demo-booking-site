import React from 'react';

const FloatingButton = () => {
    return (
        <div>
            <a
                href="/tennis-reservations"
                className="
                    fixed bottom-6 right-6
                    bg-orange-500 text-white
                    px-6 py-3 rounded-full
                    text-lg font-semibold
                    shadow-lg hover:bg-orange-600
                    focus:ring-4 focus:ring-orange-300
                    focus:outline-none
                    transition-transform transform hover:scale-105
                    duration-200 ease-in-out
                "
            >
                Book Now
            </a>
        </div>
    );
};

export default FloatingButton;
