"use client"

import auctionService from "../services/Auction"
import { App } from "antd"
import { getUserInfo } from "./useAddress"
import { useState, useCallback } from "react"

export interface requestCreateAuctionValues {
  sellerId: string
  productId: string
  note: string
}

const useAuction = () => {
  const { message } = App.useApp()
  const {
    sendRequestCreateAuction,
    adminGetRequestCreateAuction,
    adminHandleApproveRequest,
    adminGetAuctions,
    adminCreateLive,
  } = auctionService()
  const [loading, setLoading] = useState(false)

  const currentUser = getUserInfo()

  const handleSendRequest = async (values: requestCreateAuctionValues) => {
    console.log("requestCreateAuctionValues: ", values)
    const response = await sendRequestCreateAuction(values.sellerId, values.productId, values.note)
    if (response) {
      message.success("Send request to admin successfully!")
      return response.data
    }
    return null
  }

  const getRequestCreateAuction = async () => {
    const response = await adminGetRequestCreateAuction()
    if (response) {
      return response.data
    }
    return null
  }

  const handleApproveRequest = async (values: any) => {
    if (currentUser.role === "admin") {
      const response = await adminHandleApproveRequest(currentUser.sub, values)
      if (response) {
        message.success("Approved successfully!")
        return response.data
      }
    }
    return null
  }

  const getAuctions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminGetAuctions()
      if (response) {
        return response.data
      }
      return []
    } catch (error) {
      message.error("Failed to fetch auctions")
      return []
    } finally {
      setLoading(false)
    }
  }, [adminGetAuctions, message])

  const createLive = useCallback(
    async (auctionId: string) => {
      setLoading(true)
      try {
        const response = await adminCreateLive(auctionId)
        if (response) {
          message.success("Auction is now live!")
          return response.data
        }
        return null
      } catch (error) {
        // Try to surface server error message if available (403/401 reasons)
        const err: any = error
        const serverMsg = err?.response?.data?.message || err?.message || "Failed to create live auction"
        message.error(serverMsg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [adminCreateLive, message],
  )

  return {
    handleSendRequest,
    getRequestCreateAuction,
    handleApproveRequest,
    getAuctions,
    createLive,
    loading,
  }
}

export default useAuction
