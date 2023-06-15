import React, { useState } from "react";
import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import TodoList from "./components/TodoList";
import Notes from "./components/Notes";
import LandingPage from "./components/LPcomponents/LandingPage";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import MindMap from "./components/MindMap";
import ChatBot from "./components/Chat";
import { url_login, url_logout, url_signup } from "./components/Url";

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [hasAccount, setHasAccount] = useState(true);
  const [timeoutId, setTimeoutId] = useState(false); // Renamed state variable
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const cleanInputs = () => {
    setEmail("");
    setPassword("");
  };

  const cleanErrors = () => {
    setEmailError("");
    setPasswordError("");
  };

  const handleLogin = async (email, password) => {
    cleanErrors();

    if (!email || !password) {
      // Check if any field is empty
      if (!email) setEmailError("Please enter your email");
      console.log(emailError);
      if (!password) setPasswordError("Please enter your password");
      return;
    }

    try {
      const response = await fetch(url_login, {
        method: "POST",
        body: new URLSearchParams({
          username: email,
          password: password,
          grant_type: "password",
          scope: "",
        }),
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        localStorage.setItem("token", responseData.access_token);

        navigate("/collabify/dashboard");
        setUser(true);

        const newTimeoutId = setTimeout(() => {
          handleLogout();
          window.alert("Your session has expired. You have been logged out.");
        }, 10000);
        setTimeoutId(newTimeoutId);
      } else if (response.status === 400) {
        setEmailError("Email not registered or invalid");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error(error.message);
      setPasswordError("Invalid email or password");
    }

    setPassword("");
  };

  const handleSignUp = async (email, password) => {
    cleanErrors();

    try {
      const response = await axios.post(
        url_signup,
        { email, password },
        { headers: { "content-type": "application/json" } }
      );

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      navigate("/collabify/dashboard");
      setUser(true);

      const newTimeoutId = setTimeout(() => {
        handleLogout();
        window.alert("Your session has expired. You have been logged out.");
      }, 10000);
      setTimeoutId(newTimeoutId);
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  const handleLogout = async () => {
    cleanInputs();
    setHasAccount(true);
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get(url_logout, config)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    localStorage.removeItem("token");
    clearTimeout(timeoutId);
    navigate("/collabify/login", { replace: true });
    setUser(false);
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/collabify/dashboard"
          element={<Dashboard handleLogout={handleLogout} />}
        />
        <Route
          path="/collabify/login"
          element={
            <Login
              user={user}
              handleLogout={handleLogout}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              handleSignUp={handleSignUp}
              hasAccount={hasAccount}
              setHasAccount={setHasAccount}
              emailError={emailError}
              passwordError={passwordError}
            />
          }
        />
        <Route
          path="collabify/todo"
          element={<TodoList handleLogout={handleLogout} />}
        />
        <Route
          path="collabify/notes"
          element={<Notes handleLogout={handleLogout} />}
        />
        <Route
          path="collabify/mindmap"
          element={<MindMap handleLogout={handleLogout} />}
        />
        <Route
          path="collabify/chat"
          element={<ChatBot handleLogout={handleLogout} />}
        />
      </Routes>
    </div>
  );
};

export default App;
