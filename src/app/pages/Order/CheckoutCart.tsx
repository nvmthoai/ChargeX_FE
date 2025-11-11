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
    const DEFAULT_SHIPPING_FEE = 22000;

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

    const PriceBuyNow = items?.reduce((sum: any, i: any) => sum + (i.orderShops?.[0]?.orderDetails?.[0]?.price || 0) * i.orderShops?.[0]?.orderDetails?.[0]?.quantity, 0);
    const uniqueSellerCount = new Set(items?.map((i: any) => i.orderShops?.[0]?.seller?.userId))?.size;

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">

                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            <span className="text-[#0F74C7]">1.</span> Delivery Address
                        </h2>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-[#0F74C7] hover:bg-[#3888ca] text-white px-4 py-2 rounded-md shadow-sm transition"
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
                    {items?.map((item: any) => (
                        <div
                            key={item.orderId}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={item.orderShops?.[0]?.orderDetails?.[0]?.product?.imageUrls?.[0] || null}
                                    alt={item.orderShops?.[0]?.orderDetails?.[0]?.product?.title}
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                                <div>
                                    <h3 className="font-semibold">{item.orderShops?.[0]?.orderDetails?.[0]?.product?.title}</h3>
                                    <p className="text-sm text-gray-500">{item.orderShops?.[0]?.orderDetails?.[0]?.product?.description}</p>
                                    <p className="mt-1 font-semibold">${item.orderShops?.[0]?.orderDetails?.[0]?.price}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={item.orderShops?.[0]?.orderDetails?.[0]?.quantity}
                                        className="w-12 h-9 text-center border border-gray-300 rounded-md focus:outline-none text-base font-medium leading-none flex items-center justify-center"
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="ml-auto bg-white rounded-xl shadow-md p-8 space-y-6"
                    style={{
                        width: 'fit-content',
                        minWidth: '500px',
                    }}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        <span className="text-[#0F74C7]">3.</span> Sumary
                    </h2>
                    <div className="border-t space-y-2 text-gray-700">
                        <div>
                            <span className="font-semibold">Price</span>
                            {items?.map((item: any, i: any) => (
                                <p key={i} className="flex justify-between gap-8">
                                    <span>{item.orderShops?.[0]?.orderDetails?.[0]?.product?.title}</span>
                                    <span>${item.orderShops?.[0]?.orderDetails?.[0]?.price}</span>
                                </p>
                            ))}
                        </div>
                        <p className="flex justify-between">
                            <span className="font-semibold">Shipping Fee</span>
                            <span>${Number(DEFAULT_SHIPPING_FEE)} × {uniqueSellerCount} (Shop) = ${Number(DEFAULT_SHIPPING_FEE) * uniqueSellerCount}</span>
                        </p>
                        <p className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span className="text-[#0F74C7]">
                                ${Number(DEFAULT_SHIPPING_FEE) * uniqueSellerCount + Number(PriceBuyNow)}
                            </span>
                        </p>
                    </div>

                    <div className="flex mt-4 gap-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-3 rounded-lg border text-gray-700 hover:border-[#0F74C7] transition flex items-center justify-center gap-2"
                        >
                            <ArrowLeftOutlined /> Quay lại
                        </button>
                        <button
                            onClick={handleConfirmPayment}
                            className={`w-full py-3 rounded-lg text-white font-medium text-lg transition bg-[#0F74C7] hover:bg-[#3888ca]`}
                        >
                            Xác nhận thanh toán
                        </button>
                    </div>
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
