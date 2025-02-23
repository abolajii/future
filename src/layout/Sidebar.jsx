import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaSignal,
  FaMoneyBillWave,
  FaCog,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

const routes = [
  {
    id: 1,
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    path: ["/dashboard", "/"],
  },
  { id: 2, label: "Signal", icon: <FaSignal />, path: "/signal" },
  { id: 3, label: "Deposit", icon: <FaMoneyBillWave />, path: "/deposit" },
  { id: 4, label: "Settings", icon: <FaCog />, path: "/settings" },
  { id: 5, label: "Profile", icon: <FaUser />, path: "/profile" },
];

const NavigationContainer = styled.nav`
  @media (min-width: 768px) {
    width: 250px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
  }

  @media (max-width: 767px) {
    width: 100%;
    height: auto;
    position: fixed;
    left: 0;
    bottom: 0;
    padding: 0;
    z-index: 1000;
  }

  background: #222;
  background: #25262b;

  color: white;
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`;

const NavContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  @media (max-width: 767px) {
    flex-direction: row;
    justify-content: space-around;
    padding: 8px 0;
  }
`;

const NavItem = styled.a`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  color: #999;

  @media (min-width: 768px) {
    justify-content: flex-start;

    &.active {
      border-left: 3px solid #ff980020;
    }
  }

  @media (max-width: 767px) {
    padding: 8px;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    text-align: center;

    &.active {
      color: #ff9800;
    }
  }

  &:hover {
    background: #333;
    color: white;
  }

  &:focus {
    outline: none;
    background: #333;
    color: white;
  }

  &.active {
    background: #333;
    color: #ff9800;
  }
`;

const IconWrapper = styled.div`
  font-size: 1.2rem;
  min-width: 24px;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    margin-right: 12px;
  }
`;

const Label = styled.span`
  @media (max-width: 767px) {
    display: none;
  }
`;

const BottomSection = styled.div`
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 767px) {
    display: none;
  }
`;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRouteActive = (routePath) => {
    if (Array.isArray(routePath)) {
      console.log(location.pathname);
      return routePath.includes(location.pathname);
    }
    return location.pathname === routePath;
  };

  const handleNavigation = (path) => {
    // If path is an array, navigate to the first path in the array
    const navigateTo = Array.isArray(path) ? path[0] : path;
    navigate(navigateTo);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <NavigationContainer>
      <NavContent>
        {routes.map((route) => (
          <NavItem
            key={route.id}
            className={isRouteActive(route.path) ? "active" : ""}
            href={Array.isArray(route.path) ? route.path[0] : route.path}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation(route.path);
            }}
            aria-label={route.label}
          >
            <IconWrapper>{route.icon}</IconWrapper>
            <Label>{route.label}</Label>
          </NavItem>
        ))}
      </NavContent>
      <BottomSection>
        <NavItem
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          aria-label="Logout"
          style={{ color: "#ff6b6b" }}
        >
          <IconWrapper>
            <FaSignOutAlt />
          </IconWrapper>
          <Label>Logout</Label>
        </NavItem>
      </BottomSection>
    </NavigationContainer>
  );
};

export default Sidebar;
