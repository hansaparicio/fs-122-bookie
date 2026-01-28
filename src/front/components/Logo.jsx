import React from "react";
import LogoImage from "src/front/assets/img/Aboutus_img/logo_bookie.png";

export const Logo = ({ width = "100px" }) => {
    return (
        <div className="logo-container text-center mb-4">
            <img
                src={LogoImage}
                alt="Bookie Logo"
                style={{ width: width, height: "auto" }}
            />
        </div>
    );
};

export default Logo;
