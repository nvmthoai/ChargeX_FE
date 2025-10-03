import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "../layouts/Header/Header";
import About from "../pages/About/About";
import Home from "../pages/Home/Home";
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
                <Route path="profile" element={<Profile />}>
                    <Route path="detail" element={<ProfileDetail />} />
                    <Route path="security" element={<ProfileSecurity />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
