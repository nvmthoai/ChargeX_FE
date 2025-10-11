import axiosInstance from "../../app/config/axios";


export const getKycProfileById = async (id:string) => {
  try {
    const response = await axiosInstance.get(`/kyc-profiles/${id}`);
    console.log("KYC profile detail:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching KYC profile by id:", error);
    throw error;
  }
};

export const postKycProfile = async (data: { level: "basic" | "advanced"; note: string }) => {
  try {
    const response = await axiosInstance.post(`/kyc-profiles`, data);
    console.log("Created KYC profile:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating KYC profile:", error);
    throw error;
  }
};