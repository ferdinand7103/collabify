import React, { useState, useEffect } from "react";
import { act } from "react-dom/test-utils";
import ReactMarkdown from "react-markdown";

const Main = ({ activeNote, onUpdateNote }) => {
  const [updatedNote, setUpdatedNote] = useState("");
  const [show, setShow] = useState(true);

  const setNote = () => {
    setUpdatedNote({
      title: activeNote[1],
      body: activeNote[2],
      id: activeNote[3],
      lastModified: Date.now()
    })
  }

  const onEditField = (key, value) => {
    if (key === "title") {
      setUpdatedNote({
        ...updatedNote,
        title: value,
        lastModified: Date.now(),
      });
    } else if (key === "body") {
      setUpdatedNote({
        ...updatedNote,
        body: value,
        lastModified: Date.now(),
      });
    }
  };

  useEffect(() => {
    if (activeNote[0]){
      if(show){
        setNote();
        setShow(false);
      }
    } else {
      setShow(true);
    }

    const timeout = setTimeout(() => {
      onUpdateNote(updatedNote);
    }, 500); // Adjust the debounce delay as needed (e.g., 500ms)

    return () => clearTimeout(timeout);
  }, [updatedNote, onUpdateNote]);

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
          placeholder="Write your note here..."
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
