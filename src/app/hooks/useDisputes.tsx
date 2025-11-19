import { useState } from "react";
import disputesService from "../services/DisputesService";
import { App } from "antd";
import type { Report } from "../models/dispute.model";
import { updateOrder } from "../../api/order/api";
import { OrderStatus } from "../../api/order/type";

const useDisputes = () => {
    const [disputes, setDisputes] = useState<Report[]>([])
    const { message } = App.useApp();
    const { createDisputes, getDisputeDetail, getDisputes, resolveDisputes } = disputesService();

    const handleCreateDisputes = async (orderId: string, values: any) => {
        const response = await createDisputes(orderId, values);
        if (response) {
            message.success('Create disputes successfully!')
            try {
                // Update order status to 'disputed' so UI and backend are in sync
                await updateOrder(orderId, { status: OrderStatus.DISPUTED, eventNote: 'User opened dispute' });
            } catch (err) {
                // Log but do not block — it's safe to continue even if this update fails
                console.error('Failed to update order status to disputed:', err);
            }
            return response
        }
        return null;
    };

    const fetchDisputes = async () => {
        const response = await getDisputes();
        if (response) {
            setDisputes(response.data.data)
        }
    };

    const fetchDisputeDetail = async (id: string) => {
        const response = await getDisputeDetail(id);
        if (response) {
            return response
        }
        return null;
    };

    const handleResolve = async (id: string, values: any) => {
        const response = await resolveDisputes(id, values);
        if (response) {
             message.success('Resolve dispute successfully!')
            return response
        }
        return null;
    };

    return {
        handleCreateDisputes,
        fetchDisputes,
        fetchDisputeDetail,
        handleResolve,
        disputes
    };
};

export default useDisputes;
