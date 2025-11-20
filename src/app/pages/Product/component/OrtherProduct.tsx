import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../app/config/axios";
import type { Product } from "../../../../api/product/type";
import { Loader2 } from "lucide-react";

interface OrtherProductProps {
    sellerId: string | null;
    currentProductId?: string;
}

export default function OrtherProduct({ sellerId, currentProductId }: OrtherProductProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!sellerId) {
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Sử dụng trực tiếp API endpoint giống như getMyProducts
                const response = await axiosInstance.get(`/product-listing`, {
                    params: {
                        seller_id: sellerId,
                        page: 1,
                        limit: 8, // Lấy tối đa 8 sản phẩm
                    },
                });

                const res = response.data;
                const payload = res.data || {};
                let productsList = payload.data || [];

                // Loại bỏ sản phẩm hiện tại
                if (currentProductId) {
                    productsList = productsList.filter((p: Product) => p.id !== currentProductId);
                }

                setProducts(productsList);
            } catch (error) {
                console.error("❌ Error fetching related products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sellerId, currentProductId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-ocean-500 animate-spin" />
            </div>
        );
    }

    if (!sellerId) {
        return null;
    }

    if (products.length === 0) {
        return (
            <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-dark-900">
                        Related Products
                    </h3>
    
                    <button
                        onClick={() => navigate(`/shop-detail/${sellerId}`)}
                        className="text-ocean-500 hover:text-ocean-600 font-medium text-sm"
                    >
                        View Shop →
                    </button>
                </div>
    
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-200 text-center">
                    <p className="text-dark-600 text-lg font-medium">
                        This shop currently has no other products available.
                    </p>
                    <p className="text-dark-500 text-sm mt-1 mb-6">
                        You can explore other items or return to the homepage.
                    </p>
    
                    {/* ⭐ Nút về Home Page */}
                    <button
                        onClick={() => navigate("/")}
                        className="px-5 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-all text-sm font-medium"
                    >
                        Go to Home Page
                    </button>
                </div>
            </div>
        );
    }
    
    

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-dark-900">Sản phẩm liên quan</h3>

                <button
                    onClick={() => navigate(`/shop-detail/${sellerId}`)}
                    className="text-ocean-500 hover:text-ocean-600 font-medium text-sm"
                >
                    View All →
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/productdetail/${product.id}`)}
                        className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <div className="aspect-square w-full overflow-hidden bg-gray-100">
                            <img
                                src={product.imageUrls?.[0] || "/default_product.png"}
                                alt={product.title || "Product"}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <div className="p-4">
                            <h4 className="font-semibold text-sm text-dark-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                                {product.title || "-"}
                            </h4>
                            <div className="flex items-center justify-between">
                                <p className="text-ocean-500 font-bold text-base">
                                    ${Number(product.price_buy_now || product.price_start || 0).toLocaleString()}
                                </p>
                                {product.is_auction && (
                                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded font-medium">
                                        Đấu giá
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

