import { message } from "antd";
import { createOrder } from "../../../api/order/api";

const AddToCart = async (product: any, selectedAddressId: any, addresses: any): Promise<boolean> => {
    if (!selectedAddressId) {
        console.log("Vui lòng chọn địa chỉ giao hàng!");
        return false;
    }
    if (!product) {
        console.log("Không tìm thấy sản phẩm!");
        return false;
    }

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    if (!user?.sub) {
        console.log("Bạn cần đăng nhập để đặt hàng!");
        return false;
    }

    const selectedAddress = addresses.find((a: any) => a.addressId === selectedAddressId);
    if (!selectedAddress) {
        console.log("Địa chỉ giao hàng không hợp lệ!");
        return false;
    }

    try {
        const payload = {
            receiverName: selectedAddress.fullName,
            receiverPhone: selectedAddress.phone,
            receiverAddress: selectedAddress.line1 || "",
            receiverDistrictId: selectedAddress.districtId || 0,
            receiverWardCode: selectedAddress.wardCode || "",
            receiverAddressId: selectedAddress.addressId, // ✅ chỉ truyền ID
            orderShops: [
                {
                    sellerId: product.seller.userId,
                    shippingProvider: "GHTK",
                    fromAddressId: product.seller.defaultAddress.addressId,
                    orderDetails: [
                        {
                            productId: product.id,
                            quantity: 1,
                            price: Number(product.price_buy_now),
                            subtotal: Number(product.price_buy_now),
                        },
                    ],
                },
            ],
        };

        console.log("📦 Creating order with FINAL payload:", payload);
        console.log("🧩 user.sub:", user?.sub);

        const order = await createOrder(user.sub, payload);

        console.log("📦 Order response object:", order);

        message.success("✅ Đơn hàng đã được tạo thành công!");
        return true;
    } catch (err: any) {
        console.error("❌ Error creating order:", err);

        if (err.response?.data) {
            console.log("🚨 Server response:", err.response.data);
            console.log("🧩 Error message:", err.response.data?.message?.message);
        }

        message.error("Không thể tạo đơn hàng, vui lòng thử lại!");
        return false;
    }
};

export default AddToCart;
