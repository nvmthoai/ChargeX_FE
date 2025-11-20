import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, Empty, Spin } from "antd";
import { 
  Store, 
  Package, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  Users,
  Award
} from "lucide-react";
import ShopHeader from "./ShopHeader";
import ShopProductCard from "./ShopProductCard";
import ShopAddresses from "./ShopAddresses";
import useUser from "../../hooks/useUser";

const ShopDetailPage = () => {
  const { fetchShopDetail, shopDetail, loading } = useUser();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (id) {
      fetchShopDetail(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-slate-600">Đang tải thông tin cửa hàng...</p>
        </div>
      </div>
    );
  }

  if (!shopDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Store className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Không tìm thấy cửa hàng
          </h3>
          <p className="text-slate-600">
            Cửa hàng này không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: "products",
      label: (
        <span className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Sản phẩm ({shopDetail.stats.totalProducts})
        </span>
      ),
      children: (
        <div className="p-6">
          {shopDetail.products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopDetail.products.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Chưa có sản phẩm
              </h3>
              <p className="text-slate-600">
                Cửa hàng này chưa có sản phẩm nào được đăng bán.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "addresses",
      label: (
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Địa chỉ
        </span>
      ),
      children: <ShopAddresses addresses={shopDetail.addresses} />,
    },
    {
      key: "reviews",
      label: (
        <span className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          Đánh giá ({shopDetail.stats.totalReviews})
        </span>
      ),
      children: (
        <div className="p-6">
          {shopDetail.reviews.length > 0 ? (
            <div className="space-y-4">
              {/* Reviews will be rendered here */}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Chưa có đánh giá
              </h3>
              <p className="text-slate-600">
                Cửa hàng này chưa nhận được đánh giá nào từ khách hàng.
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-ocean-500 via-energy-500 to-ocean-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ShopHeader seller={shopDetail.seller} stats={shopDetail.stats} />
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="shop-detail-tabs"
            tabBarStyle={{
              backgroundColor: "#f8fafc",
              padding: "0 24px",
              margin: 0,
              borderBottom: "2px solid #e2e8f0",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        :global(.shop-detail-tabs .ant-tabs-tab) {
          padding: 16px 24px !important;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s;
        }
        :global(.shop-detail-tabs .ant-tabs-tab:hover) {
          color: #3b82f6;
        }
        :global(.shop-detail-tabs .ant-tabs-tab-active) {
          color: #3b82f6;
        }
        :global(.shop-detail-tabs .ant-tabs-ink-bar) {
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          height: 3px;
        }
      `}</style>
    </div>
  );
};

export default ShopDetailPage;