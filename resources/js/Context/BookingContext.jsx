// resources/js/Context/BookingContext.jsx

import React, { createContext, useState, useContext } from 'react';

// Create the BookingContext
const BookingContext = createContext();

// Export a custom hook to use the BookingContext
export const useBooking = () => {
    return useContext(BookingContext);
};

// Provide the context to the rest of the app
export const BookingProvider = ({ children }) => {
    const [selectedFacility, setSelectedFacility] = useState('');
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    return (
        <BookingContext.Provider value={{
            selectedFacility,
            setSelectedFacility,
            selectedSlots,
            setSelectedSlots,
            totalPrice,
            setTotalPrice,
        }}>
            {children}
        </BookingContext.Provider>
    );
};
