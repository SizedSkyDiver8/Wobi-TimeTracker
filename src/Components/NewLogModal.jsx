import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TimeSelector from "./TimeSelector";
import CalendarSelector from "./CalendarSelector";
import close from "../assets/close.png";
import dayjs from "dayjs";
import calendar from "../assets/calendar.png";
import clock from "../assets/clock.png";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function NewLogModal({ openModal, closeModal, addNewLog }) {
  const [users, setUsers] = useState([]);
  const [clockSelector, setClockSelector] = useState(false);
  const [calendarSelector, setCalendarSelector] = useState(false);
  const [editingLog, setEditingLog] = useState(""); // "check-in" or "check-out"
  const [error, setError] = useState("");
  const [openCalendar, setOpenCalendar] = useState(false);
  const [calendarFor, setCalendarFor] = useState("");
  const [status, setStatus] = useState("status");
  const [minCheckOutDate, setMinCheckOutDate] = useState(dayjs());

  const [formCheckIn, setFormCheckIn] = useState({
    username: "",
    type: "check-in",
    timestamp: "",
    date: "",
    status: "",
  });

  const [formCheckOut, setFormCheckOut] = useState({
    username: "",
    type: "check-out",
    timestamp: "",
    date: "",
    status: "",
  });

  // Fetch users
  const getUsersList = async () => {
    try {
      const response = await fetch(`http://localhost:3001/getUsers`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.filter((user) => user.role !== "admin"));
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  useEffect(() => {
    if (openModal) {
      getUsersList();
      setFormCheckIn({
        username: "",
        type: "check-in",
        timestamp: "",
        date: "",
      });
      setFormCheckOut({
        username: "",
        type: "check-out",
        timestamp: "",
        date: "",
      });
      setStatus("status");
      setError("");
    }
  }, [openModal]);

  const handleDateSelect = (selectedDate) => {
    if (editingLog === "check-in") {
      setFormCheckIn((prev) => ({ ...prev, date: selectedDate }));
      setFormCheckOut((prev) => ({ ...prev, date: "" }));
    } else if (editingLog === "check-out") {
      setFormCheckOut((prev) => ({ ...prev, date: selectedDate }));
    }
    setCalendarSelector(false);
  };

  const validateTimestamp = (timestamp) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return timeRegex.test(timestamp);
  };

  const validateDate = (date) => {
    return dayjs(date, "DD-MM-YYYY", true).isValid();
  };

  const handleTimeSelect = (selectedTime) => {
    if (editingLog === "check-in") {
      setFormCheckIn((prev) => ({ ...prev, timestamp: selectedTime }));
    } else if (editingLog === "check-out") {
      setFormCheckOut((prev) => ({ ...prev, timestamp: selectedTime }));
    }
    setClockSelector(false);
  };

  const handleSave = async () => {
    const formatTime = (time) => {
      if (/^\d{2}:\d{2}$/.test(time)) {
        return `${time}:00`;
      }
      return time;
    };
    const formattedCheckInTime = formatTime(formCheckIn.timestamp);
    const formattedCheckOutTime = formatTime(formCheckOut.timestamp);
    if (
      !formCheckIn.username ||
      !validateTimestamp(formattedCheckInTime) ||
      !validateDate(formCheckIn.date)
    ) {
      setError("Check-In: All fields are required and must be valid.");
      return;
    }
    if (
      !validateTimestamp(formattedCheckOutTime) ||
      !validateDate(formCheckOut.date)
    ) {
      setError("Check-Out: All fields are required and must be valid.");
      return;
    }
    if (!status || status === "status") {
      setError("Check-Out: Please select a status.");
      return;
    }
    const checkInDateTime = dayjs(
      `${formCheckIn.date} ${formattedCheckInTime}`,
      "DD-MM-YYYY HH:mm:ss"
    );
    const checkOutDateTime = dayjs(
      `${formCheckOut.date} ${formattedCheckOutTime}`,
      "DD-MM-YYYY HH:mm:ss"
    );
    if (checkOutDateTime.isBefore(checkInDateTime)) {
      setError(
        "Invalid Check-Out time: Check-Out must be later than Check-In."
      );
      return;
    }
    setError("");
    try {
      await addNewLog({
        ...formCheckIn,
        type: "check-in",
        timestamp: formattedCheckInTime,
        status,
      });
      await addNewLog({
        ...formCheckOut,
        type: "check-out",
        timestamp: formattedCheckOutTime,
        status,
      });
      closeModal();
    } catch (error) {
      console.error("Error saving logs:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <Modal
        open={openModal}
        onClose={() => {
          closeModal();
          setClockSelector(false);
          setOpenCalendar(false);
        }}
      >
        <Box sx={style}>
          <button
            className="bttnCloseModal"
            onClick={() => {
              closeModal();
              setClockSelector(false);
              setOpenCalendar(false);
            }}
          >
            <img src={close} alt="close" />
          </button>

          <Typography id="modal-modal-title" variant="h6">
            Add New Log
          </Typography>

          {/* Check-In Section */}
          <Typography id="modal-modal-subTitle" variant="h6" component="p">
            Check-In
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <label className="editLabel">
              User:
              <select
                name="username"
                value={formCheckIn.username}
                onChange={(e) => {
                  setFormCheckIn({ ...formCheckIn, username: e.target.value });
                  setFormCheckOut({
                    ...formCheckOut,
                    username: e.target.value,
                  });
                }}
              >
                <option value="" disabled>
                  Select a user
                </option>
                {users.map((user) => (
                  <option key={user.username} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            </label>

            <label className="editLabel">
              Timestamp:
              <input
                className="input-Timestamp"
                type="text"
                value={formCheckIn.timestamp}
                onChange={(e) =>
                  setFormCheckIn({ ...formCheckIn, timestamp: e.target.value })
                }
                autoComplete="off"
              />
              <img
                src={clock}
                className="clock-icon"
                onClick={() => {
                  setEditingLog("check-in");
                  setClockSelector(true);
                }}
              />
            </label>

            <label className="editLabel">
              Date:
              <input
                type="text"
                value={formCheckIn.date}
                onChange={(e) =>
                  setFormCheckIn({ ...formCheckIn, date: e.target.value })
                }
                autoComplete="off"
              />
              <img
                src={calendar}
                className="calendar-icon"
                onClick={() => {
                  setEditingLog("check-in");
                  setCalendarSelector(true);
                }}
              />
            </label>
          </Box>

          {/* Check-Out Section */}
          <Typography id="modal-modal-subTitle" variant="h6" component="p">
            Check-Out
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <label className="editLabel">
              Timestamp:
              <input
                className="input-Timestamp"
                type="text"
                value={formCheckOut.timestamp}
                onChange={(e) =>
                  setFormCheckOut({
                    ...formCheckOut,
                    timestamp: e.target.value,
                  })
                }
                autoComplete="off"
              />
              <img
                src={clock}
                className="clock-icon"
                onClick={() => {
                  setEditingLog("check-out");
                  setClockSelector(true);
                }}
              />
            </label>

            <label className="editLabel">
              Date:
              <input
                type="text"
                value={formCheckOut.date}
                onChange={(e) =>
                  setFormCheckOut({ ...formCheckOut, date: e.target.value })
                }
                autoComplete="off"
              />
              <img
                src={calendar}
                className="calendar-icon"
                onClick={() => {
                  setEditingLog("check-out");
                  setCalendarSelector(true);
                }}
              />
            </label>

            <label className="editLabel">
              Status:
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="status" disabled>
                  Select Status
                </option>
                <option value="work">Work</option>
                <option value="holiday">Holiday</option>
                <option value="sick-day">Sick Day</option>
              </select>
            </label>
          </Box>

          {/* Error Display */}
          {error && <div style={{ color: "red" }}>{error}</div>}

          {/* Save Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            {!clockSelector && !openCalendar && (
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Clock Selector */}
      {clockSelector && (
        <div className="time-selector-overlay">
          <TimeSelector
            onTimeSelect={handleTimeSelect}
            closeTimeSelector={() => setClockSelector(false)}
            initialTime={
              editingLog === "check-in"
                ? formCheckIn.timestamp
                : formCheckOut.timestamp
            }
          />
        </div>
      )}

      {/* Calendar Selector */}
      {calendarSelector && (
        <div className="time-selector-overlay">
          <CalendarSelector
            onDateSelect={handleDateSelect}
            onClose={() => setCalendarSelector(false)}
            minDate={editingLog === "check-out" ? minCheckOutDate : null}
          />
        </div>
      )}
    </>
  );
}
