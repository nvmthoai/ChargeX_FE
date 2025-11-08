export interface Review {
  id: string
  order: {
    orderId: string
  }
  reviewer: {
    userId: string
    fullName: string
    email: string
    image?: string
  }
  reviewee: {
    userId: string
    fullName: string
    email: string
  }
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}