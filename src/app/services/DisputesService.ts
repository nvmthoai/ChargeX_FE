import { useCallback } from "react";
import useApiService from "../hooks/useApi";
import { HTTP_METHOD } from "../constants/enum";

const disputesService = () => {
    const { callApi, loading, setIsLoading } = useApiService();

    const createDisputes = useCallback(
        async (orderId: string, values: any) => {
            try {
                const response = await callApi(HTTP_METHOD.POST, `/disputes/${orderId}`, values);
                return response;
            } catch (e: any) {
                console.log(e?.response?.data);
            }
        },
        [callApi]
    );

    const getDisputes = useCallback(
        async () => {
            try {
                const response = await callApi(HTTP_METHOD.GET, `/disputes?page=1&limit=10`);
                return response;
            } catch (e: any) {
                console.log(e?.response?.data);
            }
        },
        [callApi]
    );

    const getDisputeDetail = useCallback(
        async (disputeId: string) => {
            try {
                const response = await callApi(HTTP_METHOD.GET, `/disputes/${disputeId}`);
                return response;
            } catch (e: any) {
                console.log(e?.response?.data);
            }
        },
        [callApi]
    );

    const resolveDisputes = useCallback(
        async (disputeId: string, values: any) => {
            try {
                const response = await callApi(HTTP_METHOD.POST, `/disputes/${disputeId}/resolve`, {...values});
                return response;
            } catch (e: any) {
                console.log(e?.response?.data);
            }
        },
        [callApi]
    );

    return {
        loading,
        setIsLoading,
        createDisputes,
        getDisputes,
        getDisputeDetail,
        resolveDisputes
    };
};

export default disputesService;
