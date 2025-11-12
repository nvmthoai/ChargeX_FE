import { useState } from "react";
import { getAllProducts } from "../../api/product/api";

const productService = () => {
  const [loading, setLoading] = useState(false);

  const getAllProduct = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      return response;
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // TODO: This function seems incomplete - needs proper implementation
  const sendRequestCreateAuction = async () => {
    try {
      setLoading(true);
      // This endpoint seems wrong - needs to be fixed
      // const response = await callApi(HTTP_METHOD.POST, `/all`);
      // return response;
      throw new Error("sendRequestCreateAuction not implemented");
    } catch (e: any) {
      console.log(e?.response?.data);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getAllProduct,
    setIsLoading: setLoading,
    sendRequestCreateAuction
  };
};

export default productService;
