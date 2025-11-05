export interface MyWallet {
  balance: number;
  held: number;
  available: number;
}

export interface PayoutRequest {
  id: string
  wallet: {
    user: {
      userId: string
      email: string
      phone: string
      fullName: string
      image: null | string
    }
  }
  amount: string
  description: string // JSON string with accountNumber, bankCode, note
  status: "pending" | "approved" | "rejected"
  createdAt: string
  userData: {
    userId: string
    email: string
    fullName: string
    phone: string
    image: null | string
  }
}

export interface PayoutDescription {
  accountNumber: string
  bankCode: string
  note: string
}
