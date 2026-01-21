import { useUser } from "./UserContext";
import { Link } from "react-router-dom";
import logo from "../assets/img/Logo.png";
import { HomeIcon, BellIcon } from '@heroicons/react/24/outline';

export const Header = () => {
    const { profileImg } = useUser()

    const { username } = JSON.parse(localStorage.getItem("user_data"))


    return (
        <header className="top-header">
            <div className="header-logo-section">
                <img src={logo} alt="Logo" style={{ width: "40px" }} />
                <span className="brand-title">The Reading Room</span>
            </div>

            <div className="header-right-side">

                <Link to="/home" className="header-icon-link">
                    <HomeIcon className="header-icon-svg" />
                </Link>

                <button className="header-icon-btn">
                    <BellIcon className="header-icon-svg" />
                </button>

                <div className="user-profile-section">
                    <span className="user-name">{username || "User"}</span>
                    <div className="profile-circle">
                        {/* Muestra la foto de perfil de Cloudinary */}
                        <img
                            src={profileImg}
                            alt="profile"
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid #fff"
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};