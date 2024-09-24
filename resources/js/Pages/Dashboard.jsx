import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import FloatingButton from '@/Components/FloatingButton';

// Importing images from resources/images folder
import homeTitleBG from '../../images/homeTitleBG.gif';
import homeIntroImg from '../../images/homeIntroImg.webp';
import wineNDine from '../../images/wineNDine_Services.png';
import banquetHalls from '../../images/banquetHalls_Services.jpg';
import swimmingPool from '../../images/swimmingPools_Services.jpg';
import gymnasium from '../../images/gymnasium_Services.webp';
import sportsFacilities from '../../images/sportsFacillities_Services.jpg';
import kidsPlayArea from '../../images/kidsPlayArea_Services.jpeg';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className=''>
                <img className="bg-cover h-[300px] md:h-[400px] lg:h-[500px] w-full" src={homeTitleBG} alt="Home Background" />
            </div>

            <div className="pageContent  bg-white">


                <div className="m-4 p-2 lg:m-[60px]">
                    <h1 className="text-4xl font-bold lg:text-5xl">Fingara Town and Country Club</h1>

                    <div className="bg-[#dcf763cc] p-4 mt-5 rounded-3xl md:flex lg:gap-5 lg:p-[30px] lg:mt-8">
                        <img className="rounded-3xl md:w-[48%] md:h-auto mr-3 lg:w-[50%]" src={homeIntroImg} alt="Home Intro" />
                        <div>
                            <p className="text-2xl font-semibold text-[#423e3b]">
                                The Fingara Family Club designed with a novel, modern, and functional concept presents you a unique holiday experience.
                            </p>
                            <br />
                            <p className="text-2xl font-semibold text-[#424e4d]">Celebrating 20 Years in the Hospitality Industry</p>
                            <br />
                            <br />
                            <p className="text-black text-xl font-medium">
                                Since the Club opened in 2003, it has offered some of the finest sports and social facilities to its members. The Club has many spaces and areas which can be reserved by members and guests. Details on how to do so and other useful information can be found on these pages.
                            </p>
                        </div>
                    </div>
                    <br />
                    <br />

                    <div>
                        <h1 className="text-3xl font-bold lg:text-4xl">Services</h1>
                        <div className="md:flex md:gap-7">
                            <div className="bg-[#dcf763cc] p-4 mt-5 rounded-3xl md:w-[32%]">
                                <img className="rounded-3xl w-full md:h-[300px]" src={wineNDine} alt="Wine and Dine" />
                                <div>
                                    <h1 className="text-xl font-bold text-black my-2">Wine and Dine</h1>
                                    <p className="text-lg font-medium text-black">
                                        The Fingara Family Club designed with a novel, modern and functional concept presents you a unique holiday experience.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#dcf763cc] p-4 mt-5 rounded-3xl md:w-[32%]">
                                <img className="rounded-3xl w-full" src={banquetHalls} alt="Banquet Halls" />
                                <div>
                                    <h1 className="text-xl font-bold text-black my-2">Banquet Halls</h1>
                                    <p className="text-lg font-medium text-black">
                                        Our Banquet Hall can easily accommodate and cater up to 250 - 300 pax at any given time. All material required for seminars, workshops, and receptions are provided by the club. We provide catering for any banquet or function undertaken at Fingara.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#dcf763cc] p-4 mt-5 rounded-3xl md:w-[32%]">
                                <img className="rounded-3xl w-full" src={swimmingPool} alt="Swimming Pool" />
                                <div>
                                    <h1 className="text-xl font-bold text-black my-2">Swimming Pool</h1>
                                    <p className="text-lg font-medium text-black">
                                        Our swimming pool is situated within the club under a perfect setting. Many consider this pool to be one of the clearest in Sri Lanka. We also have our own swimming coach who conducts lessons regularly. A kiddie's pool is available for all the water babies.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="md:flex md:gap-7">
                            <div className="bg-[#dcf763cc] p-4 mt-5 rounded-3xl md:w-[32%]">
                                <img className="rounded-3xl w-full" src={gymnasium} alt="Gymnasium" />
                                <div>
                                    <h1 className="text-xl font-bold text-black my-2">Gymnasium</h1>
                                    <p className="text-lg font-medium text-black">
                                        The club is equipped with a modern gymnasium with the latest exercising equipment. Professional gym instructors are at hand to provide individual attention to all members. The gym also offers luxurious Pine wood Saunas.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#dcf763cc] p-4 mt-5 rounded-3xl md:w-[32%]">
                                <img className="rounded-3xl w-full" src={sportsFacilities} alt="Sports Facilities" />
                                <div>
                                    <h1 className="text-xl font-bold text-black my-2">Sports Facilities</h1>
                                    <p className="text-lg font-medium text-black">
                                        Providing you with a chance to get an hour of fast and furious exercise before you leave for work with facilities such as Badminton, Tennis, and Squash. Whether you're looking for casual play or competitive matches, our meticulously maintained courts offer the perfect setting for every game. Elevate your athletic experience in a luxurious and welcoming environment!
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#dcf763cc] p-4 mt-5 rounded-3xl md:w-[32%]">
                                <img className="rounded-3xl w-full md:h-[35vh]" src={kidsPlayArea} alt="Kids Play Area" />
                                <div>
                                    <h1 className="text-xl font-bold text-black my-2">Kids Play Area</h1>
                                    <p className="text-lg font-medium text-black">
                                        Our country club offers a vibrant and safe kids' play area designed to spark imagination and fun. With a variety of engaging play structures, interactive games, and secure surroundings, children can explore, learn, and play while parents relax and enjoy the club's other amenities.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    <br />

                    <div>
                        <h1 className="text-3xl font-bold lg:text-4xl">Location</h1>
                        <div className="bg-[#dcf763cc] p-6 mt-5 rounded-3xl md:flex md:gap-4">
                            <iframe
                                id="mapLocation"
                                className="w-full rounded-3xl md:h-auto border-0"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.3266865433793!2d79.89660647475635!3d6.851387493146935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25a8c87bf9a1d%3A0x1dbf20242721d4b7!2sFingara%20Club!5e0!3m2!1sen!2slk!4v1723350488703!5m2!1sen!2slk"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                            <div>
                                <p className="text-xl font-semibold text-black">
                                    Completely cut off from the busy complexities of Colombo, yet situated within its city limits, is the serenely beautiful Fingara Town and Country Club. Located at Boralesgamuwa.
                                </p>
                                <br />
                                <p className="text-xl font-semibold text-[#423e3b]">A host of facilities, unheard of elsewhere, are at your disposal. Such as,</p>
                                <ul className="list-disc text-[#423e3b] mx-8">
                                    <li>Swimming Pool</li>
                                    <li>Tennis</li>
                                    <li>Badminton</li>
                                    <li>Squash</li>
                                    <li>Gymnasium</li>
                                    <li>Kids Play Area</li>
                                    <li>Table Tennis</li>
                                    <li>Indoor Games</li>
                                    <li>Restaurant and Pub</li>
                                    <li>Coffee Shop</li>
                                    <li>Seminar and Conference Halls</li>
                                    <li>Banquet Halls</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <FloatingButton />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
