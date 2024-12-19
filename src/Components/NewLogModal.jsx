import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TimeSelector from "./TimeSelector";
import CalendarSelector from "./CalendarSelector";
import close from "../assets/close.png";
import dayjs from "dayjs";

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
  const [editingLog, setEditingLog] = useState(""); // "check-in" or "check-out"
  const [error, setError] = useState("");
  const [openCalendar, setOpenCalendar] = useState(false);
  const [calendarFor, setCalendarFor] = useState(""); // "check-in" or "check-out"
  const [status, setStatus] = useState("status"); // State for Check-Out status

  const [formCheckIn, setFormCheckIn] = useState({
    username: "",
    type: "check-in",
    timestamp: "",
    date: "",
  });

  const [formCheckOut, setFormCheckOut] = useState({
    username: "",
    type: "check-out",
    timestamp: "",
    date: "",
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
    if (calendarFor === "check-in") {
      setFormCheckIn((prev) => ({ ...prev, date: selectedDate }));
      setFormCheckOut((prev) => ({ ...prev, date: "" }));
    } else if (calendarFor === "check-out") {
      setFormCheckOut((prev) => ({ ...prev, date: selectedDate }));
    }
    setOpenCalendar(false);
  };

  const handleTimeSelect = (selectedTime) => {
    if (editingLog === "check-in") {
      setFormCheckIn((prev) => ({ ...prev, timestamp: selectedTime }));
    } else if (editingLog === "check-out") {
      setFormCheckOut((prev) => ({ ...prev, timestamp: selectedTime }));
    }
    setClockSelector(false);
  };

  // const handleSave = () => {
  //   if (!formCheckIn.username || !formCheckIn.timestamp || !formCheckIn.date) {
  //     setError("Check-In: All fields are required.");
  //     return;
  //   }
  //   if (!formCheckOut.timestamp || !formCheckOut.date) {
  //     setError("Check-Out: All fields are required.");
  //     return;
  //   }
  //   if (!status || status === "status") {
  //     setError("Check-Out: Please select a status.");
  //     return;
  //   }
  //   const checkInDateTime = dayjs(
  //     `${formCheckIn.date} ${formCheckIn.timestamp}`,
  //     "DD-MM-YYYY HH:mm:ss"
  //   );
  //   const checkOutDateTime = dayjs(
  //     `${formCheckOut.date} ${formCheckOut.timestamp}`,
  //     "DD-MM-YYYY HH:mm:ss"
  //   );
  //   if (checkOutDateTime.isBefore(checkInDateTime)) {
  //     setError(
  //       "Invalid Check-Out time: Check-Out must be later than Check-In."
  //     );
  //     return;
  //   }
  //   setError(""); // Clear error
  //   addNewLog(formCheckIn);
  //   addNewLog({ ...formCheckOut, status }); // Include status in Check-Out log
  //   closeModal();
  // };
  // const handleSave = async () => {
  //   if (!formCheckIn.username || !formCheckIn.timestamp || !formCheckIn.date) {
  //     setError("Check-In: All fields are required.");
  //     return;
  //   }
  //   if (!formCheckOut.timestamp || !formCheckOut.date) {
  //     setError("Check-Out: All fields are required.");
  //     return;
  //   }
  //   if (!status || status === "status") {
  //     setError("Check-Out: Please select a status.");
  //     return;
  //   }

  //   const checkInDateTime = dayjs(
  //     `${formCheckIn.date} ${formCheckIn.timestamp}`,
  //     "DD-MM-YYYY HH:mm:ss"
  //   );
  //   const checkOutDateTime = dayjs(
  //     `${formCheckOut.date} ${formCheckOut.timestamp}`,
  //     "DD-MM-YYYY HH:mm:ss"
  //   );
  //   if (checkOutDateTime.isBefore(checkInDateTime)) {
  //     setError(
  //       "Invalid Check-Out time: Check-Out must be later than Check-In."
  //     );
  //     return;
  //   }

  //   setError(""); // Clear any existing errors

  //   try {
  //     // First POST request: Check-In
  //     addNewLog({ ...formCheckIn, status });
  //     addNewLog({ ...formCheckOut, status });

  //     if (!checkInResponse.ok) {
  //       const checkInError = await checkInResponse.json();
  //       setError(checkInError.message || "Failed to add Check-In log.");
  //       return;
  //     }

  //     // Second POST request: Check-Out
  //     const checkOutResponse = await fetch("http://localhost:3001/AddLog", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ...formCheckOut, status }), // Include status in Check-Out log
  //     });

  //     if (!checkOutResponse.ok) {
  //       const checkOutError = await checkOutResponse.json();
  //       setError(checkOutError.message || "Failed to add Check-Out log.");
  //       return;
  //     }

  //     // Close modal after successful addition
  //     closeModal();
  //   } catch (error) {
  //     console.error("Error saving logs:", error);
  //     setError("An unexpected error occurred. Please try again.");
  //   }
  // };
  const handleSave = async () => {
    if (!formCheckIn.username || !formCheckIn.timestamp || !formCheckIn.date) {
      setError("Check-In: All fields are required.");
      return;
    }
    if (!formCheckOut.timestamp || !formCheckOut.date) {
      setError("Check-Out: All fields are required.");
      return;
    }
    if (!status || status === "status") {
      setError("Check-Out: Please select a status.");
      return;
    }

    const checkInDateTime = dayjs(
      `${formCheckIn.date} ${formCheckIn.timestamp}`,
      "DD-MM-YYYY HH:mm:ss"
    );
    const checkOutDateTime = dayjs(
      `${formCheckOut.date} ${formCheckOut.timestamp}`,
      "DD-MM-YYYY HH:mm:ss"
    );
    if (checkOutDateTime.isBefore(checkInDateTime)) {
      setError(
        "Invalid Check-Out time: Check-Out must be later than Check-In."
      );
      return;
    }

    setError(""); // Clear any existing errors

    try {
      // POST both logs sequentially
      await addNewLog({ ...formCheckIn, type: "check-in", status });
      await addNewLog({ ...formCheckOut, type: "check-out", status });
      closeModal(); // Close the modal after successful addition
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
                type="text"
                value={formCheckIn.timestamp}
                readOnly
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
                readOnly
                onClick={() => {
                  setCalendarFor("check-in");
                  setOpenCalendar(true);
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
                type="text"
                value={formCheckOut.timestamp}
                readOnly
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
                readOnly
                onClick={() => {
                  setCalendarFor("check-out");
                  setOpenCalendar(true);
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
      {openCalendar && (
        <CalendarSelector
          onDateSelect={handleDateSelect}
          onClose={() => setOpenCalendar(false)}
          minDate={
            calendarFor === "check-out" && formCheckIn.date
              ? dayjs(formCheckIn.date, "DD-MM-YYYY")
              : null
          }
        />
      )}
    </>
  );
}
