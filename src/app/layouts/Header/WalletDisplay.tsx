import { Statistic, Space, Card } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import type { MyWallet } from "../../models/wallet.model";



interface WalletDisplayProps {
  wallet: MyWallet;
}

export default function WalletDisplay({ wallet }: WalletDisplayProps) {
  return (
    <Card className="bg-white shadow-sm border-0">
      <Space direction="vertical" size="small" className="w-full">
        <div className="flex items-center gap-2">
          <WalletOutlined className="text-blue-500 text-lg" />
          <span className="text-sm font-semibold text-gray-700">My Wallet</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Statistic
              title="Balance"
              value={wallet.balance}
              prefix="$"
              valueStyle={{ color: "#1890ff", fontSize: "14px" }}
            />
          </div>
          <div>
            <Statistic
              title="Held"
              value={wallet.held}
              prefix="$"
              valueStyle={{ color: "#faad14", fontSize: "14px" }}
            />
          </div>
          <div>
            <Statistic
              title="Available"
              value={wallet.available}
              prefix="$"
              valueStyle={{ color: "#52c41a", fontSize: "14px" }}
            />
          </div>
        </div>
      </Space>
    </Card>
  );
}
