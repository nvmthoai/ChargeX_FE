import "./ProfileDetail.css";

export default function ProfileDetail() {
    console.log("ProfileDetail console");

    return (
        <div className="profiledetail-container profile-content">
            <div className="title">Profile Details</div>
            <div className="subtitle">Manage your personal information.</div>

            <form className="form-grid">
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue="*fake* Jane Doe" />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" defaultValue="*fake* jane.doe@example.com" />
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" defaultValue="*fake* +1 555-123-4567" />
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input type="text" defaultValue="*fake* 123 EV Street, ElectriCity, CA, 90210" />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn">Update Profile</button>
                </div>
            </form>
        </div>
    )
}
