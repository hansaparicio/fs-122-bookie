import React from "react";
import { NavLink } from "react-router-dom";
import { HomeIcon, CalendarIcon, UsersIcon, UserCircleIcon, IdentificationIcon } from '@heroicons/react/24/outline';

export const Navbar = () => {
	return (
		<nav className="app-sidebar">
			<ul className="sidebar-menu">
				<li className="sidebar-item">

					<NavLink to="/home" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<HomeIcon className="nav-icon-hero" />
						<span>Home</span>
					</NavLink>
				</li>
				<li className="sidebar-item">
					<NavLink to="/events" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<CalendarIcon className="nav-icon-hero" />
						<span>Events</span>
					</NavLink>
				</li>
				<li className="sidebar-item">
					<NavLink to="/chat" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<UsersIcon className="nav-icon-hero" />
						<span>Chat</span>
					</NavLink>
				</li>
				<li className="sidebar-item">
					<NavLink to="/profile" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<UserCircleIcon className="nav-icon-hero" />
						<span>Profile</span>
					</NavLink>
				</li>
				<li className="sidebar-item">
					<NavLink to="/aboutus" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
						<IdentificationIcon className="nav-icon-hero" />
						<span>Aboutus</span>
					</NavLink>
				</li>
			</ul>
		</nav>
	);
};