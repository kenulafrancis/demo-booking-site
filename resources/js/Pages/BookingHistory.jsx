import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Modal from 'react-modal';
import FloatingButton from "@/Components/FloatingButton.jsx";

// Helper function to format the date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
};

// Helper function to check if a booking has passed the current time
const isPastBooking = (bookingEndTime, bookingDate) => {
    const today = new Date();
    const bookingEndDateTime = new Date(`${bookingDate}T${bookingEndTime}`);
    return bookingEndDateTime < today;
};

export default function BookingHistory({ auth }) {
    const [bookings, setBookings] = useState([]);
    const [selectedDateBookings, setSelectedDateBookings] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isCancel, setIsCancel] = useState(false); // Track if it's a cancel action

    // Fetch bookings data
    useEffect(() => {
        async function fetchBookings() {
            try {
                const response = await axios.get('/api/bookings');
                const formattedBookings = response.data.map(booking => ({
                    ...booking,
                    date: formatDate(booking.booking_date), // Format the booking date
                }));
                setBookings(formattedBookings); // Store bookings in state
            } catch (error) {
                console.error('Error fetching bookings', error);
            }
        }
        fetchBookings();
    }, []);

    // Separate upcoming and past bookings
    const upcomingBookings = bookings.filter(booking => !isPastBooking(booking.end_time, booking.booking_date));
    const pastBookings = bookings.filter(booking => isPastBooking(booking.end_time, booking.booking_date));

    // Group bookings by formatted date for upcoming bookings
    const groupedUpcomingBookings = upcomingBookings.reduce((acc, booking) => {
        const date = booking.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(booking);
        return acc;
    }, {});

    // Group bookings by formatted date for past bookings
    const groupedPastBookings = pastBookings.reduce((acc, booking) => {
        const date = booking.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(booking);
        return acc;
    }, {});

    // Function to open modal for viewing or cancelling bookings
    const openModal = (date, isCancelAction = false) => {
        setSelectedDateBookings(groupedUpcomingBookings[date] || groupedPastBookings[date]);
        setIsCancel(isCancelAction); // Track if it's a cancel action
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedDateBookings([]);
        setIsCancel(false);
    };

    // Handle booking cancellation with check for 24-hour rule
    const handleCancelBooking = async (bookingId) => {
        try {
            // Call the API to check if the cancellation is allowed
            const response = await axios.post('/api/bookings/check-cancel', { booking_id: bookingId });

            // If the response allows cancellation
            if (response.status === 200) {
                const { can_cancel, within_24_hours } = response.data;

                if (can_cancel) {
                    // Proceed to cancel booking since it's within the allowed time
                    if (!within_24_hours) {
                        // Ask the user for confirmation if cancellation is within 24 hours
                        if (!window.confirm("This booking is past the refundable period. Do you want to proceed with cancellation without a refund?")) {
                            return; // If user does not confirm, exit
                        }
                    }

                    // Call the API to cancel the booking
                    const cancelResponse = await axios.post('/api/bookings/cancel', { booking_id: bookingId });

                    if (cancelResponse.status === 200) {
                        // Remove the canceled booking from the state
                        const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
                        setBookings(updatedBookings);

                        // Alert the user about the wallet refund if applicable
                        if (!within_24_hours) {
                            alert("Your booking has been canceled, but no refund was issued as the refundable period has expired.");
                        } else {
                            alert("Your booking has been canceled, and the refund has been added to your wallet.");
                        }

                        // Close the modal if it's open
                        closeModal();
                    }
                }
            } else if (response.status === 400) {
                alert("Cancellation must be done 24 hours before the booking time.");
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert("There was an issue canceling your booking. Please try again later.");
        }
    };


    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Booking History" />

            <div className="min-h-screen bg-gray-100">
                <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    {/* Upcoming Bookings Section */}
                    <section className="mb-12 p-5 bg-[#dcf763cc] rounded-xl">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Upcoming Bookings</h2>
                        <div className="grid grid-cols-1 mid-up:grid-cols-2 gap-6">
                            {Object.keys(groupedUpcomingBookings).length > 0 ? (
                                Object.keys(groupedUpcomingBookings).map((date) => (
                                    <div key={date} className="bg-white shadow-lg rounded-lg p-6">
                                        <h3 className="text-xl font-semibold text-gray-700">{date}</h3>
                                        <p>Total Bookings: {groupedUpcomingBookings[date].length}</p>
                                        <button
                                            onClick={() => openModal(date, false)}
                                            className="mt-4 bg-[#a1a49999] hover:bg-[#a1a4b4e6] hover:font-semibold p-3 mb-2 rounded-xl"
                                        >
                                            View More
                                        </button>
                                        <button
                                            onClick={() => openModal(date, true)} // Pass true for cancel action
                                            className="mt-4 bg-red-500 text-white hover:bg-red-600 p-3 rounded-xl ml-4"
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-2xl font-semibold">No Upcoming Bookings Available.</p>
                            )}
                        </div>
                    </section>

                    {/* Past Bookings Section */}
                    <section className="mb-12 p-5 bg-gray-200 rounded-xl">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Past Bookings</h2>
                        <div className="grid grid-cols-1 mid-up:grid-cols-2 gap-6">
                            {Object.keys(groupedPastBookings).length > 0 ? (
                                Object.keys(groupedPastBookings).map((date) => (
                                    <div key={date} className="bg-white shadow-lg rounded-lg p-6">
                                        <h3 className="text-xl font-semibold text-gray-700">{date}</h3>
                                        <p>Total Bookings: {groupedPastBookings[date].length}</p>
                                        <button
                                            onClick={() => openModal(date, false)}
                                            className="mt-4 bg-blue-500 text-white hover:bg-blue-600 p-3 rounded-xl"
                                        >
                                            View More
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-2xl font-semibold">No Past Bookings Available.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Modal for detailed booking history */}
                {selectedDateBookings.length > 0 && (
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel={isCancel ? "Cancel Booking" : "Booking Details"}
                        className="p-6 bg-white shadow-lg rounded-lg max-w-2xl mx-auto"
                    >
                        <h2 className="text-2xl font-semibold mb-4">
                            {isCancel ? `Cancel Bookings on ${selectedDateBookings[0].date}` : `Bookings on ${selectedDateBookings[0].date}`}
                        </h2>

                        {selectedDateBookings.map((booking) => (
                            <div key={booking.id} className="border-b border-gray-300 mb-4 pb-4">
                                {/* Facility */}
                                <div className="mb-2">
                                    <span className="font-bold">Facility:</span> {booking.facility.name}
                                </div>

                                {/* Time */}
                                <div className="mb-2">
                                    <span className="font-bold">Time:</span> {booking.start_time} - {booking.end_time}
                                </div>

                                {/* Price */}
                                <div className="mb-2">
                                    <span className="font-bold">Price:</span> ${booking.price}
                                </div>

                                {/* Show cancel button only if it's a cancel action */}
                                {isCancel && (
                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        ))}

                        <button onClick={closeModal} className="mt-6 bg-blue-500 text-white px-4 py-2 rounded">
                            Close
                        </button>
                    </Modal>
                )}

                <FloatingButton />
            </div>
        </AuthenticatedLayout>
    );
}
