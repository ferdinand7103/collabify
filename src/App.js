import React, { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import TodoList from "./components/TodoList";
import Notes from "./components/Notes";
import LandingPage from "./components/LPcomponents/LandingPage";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import MindMap from "./components/MindMap";
import ChatBot from "./components/Chat"

const App = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [hasAccount, setHasAccount] = useState(true);

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
      console.log(emailError)
      if (!password) setPasswordError("Please enter your password");
      console.log("hello")
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/token", {
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

        const newUser = {
          email,
          password,
        };

        setUser(newUser);
        navigate("/collabify/dashboard");
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
        "http://localhost:8000/signup/",
        { email, password },
        { headers: { "content-type": "application/json" } }
      );

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      navigate("/collabify/dashboard"); // Navigate to the dashboard route after successful signup
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
    setUser("");
    cleanInputs();
    setHasAccount(true);
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get("http://localhost:8000/logout", config)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    localStorage.removeItem("token");
    setUser(null);
    navigate("/collabify/login", { replace: true });
    console.log("clicked");
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleLogout()
    }, 18000000);
    return () => {
      clearTimeout(timeout);
    };
  }, [handleLogout]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route
          path="/collabify/dashboard"
          element={<Dashboard handleLogout={handleLogout} />}
        />
        <Route
          path="/collabify/login"
          element={
            <Login
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
