import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "../layouts/Header/Header";
import About from "../pages/About/About";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import ProfileDetail from "../pages/Profile/ProfileDetail/ProfileDetail";
import ProfileSecurity from "../pages/Profile/ProfileSecurity/ProfileSecurity";
import AuthPage from '../pages/Auth/auth';
import ProductDetail from '../pages/Product/ProductDetail';
import KnowYourCus from '../pages/KYC/KnowYourCus';


export default function MainRoutes() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path='/auth' element={<AuthPage />} />
                <Route path="profile" element={<Profile />}>
                    <Route path="detail" element={<ProfileDetail />} />
                    <Route path="security" element={<ProfileSecurity />} />
                </Route>
                 <Route path='/productdetail' element={<ProductDetail />} />
                 <Route path='/kyc' element={<KnowYourCus />} />

            </Routes>
        </BrowserRouter>
    )
}
