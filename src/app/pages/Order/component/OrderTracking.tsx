  import { CheckCircleFilled } from "@ant-design/icons";
  import dayjs from "dayjs";
  import {
    ClipboardList,
    Truck,
    PackageCheck,
    Home,
  } from "lucide-react";

  import type { OrderEvent } from "../../../../api/orderevent/type";

  interface Props {
    events: OrderEvent[];
  }

  export default function OrderTracking({ events }: Props) {
    const steps = [
      { key: "pending", label: "Order Created", icon: ClipboardList },
      { key: "in_transit", label: "Delivering", icon: Truck },
      { key: "delivered", label: "Delivered", icon: PackageCheck },
      { key: "completed", label: "Completed", icon: Home },
    ];

    // ================================
    // SORT EVENTS TĂNG DẦN THEO NGÀY
    // ================================
    const sortedEvents = [...events].sort(
      (a, b) =>
        new Date(a.createdAt ?? 0).getTime() -
        new Date(b.createdAt ?? 0).getTime()
    );


    // Map event → date
    const eventMap = Object.fromEntries(
      sortedEvents.map((e) => [e.status.toLowerCase(), e.createdAt])
    );

    // Status cuối cùng = trạng thái hiện tại
    const latestStatus = sortedEvents.at(-1)?.status?.toLowerCase();

    // Tìm index của step hiện tại
    const currentIndex = latestStatus
      ? steps.findIndex((s) => s.key === latestStatus)
      : 0;

    console.log("EVENTS:", sortedEvents);
    console.log("Current Status:", latestStatus);
    console.log("Current Index:", currentIndex);

    return (
      <div className="rounded-2xl mb-10">

        <h3 className="text-xl font-bold mb-6 text-gray-700">Order Tracking</h3>

        {/* =========================== */}
        {/* TRACK AREA (CIRCLE + LINE)  */}
        {/* =========================== */}
        <div className="relative w-full h-20 flex items-center justify-between px-6">

          {/* Background Line */}
          <div className="absolute left-[12.5%] right-[12.5%] h-[3px] bg-gray-200 top-1/2 -translate-y-1/2 rounded-full" />

          {/* Filled Line */}
          <div
            className="absolute left-[12.5%] h-[3px] bg-blue-500 top-1/2 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{
              width: `${(currentIndex / (steps.length - 1)) * 75}%`,
            }}
          />


          {/* Circles */}
          {steps.map((step, index) => {
            const active = index <= currentIndex;

            return (
              <div key={step.key} className="relative z-10 flex justify-center w-1/4">
                <div
                  className={`
                    w-12 h-12 flex items-center justify-center rounded-full border-2
                    ${active
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-gray-300 text-gray-300"
                    }
                  `}
                >
                  <CheckCircleFilled className="text-xl" />
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================== */}
        {/* LABEL + ICON AREA           */}
        {/* =========================== */}
        <div className="flex justify-between px-6 mt-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const active = index <= currentIndex;

            const date = eventMap[step.key]
              ? dayjs(eventMap[step.key]).format("MMM DD")
              : "--";

            return (
              <div key={step.key} className="w-1/4 flex flex-col items-center">

                {/* Icon + Label */}
                <div
                  className={`
                    flex items-center gap-2 text-sm
                    ${active ? "text-blue-600 font-semibold" : "text-gray-400"}
                  `}
                >
                  <Icon
                    className={`
                      w-5 h-5
                      ${active ? "text-blue-600" : "text-gray-300"}
                    `}
                  />
                  {step.label}
                </div>

                {/* Date */}
                <div className="text-xs text-gray-400">{date}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
