import "./Notes.css";
import React, { useState } from "react";
import Main from "./Main";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import SideNavBar from "./SideNavBar";
import axios from "axios";
import { url_add_notes, url_update_notes, url_get_notes, url_get_notes_last, url_delete_notes } from "./Url";

function Notes({ handleLogout }) {
  const [notes, setNotes] = useState([]);
  const [show, setShow] = useState(true);
  const [activeNote, setActiveNote] = useState(null); // this is the id of the active note

  const getNotes = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(url_get_notes, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  };

  const showNotes = async () => {
    const data = getNotes();
    data.then((response) => {
      const responses = response;

      for (var i = 0; i < responses.length; i++) {
        const times = parseInt(responses[i].time);
        const newNote = {
          id: responses[i].notes_id,
          title: responses[i].title,
          body: responses[i].body,
          lastModified: times,
        };

        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
    });
  };

  const onAddNote = async () => {
    const token = localStorage.getItem("token");
    const dates = "" + Date.now();

    const response = await axios.post(
      url_add_notes,
      { title: "Untitled Note", body: "", time: dates },
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responses = await axios.get(url_get_notes_last, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const todate = parseInt(responses.data.time);

    const newNote = {
      id: responses.data.notes_id,
      title: responses.data.title,
      body: responses.data.body,
      lastModified: todate,
    };

    setNotes([newNote, ...notes]); // transferring every new note into our notes
  };

  const onUpdateNote = (updatedNote) => {
    if (updatedNote) {
      const token = localStorage.getItem("token");
      const times = "" + updatedNote.lastModified;

      if (
        updatedNote.title == undefined ||
        updatedNote.body == undefined ||
        updatedNote.id == undefined
      ) {
        return;
      }

      const response = axios.put(
        url_update_notes,
        {
          title: updatedNote.title,
          body: updatedNote.body,
          time: times,
          notes_id: updatedNote.id,
        },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedNotesArray = notes.map((note) => {
        if (note.id === parseInt(activeNote)) {
          return updatedNote;
        }

        return note;
      });

      setNotes(updatedNotesArray);
    }
  };

  const onDeleteNote = async (idToDelete) => {
    console.log(idToDelete);
    const token = localStorage.getItem("token");
    const response = await fetch(url_delete_notes, {
      method: "DELETE",
      body: JSON.stringify({ notes_id: idToDelete }),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setNotes(notes.filter((note) => note.id !== idToDelete));
  };

  const getActiveNote = () => {
    if (show) {
      showNotes();
      setShow(false);
    }

    const arr = [];
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === parseInt(activeNote)) {
        arr.push(true);
        arr.push(notes[i].title);
        arr.push(notes[i].body);
        arr.push(notes[i].id);
      }
    }

    return arr;
  }; // find the note to send it to the Main component

  return (
    <div className="notes-container">
      <div className="navBarS">
        <SideNavBar />
      </div>
      <div className="main-content">
        <NavBar
          welcomeText={"Welcome to your own notepad!"}
          handleLogout={handleLogout}
        />
        <div className="main-container">
          <Sidebar
            notes={notes}
            onAddNote={onAddNote}
            onDeleteNote={onDeleteNote}
            activeNote={activeNote}
            setActiveNote={setActiveNote}
          />
          <Main activeNote={getActiveNote()} onUpdateNote={onUpdateNote} />
        </div>
      </div>
    </div>
  );
}

export default Notes;
