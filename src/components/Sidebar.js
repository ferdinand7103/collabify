import React, { useRef, useEffect, useState } from "react";

const Sidebar = ({
  notes,
  onAddNote,
  onDeleteNote,
  activeNote,
  setActiveNote,
}) => {
  const sidebarRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  useEffect(() => {
    const sidebarRefCurrent = sidebarRef.current;

    const handleClick = (event) => {
      const clickedNote = event.target.closest(".sidebar-note");
      if (clickedNote) {
        const noteId = clickedNote.dataset.noteId;
        setActiveNote(noteId);
      } else {
        setActiveNote(null);
      }
    };

    const handlePopstate = () => {
      setActiveNote(null);
    };

    sidebarRefCurrent.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopstate);

    return () => {
      sidebarRefCurrent?.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [setActiveNote]);

  useEffect(() => {
    console.log("Active note changed:", activeNote);
  }, [activeNote]);

  useEffect(() => {
    const filteredNotes = notes.filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotes(filteredNotes);
  }, [notes, searchQuery]);

  const sortedNotes = filteredNotes.sort(
    (a, b) => b.lastModified - a.lastModified
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const highlightMatchingLetters = (title, query) => {
    if (!query || query.trim() === "") {
      return title;
    }

    const highlightedTitle = [];
    let i = 0;
    let j = 0;

    while (i < title.length && j < query.length) {
      if (title[i].toLowerCase() === query[j].toLowerCase()) {
        highlightedTitle.push(
          <span key={i} className="highlighted-letter">
            {title[i]}
          </span>
        );
        j++;
      } else {
        highlightedTitle.push(title[i]);
      }
      i++;
    }

    for (let k = i; k < title.length; k++) {
      highlightedTitle.push(title[k]);
    }

    return highlightedTitle;
  };

  const handleDeleteNote = (noteId) => {
    setActiveNote(null); // Reset active note immediately

    setTimeout(() => {
      onDeleteNote(noteId); // Perform deletion logic after a short delay
    }, 300);
  };

  return (
    <div className="sidebar" ref={sidebarRef}>
      <div className="sidebar-header">
        <h1>Notes</h1>
        <button onClick={onAddNote}>Add</button>
      </div>
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="sidebar-notes">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            className={`sidebar-note ${
              note.id === parseInt(activeNote) ? "active" : ""
            }`}
            data-note-id={note.id}
          >
            <div className="sidebar-note-title">
              <strong>
                {highlightMatchingLetters(note.title, searchQuery)}
              </strong>
              <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
            </div>
            <p>{note.body && note.body.substring(0, 100) + "..."}</p>
            <small className="note-meta">
              Last modified{" "}
              {new Date(note.lastModified).toLocaleDateString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
