import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "../layouts/Header/Header";
import About from "../pages/About/About";
import Auction from "../pages/Auction/Auction";
import AuthPage from "../pages/Auth/auth";
import Cart from "../pages/Cart/Cart";
import Home from "../pages/Home/Home";
import ProductDetail from "../pages/Product/ProductDetail";
import Profile from "../pages/Profile/Profile";
import ProfileDetail from "../pages/Profile/ProfileDetail/ProfileDetail";
import ProfileSecurity from "../pages/Profile/ProfileSecurity/ProfileSecurity";

export default function MainRoutes() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<Profile />}>
                    <Route index element={<Navigate to="detail" replace />} />
                    <Route path="detail" element={<ProfileDetail />} />
                    <Route path="security" element={<ProfileSecurity />} />
                </Route>
                <Route path="/productdetail" element={<ProductDetail />} />
                <Route path="/auction/:id" element={<Auction />} />
                <Route path="/cart" element={<Cart />} />
            </Routes>
        </BrowserRouter>
    )
}
