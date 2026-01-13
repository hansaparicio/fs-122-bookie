import React from "react";
import { NavLink } from "react-router-dom";

export const Navbar = () => {
	return (
		<nav className="app-sidebar">
			<ul className="sidebar-menu">
				<li className="sidebar-item">
					<NavLink to="/home" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<span className="icon">🏠</span>
						<span>Home</span>
					</NavLink>
				</li>
				<li className="sidebar-item">
					<NavLink to="/events" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<span className="icon">📅</span>
						<span>Events</span>
					</NavLink>
				</li>
				<li className="sidebar-item">
					<NavLink to="/chat" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<span className="icon">💬</span>
						<span>Chat</span>
					</NavLink>
				</li>
				<li className="sidebar-item">
					<NavLink to="/profile" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<span className="icon">👤</span>
						<span>Profile</span>
					</NavLink>
				</li>
				<li className="sidebar-item">
					<NavLink to="/aboutus" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<span className="icon">👫</span>
						<span>Aboutus</span>
					</NavLink>
				</li>
			</ul>
		</nav>
	);
};