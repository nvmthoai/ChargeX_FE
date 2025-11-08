import { App } from "antd";
import reviewService from "../services/ReviewService";
import { useState } from "react";
import type { Review } from "../models/review.model";

export interface createReviewValues {
    orderId: string,
    reviewerId: string,
    revieweeId: string,
    rating: number,
    comment: string
}

const useReview = () => {
    const { createReview, deleteReview, updateReview, getMyReviews } = reviewService();
    const { message } = App.useApp();
    const [reviews, setReviews] = useState<Review[]>([])
    
    const fetchMyReviewInEachShop = async (reviewerId: string, revieweeId: string) => {
        const response = await getMyReviews(reviewerId, revieweeId);
        if (response) {
            setReviews(response.data.data)
            return response
        }
        return null;
    };

    const handleCreateReview = async (values: createReviewValues) => {
        const response = await createReview(values);
        if (response) {
            message.success('Reviewed shop successfully!')
            return response
        }
        return null;
    };

    const handleDeleteReview = async (id: string) => {
        const response = await deleteReview(id);
        if (response) {
            message.success('Deleted review successfully!')
            return response
        }
        return null;
    };

    const handleUpdateReview = async (id: string, values: any) => {
        const response = await updateReview(values, id);
        if (response) {
            message.success('Update review successfully!')
            return response
        }
        return null;
    };

    return {
        reviews,
        handleCreateReview,
        fetchMyReviewInEachShop,
        handleDeleteReview,
        handleUpdateReview
    };
};

export default useReview;
