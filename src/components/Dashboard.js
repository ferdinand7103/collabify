import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faStickyNote,
  faProjectDiagram,
} from "@fortawesome/free-solid-svg-icons";
import { AiFillRobot } from "react-icons/ai";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import NavBar from "./NavBar";

const Dashboard = ({ handleLogout }) => {
  return (
    <div className="dashboard">
      <NavBar welcomeText={"Welcome back!"} handleLogout={handleLogout} />
      <div className="title">
        <h1>Your Dashboard</h1>
      </div>
      <div className="dashboard-buttons">
        <Link
          to="/collabify/todo"
          className="dashboard-button-link dashboard-button"
        >
          <FontAwesomeIcon icon={faEdit} className="dashboard-icon" />
          <span className="dashboard-button-text">Todo</span>
        </Link>
        <Link
          to="/collabify/notes"
          className="dashboard-button-link dashboard-button"
        >
          <FontAwesomeIcon icon={faStickyNote} className="dashboard-icon" />
          <span className="dashboard-button-text">Notes</span>
        </Link>
        <Link
          to="/collabify/chat"
          className="dashboard-button-link dashboard-button"
        >
          <AiFillRobot className="dashboard-icon" />
          <span className="dashboard-button-text">Chat with AI</span>
        </Link>
        <Link
          to="/collabify/mindmap"
          className="dashboard-button-link dashboard-button"
        >
          <FontAwesomeIcon
            icon={faProjectDiagram}
            className="dashboard-icon"
          />
          <span className="dashboard-button-text">Mind Map</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
