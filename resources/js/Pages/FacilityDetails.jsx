import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FloatingButton from "@/Components/FloatingButton.jsx";
import Review from "@/Components/Review.jsx";

export default function FacilityDetails({ id }) {
    const [facility, setFacility] = useState(null);

    useEffect(() => {
        axios.get(`/api/facilities/${id}`)
            .then(response => {
                setFacility(response.data);
            })
            .catch(error => {
                console.error('Error fetching facility details!', error);
            });
    }, [id]);

    if (!facility) {
        return <div>Loading...</div>;
    }

    return (
        <AuthenticatedLayout>
            <Head title={facility.name} />
            <div className="facility-detail-container">
                {/* Hero Image */}
                <div className="">
                    {/* Apply fixed height and width */}
                    <img
                        className="bg-cover"
                        style={{ height: '500px', width: '100%', objectFit: 'cover' }}
                        src={`/storage/${facility.detailed_image_path}`}
                        alt={facility.name}
                    />
                </div>

                {/* Facility Overview */}
                <div className="pageContent">
                    <div className="m-4 p-2 lg:m-[60px]">
                        <h1 className="text-4xl font-bold lg:text-5xl">{facility.name}</h1>
                        <div className="bg-[#dcf763cc] p-4 mt-5 rounded-3xl lg:gap-5 lg:p-[30px] lg:mt-8">
                            <h2 className="text-3xl font-bold">Overview</h2>
                            <p className="text-black text-xl font-medium mt-4">
                                {facility.description}
                            </p>

                            {/* Detailed Image and Text */}
                            <div className="md:flex mt-4">
                                <img
                                    className="rounded-3xl md:w-[48%] md:h-[80vh] mr-3 lg:w-[50%]"
                                    src={`/storage/${facility.image_path}`}
                                    alt={`${facility.name} Detailed`}
                                />
                                <div className="m-4">
                                    <ul className="list-disc pl-5">
                                        {facility.detailed_description && facility.detailed_description.map((detail, index) => (
                                            <li key={index} className="text-lg">
                                                <span className="text-[#423e3b] font-bold">{detail.label}:</span> {detail.content}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Rules and Regulations */}
                            <div className="mt-4">
                                <h2 className="text-3xl font-bold" id="rules">Rules and Regulations</h2>
                                <div className="xl:flex xl:gap-4 mt-4">
                                    <div>
                                        <ol className="list-decimal pl-5">
                                            {facility.rules_and_regulations && facility.rules_and_regulations.map((rule, index) => (
                                                <li key={index} className="text-lg">
                                                    {rule.rule}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>



                        </div>
                        <Review facilityId={id} />


                    </div>



                    <FloatingButton />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
