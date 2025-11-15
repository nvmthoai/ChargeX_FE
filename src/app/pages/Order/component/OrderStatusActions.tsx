import { Button, Space, Tooltip, message, Input, Modal } from "antd";
import { CheckCircleOutlined, TruckOutlined, SmileOutlined } from "@ant-design/icons";
import type { Order } from "../../../../api/order/type";
import { OrderStatus } from "../../../../api/order/type";
import { useState } from "react";

interface Props {
  order: Order;
  role: "buyer" | "seller";
  onStatusChange: (key: string) => void;
  loading?: boolean;
}

export default function OrderStatusActions({ order, role, onStatusChange, loading = false }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");

  // Define actions based on current status and user role
  const getAvailableActions = () => {
    const actions: Array<{
      key: string;
      label: string;
      icon: React.ReactNode;
      tooltip: string;
      color: string;
      visible: boolean;
    }> = [];

    if (role === "seller") {
      if (order.status === OrderStatus.PAID) {
        actions.push({
          key: "mark-delivered",
          label: "Mark as Delivered",
          icon: <TruckOutlined />,
          tooltip: "Confirm shipment has been delivered to carrier",
          color: "blue",
          visible: true,
        });
      }
    }

    if (role === "buyer") {
      if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.DELIVERED_PENDING_CONFIRM) {
        actions.push({
          key: "mark-completed",
          label: "Confirm Receipt",
          icon: <CheckCircleOutlined />,
          tooltip: "Confirm that you have received and are satisfied with the order",
          color: "green",
          visible: true,
        });
      }
    }

    return actions;
  };

  const actions = getAvailableActions();

  const handleActionClick = (key: string) => {
    setSelectedAction(key);
    setIsModalVisible(true);
    setNote("");
  };

  const handleConfirm = async () => {
    if (!selectedAction) return;

    try {
      onStatusChange(selectedAction);
      setIsModalVisible(false);
      setSelectedAction(null);
      setNote("");
      message.success("Order status updated successfully");
    } catch (err) {
      console.error("Error updating order status:", err);
      message.error("Failed to update order status");
    }
  };

  if (actions.length === 0) {
    return null;
  }

  const action = actions.find((a) => a.key === selectedAction);

  return (
    <>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <SmileOutlined className="text-lg" />
          Available Actions
        </h4>
        <Space wrap>
          {actions.map((actionItem) => (
            <Tooltip key={actionItem.key} title={actionItem.tooltip}>
              <Button
                type="primary"
                color={actionItem.color}
                icon={actionItem.icon}
                onClick={() => handleActionClick(actionItem.key)}
                loading={loading}
                disabled={loading}
              >
                {actionItem.label}
              </Button>
            </Tooltip>
          ))}
        </Space>
      </div>

      <Modal
        title={action ? `${action.label}` : "Confirm Action"}
        open={isModalVisible}
        onOk={handleConfirm}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedAction(null);
          setNote("");
        }}
        okText="Confirm"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <p className="text-gray-600">{action && action.tooltip}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a note (optional)
            </label>
            <Input.TextArea
              placeholder="e.g., 'Package received in perfect condition' or 'Confirmed delivered'"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
