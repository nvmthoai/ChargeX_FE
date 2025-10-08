/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import api from "../config/axios";

const useApiService = () => {
  const [loading, setIsLoading] = useState<boolean>(false);
  const callApi = useCallback(
    async (
      method: "get" | "post" | "put" | "delete",
      url: string,
      data?: any
    ) => {
      try {
        setIsLoading(true);
        let response;

        if (method === "get") {
          response = await api.get(url, { params: data });
        } else if (method === "post") {
          response = await api.post(url, data);
        } else if (method === "put") {
          response = await api.put(url, data);
        } else if (method === "delete") {
          response = await api.delete(url, { data });
        } else {
          throw new Error(`Unsupported method: ${method}`);
        }

        console.log(response);
        return response.data;
      } catch (e: any) {
        console.error('useApiService: ', e);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );


  return { loading, callApi, setIsLoading };
};

export default useApiService;
