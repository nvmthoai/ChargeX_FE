import { Card, Image, Tag, Space, Button, Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  description: string;
  priceStart: string;
  priceBuyNow: string;
  priceNow: string | null;
  status: string;
  imageUrls: string[] | null;
  sohPercent: number;
  cycleCount: number;
  nominalVoltageV: number;
  weightKg: number;
  conditionGrade: string;
  dimension: string;
  isAuction: boolean;
  endTime: string | null;
  createdAt: string;
}

export default function ShopProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();

  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : ["/diverse-products-still-life.png"];

  return (
    <Badge.Ribbon
      text={product.isAuction ? "Auction" : "Buy Now"}
      color={product.isAuction ? "#f59e0b" : "#3b82f6"}
    >
      <Card hoverable className="border-0 shadow-sm h-full flex flex-col">
        <div className="mb-4 bg-slate-100 rounded-lg overflow-hidden h-48">
          <Image
            src={images[0]}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        <p className="text-sm text-slate-600 mb-4 truncate">{product.description}</p>

        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">SOH:</span>
            <Tag color="blue">{product.sohPercent}%</Tag>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Condition:</span>
            <Tag>{product.conditionGrade}</Tag>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <div>Cycle: {product.cycleCount}</div>
            <div>Voltage: {product.nominalVoltageV}V</div>
            <div>Weight: {product.weightKg}kg</div>
            <div>Size: {product.dimension}</div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-200">
          <div className="mb-4">
            {product.priceStart && (
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 text-sm">Start Price:</span>
                <span className="font-semibold text-slate-900">
                  {Number(product.priceStart).toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}

            {product.priceNow && (
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 text-sm">Current:</span>
                <span className="font-bold text-blue-600 text-lg">
                  {Number(product.priceNow).toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}

            {product.priceBuyNow && !product.priceNow && (
              <div className="flex justify-between">
                <span className="text-slate-600 text-sm">Buy Now:</span>
                <span className="font-bold text-lg text-slate-900">
                  {Number(product.priceBuyNow).toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}
          </div>

          <Space className="w-full" size="small">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              block
              onClick={() => navigate(`/productdetail/${product.id}`)}
            >
              {product.isAuction ? "Bid" : "Buy"}
            </Button>

            <Button block onClick={() => navigate(`/productdetail/${product.id}`)}>
              Details
            </Button>
          </Space>
        </div>
      </Card>
    </Badge.Ribbon>
  );
}
