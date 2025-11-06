import { CheckCircleFilled, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { OrderEvent } from "../../../../api/orderevent/type";

interface Props {
  events: OrderEvent[];
}

export default function OrderTracking({ events }: Props) {
  const steps = [
    { key: "pending", label: "Order Created" },
    { key: "paid", label: "Paid" },
    { key: "handed_to_carrier", label: "Handed to Carrier" },
    { key: "in_transit", label: "In Transit" },
    { key: "delivered", label: "Delivered" },
    { key: "completed", label: "Completed" },
  ];

  const eventMap = Object.fromEntries(
    events.map((e) => [e.status.toLowerCase(), e.createdAt])
  );

  const currentIndex = steps.findIndex(
    (s) => s.key === events.at(-1)?.status?.toLowerCase()
  );

  return (
    <div className="bg-gray-50 p-5 rounded-xl mb-8">
      <h3 className="text-lg font-semibold mb-4">Order Tracking</h3>
      <div className="flex justify-between text-sm text-gray-600">
        {steps.map((step, index) => {
          const completed = index <= currentIndex;
          const current = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center w-1/6">
              {completed ? (
                <CheckCircleFilled className="text-green-500 text-xl mb-1" />
              ) : current ? (
                <ClockCircleOutlined className="text-yellow-500 text-xl mb-1" />
              ) : (
                <CheckCircleFilled className="text-gray-300 text-xl mb-1" />
              )}

              <span
                className={`${
                  completed || current
                    ? "text-gray-800 font-medium"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {eventMap[step.key]
                  ? dayjs(eventMap[step.key]).format("DD/MM/YYYY HH:mm")
                  : "--/--/----"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
