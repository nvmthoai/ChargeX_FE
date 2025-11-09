export interface ReportUser {
    userId: string
    email: string
    phone: string
    image: string | null
    fullName: string
}

export interface ReportOrder {
    orderId: string
    receiverName: string
    receiverPhone: string
    receiverAddress: string | null
    receiverDistrictId: string | null
    receiverWardCode: string | null
    totalPrice: string
    totalShippingFee: string
    grandTotal: string
    status: string
    createdAt: string
    updatedAt: string
}

export interface ReportMessage {
    id: string
    sender?: ReportUser
    body: string
    attachments: string
    createdAt: string
    updatedAt: string
}

export interface Report {
    id: string
    openedBy: ReportUser
    order: ReportOrder
    type: "refund" | "damaged" | "not_received" | "other"
    status: "pending" | "resolved" | "rejected" | "refunded"
    createdAt: string
    updatedAt: string
    messages: ReportMessage[]
}

export interface ResolvePayload {
    status: "refunded" | "rejected" | "resolved"
    refundAmount?: number
    adminNote: string
}
