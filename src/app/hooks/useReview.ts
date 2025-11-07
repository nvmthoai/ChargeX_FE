import { App } from "antd";
import reviewService from "../services/ReviewService";

export interface createReviewValues {
    orderId: string,
    reviewerId: string,
    revieweeId: string,
    rating: number,
    comment: string
}

const useReview = () => {
    const { createReview } = reviewService();
    const { message } = App.useApp();
    const handleCreateReview = async (values: createReviewValues) => {
        const response = await createReview(values);
        if (response) {
            message.success('Reviewed shop successfully!')
            return response
        }
        return null;
    };

    return {
        handleCreateReview,
    };
};

export default useReview;
