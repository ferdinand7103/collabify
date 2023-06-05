import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaEdit, FaStickyNote, FaProjectDiagram } from "react-icons/fa";
import "./SideNavBar.css";
import { AiFillRobot } from "react-icons/ai";

const SideNavBar = () => {
  const location = useLocation();

  const isActivePage = (pathname) => {
    return location.pathname === pathname;
  };

  return (
    <nav className="sideNavBar">
      <ul className="nav-menu-items">
        <li className={`nav-item ${isActivePage("/collabify") ? "active" : ""}`}>
          <Link to={"/collabify/dashboard"} className="nav-link">
            <FaHome className="icon" />
            <span className="nav-text">Dashboard</span>
          </Link>
        </li>
        <li className={`nav-item ${isActivePage("/collabify/todo") ? "active" : ""}`}>
          <Link to={"/collabify/todo"} className="nav-link">
            <FaEdit className="icon" />
            <span className="nav-text">TodoList</span>
          </Link>
        </li>
        <li className={`nav-item ${isActivePage("/collabify/notes") ? "active" : ""}`}>
          <Link to={"/collabify/notes"} className="nav-link">
            <FaStickyNote className="icon" />
            <span className="nav-text">Notepad</span>
          </Link>
        </li>
        <li className={`nav-item ${isActivePage("/collabify/chat") ? "active" : ""}`}>
          <Link to={"/"} className="nav-link">
            <AiFillRobot className="icon" />
            <span className="nav-text">Chat With Ai</span>
          </Link>
        </li>
        <li className={`nav-item ${isActivePage("/collabify/mindmap") ? "active" : ""}`}>
          <Link to={"/collabify/mindmap"} className="nav-link">
            <FaProjectDiagram className="icon" />
            <span className="nav-text">Mind mapping</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default SideNavBar;
