import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import About from "../pages/About/About";
import Auction from "../pages/Auction/Auction";
import AuthPage from "../pages/Auth/auth";
import Cart from "../pages/Cart/Cart";
import Home from "../pages/Home/Home";
import ProductDetail from "../pages/Product/ProductDetail";
import Profile from "../pages/Profile/Profile";
import ProfileDetail from "../pages/Profile/ProfileDetail/ProfileDetail";
import ProfileSecurity from "../pages/Profile/ProfileSecurity/ProfileSecurity";
import AuthRoute from "./AuthRoute";
import KnowYourCus from "../pages/KYC/KnowYourCus";

import VerifyOTPPage from "../pages/Verify-Otp";
import PaymentSuccess from "../pages/Payment/success";
import PaymentError from "../pages/Payment/error";
import AddressManagement from "../pages/Manage-Address";

import NavigationBar from "../pages/Admin/NavigationBar/NavigationBar";
import UserManagement from "../pages/Admin/UserManagement/UserManagement";
import KycManagement from "../pages/Admin/KycManagement/KycManagement";
import TransactionManagement from "../pages/Admin/TransactionManagement/TransactionManagement";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-error" element={<PaymentError />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route element={<AuthRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>
        <Route path="/profile" element={<Profile />}>
          <Route index element={<Navigate to="detail" replace />} />
          <Route path="detail" element={<ProfileDetail />} />
          <Route path="security" element={<ProfileSecurity />} />
          <Route path='kyc' element={<KnowYourCus />} />
          <Route path="address" element={<AddressManagement />} />
        </Route>
        {/* <Route path="/kyc" element={<KnowYourCus />} /> */}
        <Route path="/productdetail/:id" element={<ProductDetail />} />
        <Route path="/auction/:id" element={<Auction />} />

        <Route path="/admin" element={<Navigate to="/admin/user-management" replace />} />
        <Route path="/admin" element={<NavigationBar />} >
          <Route path="user-management" element={<UserManagement />} />
          <Route path="kyc-management" element={<KycManagement />} />
          <Route path="transaction-management" element={<TransactionManagement />} />
        </Route>
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}
