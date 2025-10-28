import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import About from "../pages/About/About";
import Auction from "../pages/Auction/Auction";
import AuthPage from "../pages/Auth/auth";
import Cart from "../pages/Cart/Cart";
import Home from "../pages/Home/Home";
import ProductDetail from "../pages/Product/ProductDetail";
import ProductDetailShop from "../pages/Shop/product/ProductDetailShop";
import Profile from "../pages/Profile/Profile";
import ProfileDetail from "../pages/Profile/ProfileDetail/ProfileDetail";
import ProfileSecurity from "../pages/Profile/ProfileSecurity/ProfileSecurity";
import ProfileWallet from "../pages/Profile/ProfileWallet/ProfileWallet";
import AuthRoute from "./AuthRoute";
import KnowYourCus from "../pages/KYC/KnowYourCus";
import Shop from "../pages/Shop/Shop";
import ProductManager from "../pages/Shop/component/ProductManager";
import TransactionHistory from "../pages/Shop/component/TransactionHistory";
import AuctionManager from "../pages/Shop/component/AuctionManager";


import VerifyOTPPage from "../pages/Verify-Otp";
import PaymentSuccess from "../pages/Payment/success";
import PaymentError from "../pages/Payment/error";
import AddressManagement from "../pages/Manage-Address";

import NavigationBar from "../pages/Admin/NavigationBar/NavigationBar";
import UserManagement from "../pages/Admin/UserManagement/UserManagement";
import KycManagement from "../pages/Admin/KycManagement/KycManagement";
import TransactionManagement from "../pages/Admin/TransactionManagement/TransactionManagement";
import RevenueManagement from "../pages/Admin/RevenueManagement/RevenueManagement";
import Checkout from "../pages/Checkout/Checkout";
import Header from "../layouts/Header/Header";
import Payment from "../pages/Payment/Payment";
import AuctionRequestManagement from "../pages/Admin/AuctionRequestManagement";
import AuctionLiveManagement from "../pages/Admin/AuctionLiveManagement";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <div className="sticky top-0 left-0 z-20">
        <Header />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-error" element={<PaymentError />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />


        <Route element={<AuthRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        <Route path="/profile" element={<Profile />}>
          <Route index element={<Navigate to="detail" replace />} />
          <Route path="detail" element={<ProfileDetail />} />
          <Route path="security" element={<ProfileSecurity />} />
          <Route path='kyc' element={<KnowYourCus />} />
          <Route path="address" element={<AddressManagement />} />
          <Route path="wallet" element={<ProfileWallet />} />
        </Route>
        <Route path="/shop" element={<Shop />}>
          <Route index element={<Navigate to="products" />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="history" element={<TransactionHistory />} />
          <Route path="auction" element={<AuctionManager />} />
          <Route path="productdetail/:id" element={<ProductDetailShop />} />
        </Route>
        <Route path="/productdetail/:id" element={<ProductDetail />} />
        <Route path="/auction/:id" element={<Auction />} />

        <Route path="/admin" element={<Navigate to="/admin/user-management" replace />} />
        <Route path="/admin" element={<NavigationBar />} >
          <Route path="user-management" element={<UserManagement />} />
          <Route path="auction-management" element={<AuctionRequestManagement />} />
          <Route path="auction-live-management" element={<AuctionLiveManagement />} />
          <Route path="kyc-management" element={<KycManagement />} />
          <Route path="transaction-management" element={<TransactionManagement />} />
          <Route path="revenue-management" element={<RevenueManagement />} />
        </Route>
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}
