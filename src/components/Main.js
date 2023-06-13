import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const Main = ({ activeNote, onUpdateNote }) => {
  const [updatedNote, setUpdatedNote] = useState({
    title: "",
    body: "",
    id: "",
    lastModified: null,
  });
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (activeNote[0]) {
      setUpdatedNote({
        title: activeNote[1],
        body: activeNote[2],
        id: activeNote[3],
        lastModified: Date.now(),
      });
      setShow(false);
    } else {
      setShow(true);
    }
  }, [activeNote]);

  const onEditField = (key, value) => {
    if (key === "title") {
      value = value.substring(0, 60); // Limit title to 100 characters
    }

    setUpdatedNote((prevNote) => ({
      ...prevNote,
      [key]: value,
      lastModified: Date.now(),
    }));
  };

  useEffect(() => {
    if (!show) {
      const timeout = setTimeout(() => {
        onUpdateNote(updatedNote);
      }, 100);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [updatedNote, onUpdateNote, show]);

  if (!activeNote[0])
    return <div className="no-active-note">No note selected yet</div>;
  return (
    <div className="main">
      <div className="main-note-edit">
        <input
          type="text"
          id="title"
          value={updatedNote.title}
          placeholder="Title"
          onChange={(e) => onEditField("title", e.target.value)}
          autoFocus
        />
        <textarea
          id="body"
          placeholder={
            "Write your note here...\n(Use # to make a title, the more of it the smaller  \n**A bold text** \n*An italic text* \n1. An ordered list text \n- An unordered list text \n~~A strikethrough text~~ \nGet to know more at https://www.copycat.dev/blog/react-markdown/)"
          }
          value={updatedNote.body}
          onChange={(e) => onEditField("body", e.target.value)}
        />
      </div>
      <div className="main-note-preview">
        <h1 className="preview-title">{updatedNote.title}</h1>
        <ReactMarkdown className="markdown-preview">
          {updatedNote.body}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Main;
