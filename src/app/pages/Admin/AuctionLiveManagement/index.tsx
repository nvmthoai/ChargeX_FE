import { useState, useEffect } from "react";
import { Table, Button, Input, Space, Tag, Spin } from "antd";
import "./AuctionLiveManagement.css";
import "../NavigationBar/NavigationBar.css";
import useAuction from "../../../hooks/useAuction";
export default function AuctionLiveManagement() {
  const { getAuctions, createLive, loading } = useAuction();
  const [auctions, setAuctions] = useState([]);
  // const [liveAuctions, setLiveAuctions] = useState<any>([])
  const [searchText, setSearchText] = useState("");
  // const [statusFilter, setStatusFilter] = useState<string | undefined>();
  // const [modalVisible, setModalVisible] = useState(false)
  // const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAuctions();
      if (data) {
        let filtered = data;

        if (searchText) {
          filtered = filtered.filter((a: any) =>
            a.title.toLowerCase().includes(searchText.toLowerCase())
          );
        }

        setAuctions(filtered);
      }
    };

    fetchData();
  }, [ searchText, getAuctions]);

  // const handleGoLiveClick = (auctionId: string) => {
  //   setSelectedAuctionId(auctionId)
  //   setModalVisible(true)
  // }

  // const handleGoLiveSubmit = async (data: any) => {
  //   if (selectedAuctionId) {
  //     const result = await createLive(selectedAuctionId)
  //     if (result) {
  //       setLiveAuctions([...liveAuctions, result])
  //       setAuctions(auctions.filter((a: any) => a.auctionId !== selectedAuctionId))
  //       setModalVisible(false)
  //     }
  //   }
  // }

  const auctionColumns: any = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "scheduled" ? "blue" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: "Current Price",
      dataIndex: "currentPrice",
      key: "currentPrice",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          onClick={() => createLive(record.auctionId)}
          style={{ backgroundColor: "#fb8b24", borderColor: "#fb8b24" }}
        >
          Go Live
        </Button>
      ),
    },
  ];

  // const liveColumns = [
  //   {
  //     title: "ID",
  //     dataIndex: "id",
  //     key: "id",
  //     width: 200,
  //   },
  //   {
  //     title: "Status",
  //     dataIndex: "status",
  //     key: "status",
  //     render: (status: string) => <Tag color="green">{status.toUpperCase()}</Tag>,
  //   },
  //   {
  //     title: "Start Time",
  //     dataIndex: "startTime",
  //     key: "startTime",
  //     render: (time: string) => new Date(time).toLocaleString(),
  //   },
  //   {
  //     title: "End Time",
  //     dataIndex: "endTime",
  //     key: "endTime",
  //     render: (time: string) => new Date(time).toLocaleString(),
  //   },
  //   {
  //     title: "Reserve Price",
  //     dataIndex: "reservePrice",
  //     key: "reservePrice",
  //   },
  //   {
  //     title: "Current Price",
  //     dataIndex: "currentPrice",
  //     key: "currentPrice",
  //   },
  // ]

  return (
    <div className="admin-container">
      <div className="section">
        <h2>Auctions</h2>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search auctions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          {/* <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value="scheduled">Scheduled</Select.Option>
            <Select.Option value="draft">Draft</Select.Option>
          </Select> */}
        </Space>

        <Spin spinning={loading}>
          <Table
            columns={auctionColumns}
            dataSource={auctions}
            rowKey="auctionId"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </div>

      {/* <div className="section">
        <h2>Live Auctions</h2>
        <Spin spinning={loading}>
          <Table columns={liveColumns} dataSource={liveAuctions} rowKey="id" pagination={{ pageSize: 10 }} />
        </Spin>
      </div> */}
    </div>
  );
}
