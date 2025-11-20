import { Statistic, Space, Card } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import type { MyWallet } from "../../models/wallet.model";



interface WalletDisplayProps {
  wallet: MyWallet;
}

export default function WalletDisplay({ wallet }: WalletDisplayProps) {
  return (
    <Card className="bg-white shadow-sm border border-ocean-100/50">
      <Space direction="vertical" size="small" className="w-full">
        <div className="flex items-center gap-2">
          <WalletOutlined className="text-ocean-600 text-lg" />
          <span className="text-sm font-semibold text-ocean-700">Ví của tôi</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Statistic
              title={<span className="text-ocean-600 font-medium">Balance</span>}
              value={Number(wallet.balance)?.toLocaleString() + " VND"}
              valueStyle={{ color: "#1890ff", fontSize: "16px", fontWeight: "600" }}
            />
          </div>
          <div>
            <Statistic
              title={<span className="text-energy-600 font-medium">Held</span>}
              value={Number(wallet.held)?.toLocaleString() + " VND"}
              valueStyle={{ color: "#faad14", fontSize: "16px", fontWeight: "600" }}
            />
          </div>
          <div>
            <Statistic
              title={<span className="text-green-600 font-medium">Available</span>}
              value={Number(wallet.available)?.toLocaleString() + " VND"}
              valueStyle={{ color: "#52c41a", fontSize: "16px", fontWeight: "600" }}
            />
          </div>
        </div>
      </Space>
    </Card>
  );
}
