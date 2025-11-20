import { Outlet } from "react-router-dom";
import ProfileSideBar from "./ProfileSideBar.tsx";

export default function Profile() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-energy-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-ocean-500 to-energy-500 bg-clip-text text-transparent mb-2">
                        Hồ sơ của tôi
                    </h1>
                    <p className="text-dark-600 text-lg font-medium">Quản lý cài đặt và tùy chọn tài khoản của bạn</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <ProfileSideBar />
                    </div>
                    <div className="lg:col-span-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-ocean-100/50 p-6 sm:p-8">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
