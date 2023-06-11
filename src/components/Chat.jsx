import lens from "./lens.png";
import loadingGif from "./loading.gif";
import { useState } from "react";
import { useEffect } from "react";
import "./Chat.css";
import NavBar from "./NavBar";
import SideNavBar from "./SideNavBar";
import { AiOutlineSearch } from "react-icons/ai";

function ChatBot({ handleLogout }) {
  const [prompt, updatePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(undefined);

  useEffect(() => {
    if (prompt.trim() === "") {
      setAnswer(undefined);
    }
  }, [prompt]);

  const sendPrompt = async () => {
    if (prompt.trim() === "") {
      return;
    }

    try {
      setLoading(true);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      };

      const res = await fetch("http://localhost:5000/ask", requestOptions);

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const { message } = await res.json();
      setAnswer(message);
    } catch (err) {
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="navBarS">
        <SideNavBar />
      </div>
      <div className="main-content">
        <NavBar
          welcomeText={"Welcome to your Oxios"}
          handleLogout={handleLogout}
        />
        <div className="main-container">
          <h1>ChatBot Oxios</h1>
          <div className="chatbox">
            {loading ? (
              <p className="chatbox__message">Please standby for the best answer...</p>
            ) : (
              answer && <p className="chatbox__message">{answer}</p>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              className="spotlight__input"
              placeholder="Ask me anything..."
              disabled={loading}
              value={prompt}
              onChange={(e) => updatePrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendPrompt();
                }
              }}
            />
            <div className="input-icon" onClick={sendPrompt}>
              {loading ? (
                <img src={loadingGif} alt="Loading..." />
              ) : (
                <AiOutlineSearch />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
