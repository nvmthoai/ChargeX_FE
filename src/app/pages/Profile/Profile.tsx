import { Outlet } from "react-router-dom";
import "./Profile.css";
import ProfileSideBar from "./ProfileSideBar.tsx";

export default function Profile() {
    console.log("Profile console");

    return (
        <div className="profile-container container">
            <div className="profile-wrapper">
                <ProfileSideBar />
                <Outlet />
            </div>
        </div>
    )
}
