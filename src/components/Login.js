import React, { useState, useEffect } from "react";
import logo from "./logo.png";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = (props) => {
  const {
    user,
    handleLogout,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleSignUp,
    hasAccount,
    setHasAccount,
    emailError,
    passwordError,
  } = props;

  const navigate = useNavigate();

  const [emailErrorSU, setEmailErrorSU] = useState("");
  const [passwordErrorSU, setPasswordErrorSU] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showError, setShowError] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;

  useEffect(() => {
    if(user){
      handleLogout(); // Log out the user on component render if there is a user
    }
  }, [handleLogout, user]);

  const register = () => {
    if (password === confirmPassword) {
      handleSignUp(email, password);
    } else {
      setConfirmError("Passwords do not match");
    }
  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    if (!hasAccount && !emailRegex.test(inputEmail)) {
      setEmailErrorSU("Please enter a valid email address");
    } else {
      setEmailErrorSU("");
    }
    setShowError(false); // Reset showError state
  };

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    if (!hasAccount && !passwordRegex.test(inputPassword)) {
      setPasswordErrorSU(
        "Password must contain at least 8 characters, including one numeric digit and one uppercase letter"
      );
    } else {
      setPasswordErrorSU("");
    }
    setShowError(false); // Reset showError state
  };

  const handleConfirmPasswordChange = (e) => {
    const inputConfirmPassword = e.target.value;
    setConfirmPassword(inputConfirmPassword);
    if (!hasAccount && inputConfirmPassword !== password) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
    setShowError(false); // Reset showError state
  };

  const handleSignToggle = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEmailErrorSU("");
    setPasswordErrorSU("");
    setConfirmError("");
    setShowError(false); // Reset showError state
    setHasAccount(!hasAccount);
  };

  const handleLoginClick = () => {
    setShowError(true);
    handleLogin(email, password);
  };

  const goBack = () => {
    navigate("/", { replace: true });
    setHasAccount(true);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isSignUpDisabled =
    hasAccount ||
    emailErrorSU ||
    passwordErrorSU ||
    confirmError ||
    !email ||
    !password ||
    !confirmPassword;

  return (
    <section className="login">
      <div className="appName" onClick={goBack}>
        <img src={logo} alt="Logo" />
        <h1>Collabify </h1>
      </div>
      <div className="loginContainer">
        {hasAccount ? (
          <>
            <h1 className="title">Login to Collabify</h1>
            <label>Email</label>
            <input
              type="text"
              autoFocus
              required
              value={email}
              onChange={handleEmailChange}
            />
            {showError && <p className="errorMsg">{emailError}</p>}
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handlePasswordChange}
              />
              <button
                className={`toggle-password-button ${
                  showPassword ? "show" : ""
                }`}
                onClick={handleTogglePassword}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {showError && <p className="errorMsg">{passwordError}</p>}
          </>
        ) : (
          <>
            <h1 className="title">Join us at Collabify</h1>
            <label>Email</label>
            <input
              type="text"
              autoFocus
              required
              value={email}
              onChange={handleEmailChange}
            />
            {!hasAccount && email && (
              <p className="errorMsgSU">{emailErrorSU}</p>
            )}
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handlePasswordChange}
              />
              <button
                className={`toggle-password-button ${
                  showPassword ? "show" : ""
                }`}
                onClick={handleTogglePassword}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {!hasAccount && password && (
              <p className="errorMsgSU">{passwordErrorSU}</p>
            )}
            <label>Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <button
                className={`toggle-password-button ${
                  showConfirmPassword ? "show" : ""
                }`}
                onClick={handleToggleConfirmPassword}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {confirmPassword && <p className="errorMsg">{confirmError}</p>}
          </>
        )}
        <div className="btnContainer">
          {hasAccount ? (
            <>
              <button onClick={handleLoginClick}>Login</button>
              <p>
                Don't have an account?{" "}
                <span onClick={handleSignToggle}>Sign up</span>
              </p>
            </>
          ) : (
            <>
              <button onClick={register} disabled={isSignUpDisabled}>
                Sign up
              </button>
              <p>
                Have an account? <span onClick={handleSignToggle}>Sign in</span>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Login;
