import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Review({ facilityId }) {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: '', comment: '' });
    const [showModal, setShowModal] = useState(false);
    const [reviewBreakdown, setReviewBreakdown] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [mostHelpfulReview, setMostHelpfulReview] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 3); // Show only 3 reviews initially
    const [loading, setLoading] = useState(false); // Add loading state

    useEffect(() => {
        // Fetch reviews for this facility
        axios.get(`/api/facilities/${facilityId}/reviews`)
            .then(response => {
                const fetchedReviews = response.data;
                setReviews(fetchedReviews);
                updateReviewBreakdown(fetchedReviews); // Update star rating breakdown
                setMostHelpfulReview(getMostHelpfulReview(fetchedReviews)); // Set most helpful review
            })
            .catch(error => {
                console.error('Error fetching reviews!', error);
            });
    }, [facilityId]);

    // Calculate the breakdown of reviews by rating (1-5 stars)
    const updateReviewBreakdown = (reviews) => {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            breakdown[review.rating]++;
        });
        setReviewBreakdown(breakdown);
    };

    // Get the most helpful review (in this case, we'll use the highest rated or most recent 5-star review)
    const getMostHelpfulReview = (reviews) => {
        const sortedReviews = [...reviews].sort((a, b) => b.rating - a.rating || new Date(b.created_at) - new Date(a.created_at));
        return sortedReviews.find(review => review.rating === 5) || sortedReviews[0]; // Default to the highest rated review
    };

    // Calculate the percentage of reviews for each star rating
    const getPercentage = (count) => {
        const totalReviews = reviews.length;
        if (totalReviews === 0) return 0;
        return (count / totalReviews) * 100;
    };

    // Handle form submission to add a review
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading

        try {
            const apiKey = 'AIzaSyCoZQ80RAJksGLUHa3WTNetuQft4UrdAAQ'; // Replace with your actual API key
            const response = await axios.post(
                `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
                {
                    comment: { text: newReview.comment },
                    languages: ['en'],
                    requestedAttributes: { TOXICITY: {} }
                }
            );

            const toxicityScore = response.data.attributeScores.TOXICITY.summaryScore.value;

            if (toxicityScore > 0.7) {  // Toxicity threshold
                alert('Your review contains inappropriate language. Please revise it.');
            } else {
                // Proceed with review submission
                await axios.post(`/api/facilities/${facilityId}/write/reviews`, newReview);

                const updatedReviews = await axios.get(`/api/facilities/${facilityId}/reviews`);
                setReviews(updatedReviews.data);
                updateReviewBreakdown(updatedReviews.data);
                setMostHelpfulReview(getMostHelpfulReview(updatedReviews.data));

                setNewReview({ rating: '', comment: '' }); // Reset form
                setShowModal(false); // Close the modal
            }
        } catch (error) {
            alert('Error while checking or submitting your review. Please try again.');
            console.error('Error checking for inappropriate content or submitting review:', error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleRatingChange = (rating) => {
        setNewReview({ ...newReview, rating });
    };

    const Star = ({ filled }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-6 h-6 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );

    return (
        <div className="reviews-section py-10">
            {/* Header */}
            <h2 className="text-4xl font-bold mb-8 text-center">Customer Reviews & Ratings</h2>

            {/* Rating Breakdown */}
            <div className="grid grid-cols-12 gap-8 mb-11">
                <div className="col-span-12 xl:col-span-4 flex flex-col items-center gap-y-4">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center w-full">
                            <p className="font-medium text-lg mr-2">{star}</p>
                            <Star filled />
                            <p className="h-2 w-full bg-gray-200 ml-5 mr-3 rounded-full">
                                <span className={`h-full rounded-full bg-indigo-500`} style={{ width: `${getPercentage(reviewBreakdown[star])}%` }}></span>
                            </p>
                            <p className="font-medium text-lg">{reviewBreakdown[star]}</p>
                        </div>
                    ))}
                </div>

                {/* Ratings Summary and Buttons */}
                <div className="col-span-12 xl:col-span-8 flex flex-col items-center gap-y-6">
                    <div className="flex justify-between w-full items-center">
                        <div className="text-center">
                            <h3 className="text-5xl font-bold">
                                {reviews.length > 0 ? (
                                    (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                                ) : '0'}
                            </h3>
                            <p className="text-lg text-gray-500">{reviews.length} Ratings</p>
                        </div>

                        {/* Write a Review & View All Reviews Buttons */}
                        <div className="flex gap-x-4">
                            <button
                                onClick={() => setShowModal(true)}
                                className="rounded-full px-6 py-4 bg-indigo-600 font-semibold text-lg text-white shadow-sm transition-all duration-500 hover:bg-indigo-700"
                            >
                                Write A Review
                            </button>
                            <button
                                onClick={() => setShowAllReviews(!showAllReviews)}
                                className="rounded-full px-6 py-4 bg-white font-semibold text-lg text-indigo-600 shadow-sm transition-all duration-500 hover:bg-indigo-100"
                            >
                                {showAllReviews ? 'Show Less' : 'See All Reviews'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Most Helpful Positive Review */}
            {mostHelpfulReview && (
                <div className="pb-8 border-b border-gray-200">
                    <h4 className="font-semibold text-3xl mb-6">Most Helpful Positive Review</h4>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {[...Array(5)].map((_, i) => <Star key={i} filled={i < mostHelpfulReview.rating} />)}
                        </div>
                        <div className="flex items-center gap-3">
                            <h6 className="font-semibold">@{mostHelpfulReview.user.name}</h6>
                            <p className="text-gray-400">{new Date(mostHelpfulReview.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <p className="text-lg text-gray-500">{mostHelpfulReview.comment}</p>
                </div>
            )}

            {/* Display List of Reviews (Limited by showAllReviews state) */}
            {/* Display List of Reviews (Limited by showAllReviews state) */}
            <ul className="space-y-6">
                {reviewsToShow.map(review => (
                    <li key={review.id} className="p-6 bg-white shadow-lg rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <strong className="mr-3">{review.user.name}</strong>
                                <p className="text-gray-400">{review.user.email}</p>
                            </div>
                            <div className="flex">
                                {[...Array(5)].map((_, index) => (
                                    <Star key={index} filled={index < review.rating} />
                                ))}
                            </div>
                            <p className="text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                    </li>
                ))}
            </ul>

            {/* Review Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                        <h3 className="text-3xl font-bold mb-6">Add Your Review</h3>
                        <form onSubmit={handleSubmitReview} className="bg-gray-50 p-8 rounded-lg shadow-lg">
                            <div className="mb-6">
                                <label className="block text-lg mb-2">Rating</label>
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <div
                                            key={num}
                                            className="cursor-pointer"
                                            onClick={() => handleRatingChange(num)}
                                        >
                                            <Star filled={num <= newReview.rating} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-lg mb-2">Comment</label>
                                <textarea
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    className="block w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    rows="4"
                                    placeholder="Write your review here..."
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                    disabled={loading} // Disable button while loading
                                >
                                    {loading ? 'Submitting...' : 'Submit Review'}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

