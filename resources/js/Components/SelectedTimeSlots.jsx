
import React from 'react';

const SelectedTimeSlots = ({ selectedSlots, onRemoveTimeSlot, selectedFacility, selectedDate, isMember, totalPrice }) => {
    return (
        <div className="mt-6 overflow-x-auto">
            <p className="text-xl font-bold mb-2">Selected Time Slots:</p>
            <table className="min-w-full bg-white border border-gray-200 table-fixed">
                <thead>
                <tr>
                    <th className="w-1/5 py-2 px-4 border-b text-left">Facility Name</th>
                    <th className="w-1/5 py-2 px-4 border-b text-left">Date</th>
                    <th className="w-1/5 py-2 px-4 border-b text-left">Time Slot</th>
                    <th className="w-1/5 py-2 px-4 border-b text-left">Price (per hour)</th>
                    <th className="w-1/5 py-2 px-4 border-b text-center">Action</th>
                </tr>
                </thead>
                <tbody>
                {selectedSlots.map((slot, index) => (
                    <tr key={index}>  {/* Use 'index' instead of slot to avoid key duplication */}
                        <td className="py-2 px-4 border-b">{selectedFacility?.name || 'Unknown'}</td>
                        <td className="py-2 px-4 border-b">{slot.date}</td>
                        {/* Use slot.date to show the specific date */}
                        <td className="py-2 px-4 border-b">{slot.startTime} - {slot.endTime}</td>
                        <td className="py-2 px-4 border-b">
                            {isMember
                                ? `Rs.${selectedFacility?.price_member} per hour`
                                : `Rs.${selectedFacility?.price_non_member} per hour`
                            }
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                            <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => onRemoveTimeSlot(slot)}
                            >
                                Remove
                            </button>
                        </td>
                    </tr>
                ))}
                <tr>
                    <td className="py-2 px-4 border-b font-bold" colSpan="3">Total:</td>
                    <td className="py-2 px-4 border-b font-bold">
                        Rs.{totalPrice.toFixed(2)} {/* Display the total price */}
                    </td>
                    <td className="py-2 px-4 border-b"></td>
                </tr>
                </tbody>


            </table>
        </div>
    );
};

export default SelectedTimeSlots;
