import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/FacilityCarousel.css";
import { Link } from '@inertiajs/react';

export default function FacilityCarousel() {
    const [facilities, setFacilities] = useState([]);
    const [settings, setSettings] = useState({
        dots: true,
        infinite: false, // default set to false to avoid duplicate slides
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    });

    useEffect(() => {
        // Fetch the facilities data from the API
        axios.get('/api/facilities')
            .then(response => {
                setFacilities(response.data);
                // Adjust the carousel settings based on the data
                adjustCarouselSettings(response.data);
            })
            .catch(error => {
                console.error('Error fetching facilities!', error);
            });

        // Function to dynamically adjust the settings based on screen size and facilities length
        const adjustCarouselSettings = (facilitiesData) => {
            const facilitiesCount = facilitiesData.length;

            const updateSettingsBasedOnScreenSize = () => {
                if (window.innerWidth >= 1130) {
                    setSettings({
                        dots: true,
                        infinite: facilitiesCount > 3, // Only set infinite to true if there are more than 3 facilities
                        speed: 500,
                        slidesToShow: 3,
                        slidesToScroll: 3
                    });
                } else if (window.innerWidth >= 820) {
                    setSettings({
                        dots: true,
                        infinite: facilitiesCount > 2, // Only set infinite to true if there are more than 2 facilities
                        speed: 500,
                        slidesToShow: 2,
                        slidesToScroll: 2
                    });
                } else {
                    setSettings({
                        dots: true,
                        infinite: facilitiesCount > 1, // Only set infinite to true if there are more than 1 facility
                        speed: 500,
                        slidesToShow: 1,
                        slidesToScroll: 1
                    });
                }
            };

            updateSettingsBasedOnScreenSize();
            window.addEventListener("resize", updateSettingsBasedOnScreenSize);

            return () => window.removeEventListener("resize", updateSettingsBasedOnScreenSize);
        };
    }, []);

    return (
        <div className="w-full flex justify-center items-center mt-9">
            {/* Ensure the container takes full width and centers the content */}
            <div className="w-full md:w-4/5 lg:w-3/4 mx-auto">
                <Slider {...settings}>
                    {facilities.map(facility => (
                        <div key={facility.id} className="facilityCards bg-[#dcf763cc] rounded-3xl h-auto p-4">
                            <div>
                                <img className="h-[43vh] w-full rounded-3xl object-cover" src={`/storage/${facility.image_path}`} alt={facility.name} />
                            </div>
                            <div className="m-4">
                                <p className="text-xl font-semibold">{facility.name}</p>
                                <p className="h-[15vh] lg:h-[18vh] overflow-hidden">{facility.description}</p>

                                <div className="flex justify-between mt-4">
                                    <Link href={`/facilities/${facility.id}`}>
                                        <button className="facilityCardBtns bg-[#a1a49999] hover:bg-[#a1a4b4e6] hover:font-semibold p-3 mb-2 rounded-xl">
                                            See More
                                        </button>
                                    </Link>
                                    <button
                                        className="facilityCardBtns bg-[#a1a49999] hover:bg-[#a1a4b4e6] hover:font-semibold p-3 mb-2 rounded-xl"
                                        onClick={() => window.location.href = `/tennis-reservations?facility_id=${facility.id}`}
                                    >
                                        Reserve Now
                                    </button>
                                    <Link href={`/facilities/${facility.id}`}>
                                        <button className="facilityCardBtns bg-[#a1a49999] hover:bg-[#a1a4b4e6] hover:font-semibold p-3 mb-2 rounded-xl">
                                            Write a Review
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}
