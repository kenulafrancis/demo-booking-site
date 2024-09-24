import React from 'react';
import DatePicker from '../components/DatePicker';
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import tennisCourtImg from '../../images/tennisCourtImg.jpeg';

export default function TennisReservations({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tennis Reservation" />

            <div>
                <img
                    className="bg-cover h-[300px] md:h-[400px] lg:h-[500px] w-full"
                    src={tennisCourtImg}
                    alt="Tennis Court"
                />
            </div>

            <div className='m-6 p-2 lg:m-[60px]'>
                <p className='font-bold text-3xl'>Reservation</p>

                <div className='bg-[#dcf763cc] p-4 mt-5 rounded-3xl md:flex lg:gap-5 lg:p-[30px] lg:mt-8'>
                    <DatePicker />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
