import lens from "./lens.png";
import loadingGif from "./loading.gif";
import { useState } from "react";
import { useEffect } from "react";
import "./Chat.css";
import NavBar from "./NavBar";
import SideNavBar from "./SideNavBar";


function ChatBot({ handleLogout }) {
  const [prompt, updatePrompt] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(undefined);

  useEffect(() => {
    if (prompt != null && prompt.trim() === "") {
      setAnswer(undefined);
    }
  }, [prompt]);

  const sendPrompt = async (event) => {
    if (event.key !== "Enter") {
      return;
    }

    try {
      setLoading(true);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      };

      const res = await fetch("/api/ask", requestOptions);

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
        <h1>Oxios: </h1>
        <input
              type="text"
              className="spotlight__input"
              placeholder="Ask me anything..."
              disabled={loading}
              style={{
                backgroundImage: loading
                  ? `url(${loadingGif})`
                  : `url(${lens})`,
              }}
              onChange={(e) => updatePrompt(e.target.value)}
              onKeyDown={(e) => sendPrompt(e)}
            />
            <div className="spotlight__answer">
              {answer && <p> {answer}</p>}
            </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
