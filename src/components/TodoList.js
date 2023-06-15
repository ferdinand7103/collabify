import "./TodoList.css";
import React, { useState, useRef, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import _ from "lodash";
import { v4 as uuid } from "uuid";
import NavBar from "./NavBar";
import SideNavBar from "./SideNavBar";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import { url_add_todo, url_update_todo, url_update_todo_id, url_get_todo, url_get_todo_last, url_delete_todo, url_delete_todo_id } from "./Url";

function TodoList({ handleLogout }) {
  const [text, setText] = useState("");
  const [state, setState] = useState({
    new: {
      title: "New",
      items: [],
    },
    progress: {
      title: "In Progress",
      items: [],
    },
    done: {
      title: "Completed",
      items: [],
    },
  });
  const [show, setShow] = useState(true);
  const [editingItems, setEditingItems] = useState({});
  const [lastFocusedInput, setLastFocusedInput] = useState(null);
  const addNameInputRef = useRef(null);
  const addDueDateInputRef = useRef(null);

  const handleDragEnd = ({ destination, source }) => {
    if (!destination) {
      return;
    }

    if (
      destination.index === source.index &&
      destination.droppableId === source.droppableId
    ) {
      return;
    }

    const itemCopy = { ...state[source.droppableId].items[source.index] };
    const token = localStorage.getItem("token");
    if (destination.droppableId === "new") {
      const title = "New";
      const response = axios.put(
        url_update_todo_id,
        { todo_id: itemCopy.id, title: title },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else if (destination.droppableId === "progress") {
      const title = "In Progress";
      const response = axios.put(
        url_update_todo_id,
        { todo_id: itemCopy.id, title: title },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else if (destination.droppableId === "done") {
      const title = "Completed";
      const response = axios.put(
        url_update_todo_id,
        { todo_id: itemCopy.id, title: title },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    setState((prev) => {
      prev = { ...prev };
      prev[source.droppableId].items.splice(source.index, 1);
      prev[destination.droppableId].items.splice(
        destination.index,
        0,
        itemCopy
      );
      return prev;
    });
  };

  const getAllItem = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(url_get_todo, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  };

  const getAllNew = () => {
    const response = getAllItem();
    response.then((response) => {
      const responses = response;

      for (var i = 0; i < responses.length; i++) {
        if (responses[i].title === "New") {
          const todo_id = "" + response[i].todo_id;
          const newItem = {
            id: todo_id,
            name: responses[i].name,
            dueDate: responses[i].duedate,
          };

          setState((prev) => {
            return {
              ...prev,
              new: {
                title: "New",
                items: [newItem, ...prev.new.items],
              },
            };
          });
        }
      }
    });
  };

  const getAllInProgress = () => {
    const response = getAllItem();
    response.then((response) => {
      const responses = response;

      for (var i = 0; i < responses.length; i++) {
        if (responses[i].title === "In Progress") {
          const todo_id = "" + response[i].todo_id;
          const newItem = {
            id: todo_id,
            name: responses[i].name,
            dueDate: responses[i].duedate,
          };

          setState((prev) => {
            return {
              ...prev,
              progress: {
                title: "In Progress",
                items: [newItem, ...prev.progress.items],
              },
            };
          });
        }
      }
    });
  };

  const getAllCompleted = () => {
    const response = getAllItem();
    response.then((response) => {
      const responses = response;

      for (var i = 0; i < responses.length; i++) {
        if (responses[i].title === "Completed") {
          const todo_id = "" + response[i].todo_id;
          const newItem = {
            id: todo_id,
            name: responses[i].name,
            dueDate: responses[i].duedate,
          };

          setState((prev) => {
            return {
              ...prev,
              done: {
                title: "Completed",
                items: [newItem, ...prev.done.items],
              },
            };
          });
        }
      }
    });
  };

  const addItem = async (name, dueDate) => {
    if (!name || !dueDate) {
      return;
    }

    const token = localStorage.getItem("token");

    const response = await axios.post(
      url_add_todo,
      { title: "New", name: name, duedate: dueDate },
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responses = await axios.get(url_get_todo_last, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const id = "" + responses.data.todo_id;

    const newItem = {
      id: id,
      name: responses.data.name,
      dueDate: responses.data.duedate,
    };

    setState((prev) => {
      return {
        ...prev,
        new: {
          title: "New",
          items: [newItem, ...prev.new.items],
        },
      };
    });

    setText("");
    addNameInputRef.current.value = "";
    addDueDateInputRef.current.value = "";
  };

  const removeItem = async (listId, index, id) => {
    if (listId === "new" || listId === "progress" || listId === "done") {
      const token = localStorage.getItem("token");
      const response = await fetch(url_delete_todo_id, {
        method: "DELETE",
        body: JSON.stringify({ todo_id: id }),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setState((prev) => {
        const newState = { ...prev };
        newState[listId].items.splice(index, 1);
        return newState;
      });
    }
  };

  const removeAllTasks = async (listId) => {
    if (listId === "new" || listId === "progress" || listId === "done") {
      const confirmed = window.confirm(
        "Are you sure you want to delete all tasks in this column?"
      );
      if (confirmed) {
        const token = localStorage.getItem("token");

        if (listId === "new") {
          const title = "New";

          const response = await fetch(url_delete_todo, {
            method: "DELETE",
            body: JSON.stringify({ title: title }),
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } else if (listId === "progress") {
          const title = "In Progress";

          const response = await fetch(url_delete_todo, {
            method: "DELETE",
            body: JSON.stringify({ title: title }),
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } else if (listId === "done") {
          const title = "Completed";

          const response = await fetch(url_delete_todo, {
            method: "DELETE",
            body: JSON.stringify({ title: title }),
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        }

        setState((prev) => {
          const newState = { ...prev };
          newState[listId].items = [];
          return newState;
        });
      }
    }
  };

  const isDueDatePassed = (dueDate) => {
    const today = new Date().toISOString().split("T")[0];
    console.log(dueDate < today);
    return dueDate < today;
  };

  const startEditing = async (itemId, initialName, initialDueDate) => {
    if (state.done.items.some((item) => item.id === itemId)) {
      return;
    }

    setEditingItems((prev) => {
      return {
        ...prev,
        [itemId]: {
          initialName: initialName,
          initialDueDate: initialDueDate,
          name: initialName,
          dueDate: initialDueDate,
        },
      };
    });
  };

  const handleNameInputChange = (e, itemId) => {
    const value = e.target.value;
    setEditingItems((prev) => {
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          name: value,
        },
      };
    });
  };

  const handleDueDateInputChange = (e, itemId) => {
    const value = e.target.value;
    setEditingItems((prev) => {
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          dueDate: value,
        },
      };
    });
  };

  const confirmEditing = (itemId) => {
    setState((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        const items = newState[key].items;
        const itemIndex = items.findIndex((item) => item.id === itemId);
        if (itemIndex !== -1) {
          const editedItem = { ...items[itemIndex] };
          const editingItem = editingItems[itemId];
          if (editingItem && (editingItem.name || editingItem.dueDate)) {
            editedItem.name = editingItem.name || editedItem.name;
            editedItem.dueDate = editingItem.dueDate || editedItem.dueDate;
          }
          items[itemIndex] = editedItem;

          const token = localStorage.getItem("token");

          const response = axios.put(
            url_update_todo,
            {
              name: editedItem.name,
              duedate: editedItem.dueDate,
              todo_id: itemId,
            },
            {
              headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      });
      return newState;
    });
    setEditingItems((prev) => {
      const updatedEditingItems = { ...prev };
      delete updatedEditingItems[itemId];
      return updatedEditingItems;
    });
  };

  const cancelEditing = (itemId) => {
    setEditingItems((prev) => {
      const updatedEditingItems = { ...prev };
      delete updatedEditingItems[itemId];
      return updatedEditingItems;
    });
  };

  const handleKeyDown = (e, itemId) => {
    if (e.key === "Enter") {
      confirmEditing(itemId);
    }
  };

  const handleBlur = (e, itemId) => {
    if (lastFocusedInput !== itemId) {
      cancelEditing(itemId);
    }
  };

  const handleInputFocus = (itemId) => {
    setLastFocusedInput(itemId);
  };

  useEffect(() => {
    if (show) {
      getAllNew();
      getAllInProgress();
      getAllCompleted();
      setShow(false);
    }

    const handleClick = (e) => {
      Object.keys(editingItems).forEach((itemId) => {
        if (!e.target.closest(`#item-${itemId}`)) {
          cancelEditing(itemId);
        }
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [editingItems]);

  return (
    <div className="TodoList">
      <SideNavBar />
      <div className="main-content">
        <NavBar
          welcomeText={"Bienvenue to your todo list!"}
          handleLogout={handleLogout}
        />
        <div className="main-container">
          <h1>Todo-wall</h1>
          <div className="adding">
            <div className="inputs">
              <div>
                <label htmlFor="itemName" className="name">Item Name: </label>
                <input
                  type="text"
                  id="itemName"
                  placeholder="Add Item Name"
                  ref={addNameInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addDueDateInputRef.current.focus();
                    }
                  }}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="dueDate" className="due-date">Due Date: </label>
                <input
                  type="date"
                  id="dueDate"
                  ref={addDueDateInputRef}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addItem(text, addDueDateInputRef.current.value);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <button
                onClick={() => addItem(text, addDueDateInputRef.current.value)}
              >
                Add
              </button>
            </div>
          </div>

          <div className="list">
            <DragDropContext onDragEnd={handleDragEnd}>
              {_.map(state, (data, key) => {
                return (
                  <div key={key} className="column">
                    <div className="header-col">
                      <h3>{data.title}</h3>
                      <button
                        className="remove-all"
                        onClick={() => removeAllTasks(key)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                    <Droppable droppableId={key}>
                      {(provided) => {
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="droppable-col"
                          >
                            {data.items.map((el, index) => {
                              const isCompleted = key === "done";
                              const isEditing = !!editingItems[el.id];
                              const canEdit =
                                !isDueDatePassed(el.dueDate) &&
                                !isCompleted &&
                                (key === "new" || key === "progress");
                              const canRemove =
                                !isEditing && (isCompleted || key !== "done");

                              return (
                                <Draggable
                                  key={el.id}
                                  draggableId={el.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => {
                                    const isDragging = snapshot.isDragging;
                                    return (
                                      <div
                                        id={`item-${el.id}`}
                                        className={`item${
                                          isEditing ? " editing" : ""
                                        } ${
                                          isDueDatePassed(el.dueDate)
                                            ? "due-date-passed"
                                            : ""
                                        }
                                        ${isDragging ? "item-dragging" : ""}`}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        {isEditing ? (
                                          <>
                                            <input
                                              type="text"
                                              className="edit-input"
                                              value={editingItems[el.id].name}
                                              onChange={(e) =>
                                                handleNameInputChange(e, el.id)
                                              }
                                              onKeyDown={(e) =>
                                                handleKeyDown(e, el.id)
                                              }
                                              onBlur={(e) =>
                                                handleBlur(e, el.id)
                                              }
                                              onClick={() =>
                                                handleInputFocus(el.id)
                                              }
                                            />
                                            <input
                                              type="date"
                                              className="edit-input"
                                              value={
                                                editingItems[el.id].dueDate
                                              }
                                              onChange={(e) =>
                                                handleDueDateInputChange(
                                                  e,
                                                  el.id
                                                )
                                              }
                                              onKeyDown={(e) =>
                                                handleKeyDown(e, el.id)
                                              }
                                              onBlur={(e) =>
                                                handleBlur(e, el.id)
                                              }
                                              onClick={() =>
                                                handleInputFocus(el.id)
                                              }
                                            />
                                            <button
                                              className="edit-confirm"
                                              onClick={() =>
                                                confirmEditing(el.id)
                                              }
                                            >
                                              &#10004;
                                            </button>
                                            <button
                                              className="edit-cancel"
                                              onClick={() =>
                                                cancelEditing(el.id)
                                              }
                                            >
                                              &#10005;
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <div className="content name">
                                              {el.name}
                                            </div>
                                            <div className="content date">
                                              {isDueDatePassed(el.dueDate)
                                                ? "! "
                                                : ""}
                                              {"Due date: "}
                                              {el.dueDate}
                                            </div>
                                            {canEdit && (
                                              <button
                                                className="edit-button"
                                                onClick={() =>
                                                  startEditing(
                                                    el.id,
                                                    el.name,
                                                    el.dueDate
                                                  )
                                                }
                                              >
                                                Edit
                                              </button>
                                            )}
                                            {canRemove && (
                                              <button
                                                className="remove-button"
                                                onClick={() =>
                                                  removeItem(key, index, el.id)
                                                }
                                              >
                                                Remove
                                              </button>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        );
                      }}
                    </Droppable>
                  </div>
                );
              })}
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoList;
