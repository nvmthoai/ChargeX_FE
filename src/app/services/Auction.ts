import { useState } from "react";
import { auctionApi, type RequestAuctionDto, type ApproveAuctionDto } from "../../api/auction";

const auctionService = () => {
  const [loading, setLoading] = useState(false);

  const sendRequestCreateAuction = async (sellerId: string, productId: string, note: string) => {
    try {
      setLoading(true);
      const data: RequestAuctionDto = { productId, note };
      const response = await auctionApi.requestAuction(sellerId, data);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const adminGetRequestCreateAuction = async () => {
    try {
      setLoading(true);
      const response = await auctionApi.getRequests();
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const adminHandleApproveRequest = async (adminId: string, values: ApproveAuctionDto) => {
    try {
      setLoading(true);
      const response = await auctionApi.approveAuction(adminId, values);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const adminGetAuctions = async () => {
    try {
      setLoading(true);
      const response = await auctionApi.getAllAuctionIds();
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const adminCreateLive = async (auctionId: string) => {
    try {
      setLoading(true);
      const response = await auctionApi.goLive(auctionId);
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setIsLoading: setLoading,
    sendRequestCreateAuction,
    adminGetRequestCreateAuction,
    adminHandleApproveRequest,
    adminGetAuctions,
    adminCreateLive,
  };
};

export default auctionService;
