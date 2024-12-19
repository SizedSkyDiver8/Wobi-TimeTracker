import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import close from "../assets/close.png";
import TimeSelector from "./TimeSelector";
import CalendarSelector from "./CalendarSelector";
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

export default function BasicModal({
  openModal,
  closeModal,
  logData,
  onSave,
  secondLog,
}) {
  const [formCheckIn, setFformCheckIn] = useState({});
  const [formCheckOut, setFformCheckOut] = useState({});
  const [status, setStatus] = useState("status"); // State for Status
  const [clockSelector, setClockSelector] = useState(false);
  const [calendarSelector, setCalendarSelector] = useState(false);
  const [editingLog, setEditingLog] = useState(""); // "check-in" or "check-out"
  const [error, setError] = useState("");
  const [minCheckOutDate, setMinCheckOutDate] = useState(dayjs()); // Default to today

  // Update form states when logData changes
  useEffect(() => {
    const defaultLog = {
      username: "",
      type: "",
      timestamp: "",
      date: "",
      status: "status",
    };
    if (logData && logData.type === "check-in") {
      setFformCheckIn({ ...defaultLog, ...logData });
      setFformCheckOut({ ...defaultLog, ...secondLog });
      setStatus(secondLog?.status || "status"); // Existing status or default
    } else {
      setFformCheckIn({ ...defaultLog, ...secondLog });
      setFformCheckOut({ ...defaultLog, ...logData });
      setStatus(logData?.status || "status");
    }
  }, [logData, secondLog, openModal]);

  useEffect(() => {
    if (formCheckIn.date) {
      setMinCheckOutDate(dayjs(formCheckIn.date, "DD-MM-YYYY"));
    }
  }, [formCheckIn.date]);

  const handleTimeSelect = (selectedTime) => {
    if (editingLog === "check-in") {
      setFformCheckIn((prev) => ({ ...prev, timestamp: selectedTime }));
    } else if (editingLog === "check-out") {
      setFformCheckOut((prev) => ({ ...prev, timestamp: selectedTime }));
    }
    setClockSelector(false);
  };

  const handleDateSelect = (selectedDate) => {
    if (editingLog === "check-in") {
      setFformCheckIn((prev) => ({ ...prev, date: selectedDate }));
      setFformCheckOut((prev) => ({ ...prev, date: "" }));
    } else if (editingLog === "check-out") {
      setFformCheckOut((prev) => ({ ...prev, date: selectedDate }));
    }
    setCalendarSelector(false);
  };

  const handleSave = async () => {
    const checkInDateTime = dayjs(
      `${formCheckIn.date} ${formCheckIn.timestamp}`,
      "DD-MM-YYYY HH:mm"
    );
    const checkOutDateTime = dayjs(
      `${formCheckOut.date} ${formCheckOut.timestamp}`,
      "DD-MM-YYYY HH:mm"
    );
    if (!status || status === "status") {
      setError("Please select a status for Check-Out.");
      return;
    }
    if (checkOutDateTime.isBefore(checkInDateTime)) {
      setError(
        "Invalid Check-Out time: Check-Out must be later than Check-In."
      );
      return;
    }
    setError("");
    const updatedCheckIn = {
      ...formCheckIn,
      username: formCheckIn.username || formCheckOut.username || "",
      type: "check-in",
    };
    const updatedCheckOut = {
      ...formCheckOut,
      username: formCheckIn.username || formCheckOut.username || "",
      type: "check-out",
      status,
    };

    try {
      if (updatedCheckIn.id) {
        const response = await fetch(
          `http://localhost:3001/updateLog/${updatedCheckIn.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCheckIn),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Failed to update Check-In log.");
          return;
        }
      }
      if (updatedCheckOut.id) {
        const response = await fetch(
          `http://localhost:3001/updateLog/${updatedCheckOut.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCheckOut),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Failed to update Check-Out log.");
          return;
        }
      }
      onSave(updatedCheckIn, updatedCheckOut);
      closeModal(false);
      setClockSelector(false);
      setCalendarSelector(false);
    } catch (error) {
      console.error("Error updating logs:", error.message);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <Modal
        open={openModal}
        onClose={() => {
          closeModal(false);
          setClockSelector(false);
          setCalendarSelector(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <button
            className="bttnCloseModal"
            onClick={() => {
              closeModal(false);
              setClockSelector(false);
              setCalendarSelector(false);
            }}
          >
            <img src={close} alt="close" />
          </button>
          {/* Check-In Section */}
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Log
          </Typography>
          <Typography id="modal-modal-subTitle" variant="h6" component="p">
            Check-In
          </Typography>
          <Box component="form" sx={{ mt: 2 }} id="Box-log">
            <label className="editLabel">
              User:
              <input
                type="text"
                name="username"
                value={formCheckIn.username || formCheckOut.username || ""}
                disabled
              />
            </label>

            <label className="editLabel">
              Timestamp:
              <input
                type="text"
                name="timestamp"
                value={formCheckIn.timestamp || ""}
                onClick={() => {
                  setEditingLog("check-in");
                  setClockSelector(true);
                }}
                autoComplete="off"
                readOnly
              />
            </label>

            <label className="editLabel">
              Date:
              <input
                type="text"
                name="date"
                value={formCheckIn.date || ""}
                onClick={() => {
                  setEditingLog("check-in");
                  setCalendarSelector(true);
                }}
                autoComplete="off"
                readOnly
              />
            </label>
          </Box>

          {/* Check-Out Section */}
          <Typography
            id="modal-modal-subTitle-checkOut"
            variant="h6"
            component="p"
          >
            Check-Out
          </Typography>
          <Box component="form" sx={{ mt: 2 }} id="Box-log">
            <label className="editLabel">
              Timestamp:
              <input
                type="text"
                name="timestamp"
                value={formCheckOut.timestamp || ""}
                onClick={() => {
                  setEditingLog("check-out");
                  setClockSelector(true);
                }}
                autoComplete="off"
                readOnly
              />
            </label>

            <label className="editLabel">
              Date:
              <input
                type="text"
                name="date"
                value={formCheckOut.date || ""}
                onClick={() => {
                  setEditingLog("check-out");
                  setCalendarSelector(true);
                }}
                autoComplete="off"
                readOnly
              />
            </label>

            {/* Status Dropdown */}
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
          {error && <span className="errorSpan">{error}</span>}

          {/* Save Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            {!clockSelector && !calendarSelector && (
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
            )}
          </Box>

          {/* Clock Selector */}
          {clockSelector && (
            <div className="time-selector-overlay">
              <TimeSelector
                onTimeSelect={handleTimeSelect}
                closeTimeSelector={() => setClockSelector(false)}
                initialTime={formCheckOut.timestamp}
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
        </Box>
      </Modal>
    </>
  );
}
