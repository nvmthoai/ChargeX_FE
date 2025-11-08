import { useState } from "react"
import { Modal, Button, Form, Input, Rate, Space, Empty, Tag, Divider, message, Popconfirm } from "antd"
import { EditOutlined, DeleteOutlined } from "@ant-design/icons"
import type { Review } from "../../../models/review.model"

interface ReviewListModalProps {
  visible: boolean
  orderId: string
  sellerId: string
  sellerName: string
  onClose: () => void
  reviews: Review[]
  onUpdateReview?: (reviewId: string, data: { rating: number; comment: string }) => Promise<void>
  onDeleteReview?: (reviewId: string) => Promise<void>
}

export default function ReviewListModal({
  visible,
  sellerName,
  onClose,
  reviews,
  onUpdateReview,
  onDeleteReview,
}: ReviewListModalProps) {
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editForm] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleEditClick = (review: Review) => {
    setEditingReviewId(review.id)
    editForm.setFieldsValue({
      rating: review.rating,
      comment: review.comment,
    })
  }

  const handleCancelEdit = () => {
    setEditingReviewId(null)
    editForm.resetFields()
  }

  const handleUpdateReview = async (reviewId: string) => {
    try {
      const values = await editForm.validateFields()
      setLoading(true)
      if (onUpdateReview) {
        await onUpdateReview(reviewId, {
          rating: values.rating,
          comment: values.comment,
        })
        message.success("Review updated successfully")
        setEditingReviewId(null)
        editForm.resetFields()
      }
    } catch (error) {
      message.error("Failed to update review")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      setLoading(true)
      if (onDeleteReview) {
        await onDeleteReview(reviewId)
        message.success("Review deleted successfully")
      }
    } catch (error) {
      message.error("Failed to delete review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={`Reviews for ${sellerName}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={600}
    >
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Empty description="No reviews yet" />
        ) : (
          reviews.map((review, index) => (
            <div key={review.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              {editingReviewId === review.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-900">Rating</label>
                    <Form form={editForm} layout="vertical">
                      <Form.Item name="rating" className="mb-3">
                        <Rate />
                      </Form.Item>
                      <Form.Item name="comment" className="mb-3">
                        <Input.TextArea rows={3} placeholder="Enter your comment" />
                      </Form.Item>
                    </Form>
                  </div>
                  <Space>
                    <Button type="primary" size="small" loading={loading} onClick={() => handleUpdateReview(review.id)}>
                      Save
                    </Button>
                    <Button size="small" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </Space>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{review.reviewer.fullName}</span>
                        <Tag color="blue">{review.rating} ⭐</Tag>
                      </div>
                      <p className="text-xs text-slate-600">{review.reviewer.email}</p>
                    </div>
                    <Space size="small">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditClick(review)}
                      />
                      <Popconfirm
                        title="Delete review"
                        description="Are you sure you want to delete this review?"
                        onConfirm={() => handleDeleteReview(review.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{review.comment}</p>
                  <div className="text-xs text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    {review.updatedAt !== review.createdAt &&
                      ` (edited ${new Date(review.updatedAt).toLocaleDateString("vi-VN")})`}
                  </div>
                </>
              )}
              {index < reviews.length - 1 && <Divider className="my-3" />}
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}
