import "./ProfileSecurity.css";

export default function ProfileSecurity() {
    console.log("ProfileSecurity console");

    return (
        <div className="profilesecurity-container profile-content">
            <div className="title">KYC Verification Status</div>
            <div className="subtitle">
                Ensure a secure trading environment by completing verification.
            </div>

            <div className="progress">
                <div className="bar" style={{ width: "66%" }}></div>
            </div>
            <p className="progress-text">*fake* 66% Complete</p>

            <ul className="steps">
                <li className="step completed">
                    <span className="icon"><i className="fa-solid fa-check"></i></span>
                    <span className="label">Identity Verification</span>
                    <span className="status">Completed</span>
                </li>
                <li className="step pending">
                    <span className="icon">○</span>
                    <span className="label">Address Proof</span>
                    <span className="status">Pending</span>
                </li>
                <li className="step required">
                    <span className="icon">○</span>
                    <span className="label">Bank Account Linking</span>
                    <span className="status badge">Required</span>
                </li>
            </ul>

            <div className="actions">
                <button type="button" className="btn">Complete Verification</button>
            </div>
        </div>
    )
}
