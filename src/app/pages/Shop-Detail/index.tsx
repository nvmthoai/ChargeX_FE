import { Tabs, Empty, Spin } from "antd";
import ShopHeader from "./ShopHeader";
import ShopProductCard from "./ShopProductCard";
import ShopAddresses from "./ShopAddresses";
import useUser from "../../hooks/useUser";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

 const  ShopDetailPage =()=> {
  const { fetchShopDetail, shopDetail, loading } = useUser();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchShopDetail(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Spin size="large" />
      </div>
    );
  }

  if (!shopDetail) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <Empty description="No shop shopDetail available" />
      </div>
    );
  }

  const tabItems = [
    {
      key: "products",
      label: `Products (${shopDetail.stats.totalProducts})`,
      children: (
        <div className="bg-slate-50 p-6 rounded-lg">
          {shopDetail.products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopDetail.products.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Empty description="No products available" />
          )}
        </div>
      ),
    },
    {
      key: "addresses",
      label: `Addresses (${shopDetail.addresses.length})`,
      children: <ShopAddresses addresses={shopDetail.addresses} />,
    },
    {
      key: "reviews",
      label: `Reviews (${shopDetail.stats.totalReviews})`,
      children: (
        <div className="bg-slate-50 p-6 rounded-lg">
          {shopDetail.reviews.length > 0 ? (
            <div className="space-y-4">
              {/* Reviews will be rendered here */}
            </div>
          ) : (
            <Empty description="No reviews yet" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <ShopHeader seller={shopDetail.seller} stats={shopDetail.stats} />

        <Tabs
          items={tabItems}
          className="bg-white rounded-lg shadow-sm mt-8"
          tabBarStyle={{
            backgroundColor: "#1e293b",
            borderRadius: "8px 8px 0 0",
            margin: 0,
          }}
        />
      </div>
    </div>
  );
}
export default ShopDetailPage;