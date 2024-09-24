import React from 'react';
import { Head } from '@inertiajs/react';
import FacilityCarousel from '@/Components/FacilityCarousel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import facilitySelectorHomeBgImg from '../../images/facilitySelectorHomeBgImg.gif';

export default function FacilitiesPage({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Our Facilities" />

            {/* Background image container */}
            <div
                className="pageContent w-full h-screen bg-cover bg-center flex justify-center items-center"
                style={{ backgroundImage: `url(${facilitySelectorHomeBgImg})` }}
            >
                <FacilityCarousel auth={auth} />
            </div>
        </AuthenticatedLayout>
    );
}
