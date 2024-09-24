
import React from 'react';

const ScheduleAvailability = ({ selectedDate, availableSlots, onTimeSlotSelect }) => {
    return (
        <div className="mt-4">
            <p className="text-xl font-bold mb-2">Available Time Slots for {selectedDate.format('YYYY-MM-DD')}:</p>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                <tr>
                    <th className="py-2 px-4 border-b">Time Slot (Start - End)</th>
                    <th className="py-2 px-4 border-b">Availability</th>
                    <th className="py-2 px-4 border-b">Action</th>
                </tr>
                </thead>
                <tbody>
                {availableSlots.map((slot, index) => (  // Added index to key
                    <tr key={`${slot.startTime}-${slot.endTime}-${index}`}>
                        <td className="py-2 px-4 border-b">{slot.startTime} - {slot.endTime}</td>
                        <td className="py-2 px-4 border-b">
                            {slot.isAvailable ? (
                                <span className="text-green-600">Available</span>
                            ) : (
                                <span className="text-red-600">Booked</span>
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {slot.isAvailable && (
                                <button
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    onClick={() => onTimeSlotSelect(slot)}
                                >
                                    Add
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleAvailability;
