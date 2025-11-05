import {
  Table,
  Empty,
  Input,
  Tag,
  Row,
  Col,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import useWallet from "../../../hooks/useWallet";

export interface Transaction {
  id: string;
  createdAt: string;
  description: string;
  type: "Deposit" | "Withdraw";
  amount: number;
}

export default function ProfileWallet({}) {
  const [searchText, setSearchText] = useState("");
  const { transactions } = useWallet();

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchesSearch
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      width: 200,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <span className="font-medium text-slate-700">{text}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: "Deposit" | "Withdraw") => {
        const isDeposit = type === "Deposit";
        return (
          <Tag
            icon={isDeposit ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            color={isDeposit ? "green" : "red"}
            className="font-medium"
          >
            {isDeposit ? "Deposit" : "Withdraw"}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: Transaction) => {
        const isDeposit = record.type === "Deposit";
        return (
          <span
            className={`font-semibold ${
              isDeposit ? "text-green-600" : "text-red-600"
            }`}
          >
            {isDeposit ? "+" : "-"}
            {amount.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        );
      },
      width: 150,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Transaction History
            </h2>

            <Row gutter={16} className="mb-4">
              <Col xs={24} sm={12}>
                <Input
                  placeholder="Search transactions..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="rounded-lg"
                />
              </Col>
            </Row>
          </div>

          {filteredTransactions.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredTransactions.map((t) => ({
                ...t,
                key: t.id,
              }))}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          ) : (
            <Empty description="No transactions found" />
          )}
        </div>
      </div>
    </div>
  );
}
