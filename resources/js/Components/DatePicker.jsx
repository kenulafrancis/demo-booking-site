import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from 'axios';
import ScheduleAvailability from './ScheduleAvailability';
import SelectedTimeSlots from './SelectedTimeSlots';
import { loadStripe } from '@stripe/stripe-js';
import dayjs from "dayjs";

// Stripe public key
const stripePromise = loadStripe('pk_test_51Pp88307S2BI5VfCmYtp3fVwUogotwzvmjbanMpKelIqQOlCjI3TMdUUSUpmSf7SPLaeWKsdOiUCj9FTgwNQXzBy00rFNvEMOH');

const DatePicker = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [facilities, setFacilities] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isMember, setIsMember] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [lockExpiration, setLockExpiration] = useState(null);  // New state for lock expiration
    const [remainingTime, setRemainingTime] = useState(0);       // New state for remaining time
    const [sessionId, setSessionId] = useState(null);            // State for session ID



    const FloatingTimer = ({ minutes, seconds }) => (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            zIndex: 1000
        }}>
            Time remaining before the slot is vacant: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    );

    // Periodically check session status from the backend
    useEffect(() => {
        const checkSessionStatus = async () => {
            try {
                const response = await axios.get(`/api/check-session-status/${sessionId}`); // Adjust your route here
                if (response.data.session_status !== 'active') {
                    // If session is not active, handle expiration
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('sessionId'); // Clear session ID from local storage
                    setSessionId(null);
                    window.location.href = '/login'; // Redirect to login page
                }
            } catch (error) {
                console.error('Error checking session status:', error);
            }
        };

        // Check session status every minute (60000ms)
        const intervalId = setInterval(checkSessionStatus, 60000);

        return () => clearInterval(intervalId);
    }, [sessionId]);


    // Fetch facilities, membership status, and wallet balance
    useEffect(() => {
        axios.get('/api/facilities')
            .then(response => setFacilities(response.data))
            .catch(error => console.error('Error fetching facilities:', error));

        axios.get('/api/user/membership-status')
            .then(response => setIsMember(response.data.isMember))
            .catch(error => console.error('Error fetching membership status:', error));

        axios.get('/api/wallet')
            .then(response => setWalletBalance(response.data.balance))
            .catch(error => console.error('Error fetching wallet balance:', error));

        const queryParams = new URLSearchParams(window.location.search);
        const facilityId = queryParams.get('facility_id');
        if (facilityId) {
            setSelectedFacility(facilityId);
        }
    }, []);

    const calculateTotalPrice = (selectedFacility, slotCount) => {
        if (!selectedFacility) return 0;
        const pricePerHour = isMember
            ? selectedFacility.price_member
            : selectedFacility.price_non_member;
        return pricePerHour * slotCount;
    };

    useEffect(() => {
        const facility = facilities.find(fac => fac.id === parseInt(selectedFacility));
        setTotalPrice(calculateTotalPrice(facility, selectedSlots.length));
    }, [selectedSlots, selectedFacility, facilities, isMember]);

    const generateTimeSlots = () => {
        const times = [];
        const start = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${startTime}`, 'YYYY-MM-DD hh:mm A');
        const end = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${endTime}`, 'YYYY-MM-DD hh:mm A');
        let current = start;
        while (current.isBefore(end)) {
            const next = current.add(1, 'hour');
            times.push({
                startTime: current.format('hh:mm A'),
                endTime: next.format('hh:mm A'),
                isAvailable: true
            });
            current = next;
        }
        return times;
    };

    const checkAvailability = () => {
        if (!selectedDate || !startTime || !endTime || !selectedFacility) return;

        const timeSlots = generateTimeSlots();
        axios.post('/check-availability', {
            facility_id: selectedFacility,
            date: selectedDate.format('YYYY-MM-DD'),
            timeSlots: timeSlots.map(slot => ({
                start_time: slot.startTime,
                end_time: slot.endTime
            }))
        })
            .then(response => {
                const availableSlots = timeSlots.filter(slot => {
                    const isBooked = response.data.some(bookedSlot =>
                        bookedSlot.start_time === slot.startTime && bookedSlot.end_time === slot.endTime
                    );
                    return !isBooked;
                });
                if (availableSlots.length === 0) {
                    alert('No available time slots for the selected date and time.');
                }
                setAvailableSlots(availableSlots);
            })
            .catch(error => {
                console.error('Error checking availability:', error);
            });
    };

    const lockTimeSlot = async (slot, facilityId) => {
        try {
            const response = await axios.post('/api/lock-slot', {
                slot: slot,
                facility_id: facilityId,
                session_id: sessionId, // Include session ID when locking the slot
            });
            return response.data.session_id; // Capture session ID from the response
        } catch (error) {
            if (error.response && error.response.status === 409) {
                throw new Error('Time slot is already locked by another user.');
            }
            console.error('Error locking the slot:', error.response?.data.message);
            throw error;
        }
    };


    const addTimeSlot = async (slot) => {
        const newSlot = {
            date: selectedDate.format('YYYY-MM-DD'),
            startTime: slot.startTime,
            endTime: slot.endTime,
        };

        // Check if the slot is already selected
        const isSlotAlreadySelected = selectedSlots.some(
            selectedSlot =>
                selectedSlot.date === newSlot.date &&
                selectedSlot.startTime === newSlot.startTime &&
                selectedSlot.endTime === newSlot.endTime
        );

        if (isSlotAlreadySelected) {
            alert('This time slot is already selected.');
            return; // Prevent adding the same slot again
        }

        if (!isMember && selectedSlots.length >= 1) {
            alert('Non-members can only book one time slot per day.');
            return;
        }

        try {
            const sessionId = await lockTimeSlot(newSlot, selectedFacility); // Lock the slot and get session ID
            const expirationTime = Date.now() + 5 * 60 * 1000; // Set expiration time (5 minutes from now)
            setLockExpiration(expirationTime);
            setSelectedSlots([...selectedSlots, newSlot]); // Add the new slot to the list
            setSessionId(sessionId); // Save session ID for later use
            localStorage.setItem('sessionId', sessionId);
        } catch (error) {
            if (error.message === 'Time slot is already locked by another user.') {
                alert(`The time slot ${newSlot.startTime} - ${newSlot.endTime} on ${newSlot.date} is already locked.`);
            } else {
                console.error('Error adding time slot:', error);
                alert('An error occurred while adding the time slot.');
            }
        }
    };


    useEffect(() => {
        const savedSessionId = localStorage.getItem('sessionId');
        if (savedSessionId) {
            setSessionId(savedSessionId); // Restore session ID
        }
    }, []);

    const removeTimeSlot = async (slotToRemove) => {
        const updatedSlots = selectedSlots.filter(
            slot => !(slot.startTime === slotToRemove.startTime && slot.endTime === slotToRemove.endTime)
        );
        try {
            await axios.post('/api/unlock-slot', {
                facility_id: selectedFacility,
                slot: {
                    startTime: slotToRemove.startTime,
                    endTime: slotToRemove.endTime,
                    date: slotToRemove.date
                }
            });
            setLockExpiration(null); // Reset lock expiration and clear the timer
            setSelectedSlots(updatedSlots);
        } catch (error) {
            console.error('Error unlocking the slot:', error);
            alert('Failed to unlock the time slot.');
        }
    };

    const checkLocksBeforePayment = async () => {
        try {
            const response = await axios.post('/check-locked-slots', {
                selectedSlots: selectedSlots.map(slot => ({
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    date: slot.date
                })),
                facilityId: selectedFacility,
            });
            if (response.data.locked) {
                const lockedSlots = response.data.lockedSlots.map(slot =>
                    `${slot.startTime} - ${slot.endTime} on ${slot.date}`
                ).join(', ');
                alert(`The following time slots are locked by another user: ${lockedSlots}`);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking slot locks:', error);
            return false;
        }
    };

    const handleCheckout = async (paymentMethod) => {
        const canProceed = await checkLocksBeforePayment();
        if (!canProceed) return;

        // Close the modal as soon as the alert or confirmation appears
        setShowPaymentOptions(false);

        const facility = facilities.find(fac => fac.id === parseInt(selectedFacility));

        try {
            // Store booking first as in code A
            await axios.post('/bookings', {
                facility_id: selectedFacility,
                selectedSlots: selectedSlots.map(slot => ({
                    date: selectedDate.format('YYYY-MM-DD'),
                    start_time: slot.startTime,
                    end_time: slot.endTime
                })),
                totalPrice: totalPrice,
                session_id: sessionId,
            });

            if (paymentMethod === 'wallet') {
                if (walletBalance >= totalPrice) {
                    // Full wallet payment
                    try {
                        await axios.post('/wallet-payment', { totalPrice: totalPrice });
                        alert('Payment successful with Wallet!');
                        window.location.href = '/payment-success';
                    } catch (error) {
                        console.error('Error processing wallet payment:', error);
                        alert('Error processing wallet payment');
                    }
                } else if (walletBalance > 0) {
                    // Partial wallet payment
                    const confirmPartialPayment = window.confirm(
                        `Your wallet balance is Rs. ${walletBalance.toFixed(2)}, but the total price is Rs. ${totalPrice.toFixed(2)}. ` +
                        `Would you like to use your wallet balance and pay the remaining Rs. ${(totalPrice - walletBalance).toFixed(2)} with your card?`
                    );
                    if (!confirmPartialPayment) {
                        alert('Payment cancelled.');
                        await abandonSession();
                        return;
                    }
                    const remainingAmount = totalPrice - walletBalance;

                    // Deduct wallet balance first
                    try {
                        await axios.post('/wallet-payment', { totalPrice: walletBalance });
                        alert(`Wallet payment of Rs. ${walletBalance.toFixed(2)} successful!`);
                    } catch (error) {
                        console.error('Error processing wallet payment:', error);
                        alert('Error processing wallet payment');
                        return;
                    }

                    // Proceed with Stripe for the remaining amount
                    const stripe = await stripePromise;
                    try {
                        const response = await axios.post('/api/create-checkout-session', {
                            facility: facility.name,
                            totalPrice: remainingAmount,
                        });
                        if (response.data.sessionId) {
                            const result = await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
                            if (result.error) {
                                console.error(result.error.message);
                            }
                        } else {
                            console.error('Error: Missing Stripe session ID.');
                        }
                    } catch (error) {
                        console.error('Error during Stripe checkout process:', error);
                    }
                } else {
                    alert('Insufficient Wallet Balance. Please choose another payment method or add more funds.');
                }
            } else if (paymentMethod === 'stripe') {
                // Full Stripe payment
                const stripe = await stripePromise;
                try {
                    const response = await axios.post('/api/create-checkout-session', {
                        facility: facility.name,
                        totalPrice: totalPrice,
                    });
                    if (response.data.sessionId) {
                        const result = await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
                        if (result.error) {
                            console.error(result.error.message);
                        }
                    } else {
                        console.error('Error: Missing Stripe session ID.');
                    }
                } catch (error) {
                    console.error('Error during Stripe checkout process:', error);
                }
            }
        } catch (error) {
            console.error('Error during the booking process:', error);
            alert('Error during the booking process.');
        }
    };

    // Abandon the session when the user cancels the payment
    const abandonSession = async () => {
        try {
            await axios.post('/api/abandon-session', { session_id: sessionId });
            localStorage.removeItem('sessionId');
            setSessionId(null);
            window.location.reload();
        } catch (error) {
            console.error('Error abandoning session:', error);
        }
    };


    // Timer to handle countdown for locked time slot
    useEffect(() => {
        if (!lockExpiration) return;

        const intervalId = setInterval(() => {
            const timeLeft = lockExpiration - Date.now();
            if (timeLeft <= 0) {
                clearInterval(intervalId);
                setRemainingTime(0);
                alert('The time slots are now open for anyone. Please hurry up!');
                // Optionally handle the expiration of the lock here
            } else {
                setRemainingTime(timeLeft);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [lockExpiration]);

    const minutes = Math.floor(remainingTime / 1000 / 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);

    return (
        <form className="p-5 max-w-4xl mx-auto" onSubmit={e => { e.preventDefault(); checkAvailability(); }}>
            {/* Wallet Balance Card */}
            <div className="mb-8">
                <div className="p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg">
                    <p className="text-xl font-bold text-blue-700">Your Wallet Balance: Rs. {walletBalance.toFixed(2)}</p>
                    <p className="text-md text-blue-500">You can use your wallet balance to book facilities.</p>
                </div>
            </div>

            {/* Floating Timer */}
            {remainingTime > 0 && <FloatingTimer minutes={minutes} seconds={seconds} />}

            {/* Select Facility and Date */}
            <div className="md:flex md:justify-between md:space-x-4 mb-10">
                <div className="md:w-[40vw] mb-2">
                    <p className="text-xl font-bold mb-2">Select Sport:</p>
                    <select
                        className="border border-gray-400 w-full font-semibold bg-white p-[15px] rounded-md hover:border-black"
                        value={selectedFacility}
                        onChange={(e) => setSelectedFacility(e.target.value)}
                        required
                    >
                        <option value="">Select a facility</option>
                        {facilities.map(facility => (
                            <option key={facility.id} value={facility.id}>{facility.name}</option>
                        ))}
                    </select>
                </div>

                <div className="md:w-[40vw] mb-2">
                    <p className="text-xl font-bold mb-2">Select Date:</p>
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <MuiDatePicker
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                className="w-full font-semibold bg-white border border-gray-400 rounded-md p-3"
                                required
                            />
                        </LocalizationProvider>
                    </Box>
                </div>
            </div>

            {/* Select Start and End Time */}
            <div className="md:flex md:justify-between md:space-x-4 mb-10">
                <div className="md:w-[40vw] mb-6 md:mb-0">
                    <p className="text-xl font-bold mb-2">Select Start Time:</p>
                    <select
                        className="border border-gray-400 w-full font-semibold bg-white p-3 rounded-md hover:border-black"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    >
                        <option value="">Select Start Time</option>
                        {["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"].map(
                            (time) => (
                                <option key={time} value={time}>{time}</option>
                            )
                        )}
                    </select>
                </div>

                <div className="md:w-[40vw]">
                    <p className="text-xl font-bold mb-2">Select End Time:</p>
                    <select
                        className="border border-gray-400 w-full font-semibold bg-white p-3 rounded-md hover:border-black"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    >
                        <option value="">Select End Time</option>
                        {["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"].map(
                            (time) => (
                                <option key={time} value={time}>{time}</option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {/* Check availability */}
            <div>
                <button type="submit" className="bg-gray-400 w-full hover:bg-gray-500 hover:font-semibold p-3 mb-4 rounded-lg">
                    Check Availability
                </button>
            </div>

            {/* Display available time slots */}
            {availableSlots.length > 0 && (
                <ScheduleAvailability
                    selectedDate={selectedDate}
                    availableSlots={availableSlots}
                    onTimeSlotSelect={addTimeSlot}
                />
            )}

            {/* Display selected time slots */}
            <SelectedTimeSlots
                selectedSlots={selectedSlots}
                selectedFacility={facilities.find(fac => fac.id === parseInt(selectedFacility))}
                selectedDate={selectedDate}
                onRemoveTimeSlot={removeTimeSlot}
                isMember={isMember}
                totalPrice={totalPrice}
            />

            {/* Payment options after checking availability */}
            {availableSlots.length > 0 && (
                <div className="mt-6">
                    <button
                        type="button"
                        className="bg-gray-400 w-full hover:bg-gray-500 hover:font-semibold p-3 rounded-lg"
                        onClick={() => setShowPaymentOptions(true)}
                        disabled={selectedSlots.length === 0}
                    >
                        Proceed to Payment (Rs. {totalPrice.toFixed(2)})
                    </button>
                </div>
            )}

            {/* Modal for payment options */}
            {showPaymentOptions && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg relative">
                        {/* Close Button */}
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPaymentOptions(false)} // Close modal
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4">Choose Payment Method</h2>
                        <p className="mb-4">Your Wallet Balance: Rs. {walletBalance.toFixed(2)}</p>
                        <div className="flex space-x-4">
                            <button
                                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg"
                                onClick={() => handleCheckout('wallet')}
                            >
                                Pay with Wallet
                            </button>
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg"
                                onClick={() => handleCheckout('stripe')}
                            >
                                Pay with Card
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default DatePicker;
