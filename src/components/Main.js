import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const Main = ({ activeNote, onUpdateNote }) => {
  const [updatedNote, setUpdatedNote] = useState({
    title: activeNote ? activeNote[0] : "", // Default to an empty string if activeNote is undefined
    body: activeNote ? activeNote[1] : "", // Default to an empty string if activeNote is undefined
    id: activeNote[2],
    lastModified: Date.now(),
  });

  const onEditField = (key, value) => {
    setUpdatedNote({
      ...updatedNote,
      title: key,
      body: value,
      lastModified: Date.now(),
    });
  };

  useEffect(() => {
    console.log(activeNote);
    const timeout = setTimeout(() => {
      onUpdateNote(updatedNote);
      console.log(updatedNote);
    }, 500000000000); // Adjust the debounce delay as needed (e.g., 500ms)

    return () => clearTimeout(timeout);
  }, [updatedNote, onUpdateNote]);

  if (!activeNote)
    return <div className="no-active-note">No note selected yet</div>;
  return (
    <div className="main">
      <div className="main-note-edit">
        <input
          type="text"
          id="title"
          value={updatedNote.title}
          placeholder="Title"
          onChange={(e) => onEditField(e.target.value, "")}
          autoFocus
        />
        <textarea
          id="body"
          placeholder="Write your note here..."
          value={updatedNote.body}
          onChange={(e) => onEditField("", e.target.value)}
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
