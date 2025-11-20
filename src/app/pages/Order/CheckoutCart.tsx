import { ArrowLeftOutlined } from "@ant-design/icons";
import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchData, getQueryString } from "../../../mocks/CallingAPI";
import useAddress from "../../hooks/useAddress";
import AddressFormModal from "../Manage-Address/AddressFormModal";
import AddressList from "../Manage-Address/AddressList";

export default function CheckoutCart() {
    const token = localStorage.getItem('token') || '';
    const location = useLocation();
    const selectedItems = location.state;
    // console.log('selectedItems', selectedItems);
    const navigate = useNavigate();

    const { addresses, handleCreateAddress, handleUpdateAddress, isLoading } = useAddress();

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const [items, setItems] = useState<any>(null);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const OrdersResponse = await fetchData(`/orders${getQueryString({ page: 1, limit: 1000 })}`, token);
                // console.log('OrdersResponse', OrdersResponse.data.data);
                const ProductsResponse = await fetchData(`/product-listing${getQueryString({ page: 1, limit: 1000 })}`, token);
                // console.log('ProductsResponse', ProductsResponse.data.data);

                const Orders = OrdersResponse?.data?.data?.filter((ord: any) => selectedItems?.some((item: any) => item == ord.orderId));
                console.log('Orders', Orders);
                const Products = ProductsResponse?.data?.data.filter((prd: any) => Orders?.some((ord: any) => ord.orderShops?.[0]?.orderDetails?.[0]?.product?.id == prd.id));
                // console.log('Products', Products);

                setProduct(Products);
                setItems(Orders);
            } catch (error) {
                console.error("❌ Error fetching product:", error);
                message.error("Không thể tải sản phẩm!");
            }
        };
        fetchProduct();
    }, []);

    useEffect(() => {
        if (addresses && addresses.length > 0) {
            const defaultAddr = addresses.find((a: any) => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.addressId);
        }
    }, [addresses]);

    const handleConfirmPayment = () => {
        if (!selectedAddressId) return message.warning("Vui lòng chọn địa chỉ giao hàng!");
        if (!product) return message.error("Không tìm thấy sản phẩm!");

        const userData = localStorage.getItem("user");
        const user = userData ? JSON.parse(userData) : null;
        if (!user?.sub) return message.error("Bạn cần đăng nhập để đặt hàng!");

        const selectedAddress = addresses.find((a: any) => a.addressId === selectedAddressId);
        if (!selectedAddress) return message.error("Địa chỉ giao hàng không hợp lệ!");

        console.log('navigate to /payment-cart');
        navigate("/payment-cart", {
            state: items
        });
    };

    const groupOrdersBySeller = (order: any): any => {
        if (!order) return;
        const sellerMap = new Map<string, any>();
        for (const ord of order) {
            if (!sellerMap.has(ord.orderShops?.[0]?.seller?.userId)) {
                sellerMap.set(ord.orderShops?.[0]?.seller?.userId, {
                    userId: ord.orderShops?.[0]?.seller?.userId,
                    fullName: ord.orderShops?.[0]?.seller?.fullName,
                    shippingFee: Number(ord.totalShippingFee),
                    orders: [ord],
                });
            } else { sellerMap.get(ord.orderShops?.[0]?.seller?.userId)!.orders.push(ord) }
        }
        return Array.from(sellerMap.values());
    };
    const sellers = groupOrdersBySeller(items);
    console.log("sellers", sellers);

    // Tính tổng
    const PriceBuyNow = items?.reduce((sum: any, i: any) => sum + Number(i.orderShops?.[0]?.orderDetails?.[0]?.price || 0) * Number(i.orderShops?.[0]?.orderDetails?.[0]?.quantity), 0);
    const totalShippingFee = sellers?.reduce((sum: any, i: any) => sum + Number(i.shippingFee || 0), 0);
    // const uniqueSellerCount = new Set(order?.map((i: any) => i.orderShops?.[0]?.seller?.userId))?.size;
    const total = PriceBuyNow + totalShippingFee;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                <span className="text-[#0F74C7]">1.</span> Delivery Address
                            </h2>
                            <button
                                onClick={() => { setEditingAddress(null); setShowModal(true); }}
                                className="bg-[#0F74C7] hover:bg-[#3888ca] text-white px-4 py-2 rounded-md shadow-sm transition cursor-pointer"
                            >
                                + Add New
                            </button>
                        </div>

                        <div className="border-t pt-4">
                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <AddressList
                                    mode="checkout"
                                    addresses={addresses}
                                    isLoading={isLoading}
                                    onEdit={(addr) => {
                                        setEditingAddress(addr);
                                        setShowModal(true);
                                    }}
                                    onSelect={(id) => setSelectedAddressId(id)}
                                    selectedAddressId={selectedAddressId}
                                    onDelete={() => { }}
                                    onSetDefault={() => { }}
                                />

                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            <span className="text-[#0F74C7]">2.</span> Order Items
                        </h2>
                        {items?.map((item: any, index: number) => (
                            // <div
                            //     key={item.orderId}
                            //     className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 gap-4"
                            // >
                            //     <div className="flex items-center gap-4">
                            //         <img
                            //             src={item.orderShops?.[0]?.orderDetails?.[0]?.product?.imageUrls?.[0] || null}
                            //             alt={item.orderShops?.[0]?.orderDetails?.[0]?.product?.title}
                            //             className="w-20 h-20 object-cover rounded-md"
                            //         />
                            //         <div>
                            //             <h3 className="font-semibold">{item.orderShops?.[0]?.orderDetails?.[0]?.product?.title}</h3>
                            //             <p className="text-sm text-gray-500">{item.orderShops?.[0]?.orderDetails?.[0]?.product?.description}</p>
                            //             <p className="mt-1 font-semibold">{Number(item.orderShops?.[0]?.orderDetails?.[0]?.price).toLocaleString()} VND</p>
                            //         </div>
                            //     </div>

                            //     <div className="flex items-center gap-4">
                            //         <div className="flex items-center justify-center gap-2">
                            //             <input
                            //                 type="text"
                            //                 inputMode="numeric"
                            //                 pattern="[0-9]*"
                            //                 value={item.orderShops?.[0]?.orderDetails?.[0]?.quantity}
                            //                 className="w-12 h-9 text-center border border-gray-300 rounded-md focus:outline-none text-base font-medium leading-none flex items-center justify-center"
                            //                 disabled
                            //             />
                            //         </div>
                            //     </div>
                            // </div>
                            <div
                                key={item.orderId}
                                className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-ocean-200/50 p-5 hover:shadow-xl transition-all duration-300 animate-fadeIn"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Checkbox & Image */}
                                    <div className="flex items-center gap-4 flex-1 w-full sm:w-auto cursor-pointer">
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-ocean-100 to-energy-100 flex-shrink-0">
                                            {item.orderShops?.[0]?.orderDetails?.[0]?.product?.imageUrls?.[0] ? (
                                                <img
                                                    src={item.orderShops[0].orderDetails[0].product.imageUrls[0]}
                                                    alt={item.orderShops[0].orderDetails[0].product.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-ocean-300">
                                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-dark-900 line-clamp-2 group-hover:text-ocean-600 transition-colors">
                                                {item.orderShops?.[0]?.orderDetails?.[0]?.product?.title || 'Product'}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-1 font-medium">
                                                {item.orderShops?.[0]?.orderDetails?.[0]?.product?.description || 'No description'}
                                            </p>
                                            <h4 className="text-dark-900 line-clamp-2">
                                                Seller: {item.orderShops?.[0]?.seller?.fullName || 'Unknown'}
                                            </h4>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-bold bg-gradient-to-r from-ocean-600 to-energy-600 bg-clip-text text-transparent">
                                                    {Number(item.orderShops?.[0]?.orderDetails?.[0]?.price || 0).toLocaleString()} VND
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 sm:ml-auto">
                                        {/* Quantity Display */}
                                        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-ocean-50 to-energy-50 rounded-lg border border-ocean-200">
                                            <span className="text-sm font-semibold text-dark-900">
                                                {item.orderShops?.[0]?.orderDetails?.[0]?.quantity || 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-8 space-y-6 sticky top-6 self-start">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        <span className="text-[#0F74C7]">3.</span> Sumary
                    </h2>
                    <div className="border-t space-y-2 text-gray-700">
                        <div>
                            <span className="font-semibold">Price</span>
                            {items?.map((item: any, i: any) => (
                                <div key={i} className="flex justify-between gap-4 mb-2">
                                    <div className="flex-1 text-wrap md:text-balance">{item.orderShops?.[0]?.orderDetails?.[0]?.product?.title}</div>
                                    <div>{Number(item.orderShops?.[0]?.orderDetails?.[0]?.price).toLocaleString()} VND</div>
                                </div>
                            ))}
                        </div>
                        <p className="flex justify-between">
                            <span className="font-semibold">Shipping Fee</span>
                            <span>{Number(totalShippingFee).toLocaleString()} VND</span>
                        </p>
                        <p className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span className="text-[#0F74C7]">
                                {Number(total).toLocaleString()} VND
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={handleConfirmPayment}
                        className={`w-full py-3 rounded-lg text-white font-medium text-lg transition bg-[#0F74C7] hover:bg-[#3888ca] cursor-pointer`}
                    >
                        Xác nhận thanh toán
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 rounded-lg border text-gray-700 hover:border-[#0F74C7] transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowLeftOutlined /> Quay lại
                    </button>
                </div>
            </div>

            {/* Modal địa chỉ */}
            {showModal && (
                <AddressFormModal
                    address={editingAddress}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => setShowModal(false)}
                    handleCreateAddress={handleCreateAddress}
                    handleUpdateAddress={handleUpdateAddress}
                />
            )}

        </div>
    );
}
