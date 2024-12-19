import React, { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import { BeatLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import calculator from "../assets/calculator.png";
import Calculator from "./Calculator";

export default function UserPanel() {
  const { user, setUser } = useUser();
  const [logs, setLogs] = useState([]); // Paired logs
  const [message, setMessage] = useState("");
  const username = user?.username;
  const [checkIn, setCheckIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [calculate, setCalculate] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      if (!username) return;

      setLoading(true);
      try {
        const endpoint = selectedMonth
          ? `http://localhost:3001/monthlyLog/${username}/${selectedMonth}`
          : `http://localhost:3001/getLogs?username=${username}`;

        const response = await fetch(endpoint);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        const pairedLogs = [];
        const unpairedLogs = [...data].sort((a, b) => {
          const dateA = new Date(
            a.date.split("-").reverse().join("-") + "T" + a.timestamp
          );
          const dateB = new Date(
            b.date.split("-").reverse().join("-") + "T" + b.timestamp
          );
          return dateA - dateB;
        });
        let currentCheckIn = null;
        for (let log of unpairedLogs) {
          if (log.type === "check-in") {
            currentCheckIn = log;
          } else if (log.type === "check-out" && currentCheckIn) {
            pairedLogs.push({ checkIn: currentCheckIn, checkOut: log });
            currentCheckIn = null;
          }
        }
        if (currentCheckIn) {
          pairedLogs.push({ checkIn: currentCheckIn, checkOut: null });
        }
        const sortedLogs = pairedLogs.sort((a, b) => {
          const dateA = new Date(
            a.checkIn.date.split("-").reverse().join("-") +
              "T" +
              a.checkIn.timestamp
          );
          const dateB = new Date(
            b.checkIn.date.split("-").reverse().join("-") +
              "T" +
              b.checkIn.timestamp
          );
          return dateB - dateA; // Descending order
        });
        setLogs(sortedLogs);
        setCheckIn(sortedLogs[0]?.checkOut === null);
      } catch (error) {
        console.error("Failed to fetch logs:", error.message);
        setMessage("Error fetching logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [username, selectedMonth]);

  const handleLogAction = async (type) => {
    if (!username) return setMessage("No user logged in.");
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, type }),
      });

      if (response.ok) {
        const newLog = await response.json();
        setMessage("Action logged successfully!");

        setLogs((prevLogs) => {
          const updatedLogs = [...prevLogs];
          if (type === "check-in") {
            updatedLogs.unshift({ checkIn: newLog.log, checkOut: null });
          } else if (type === "check-out") {
            const lastLog = updatedLogs.find((log) => log.checkOut === null);
            if (lastLog) lastLog.checkOut = newLog.log;
          }
          return updatedLogs;
        });

        setCheckIn(type === "check-in");
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to log action.");
      }
    } catch (error) {
      console.error("Error logging action:", error);
      setMessage("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogActionWithStatus = async (status) => {
    if (!username) return setMessage("No user logged in.");
    try {
      setLoading(true);
      const todayDate = new Date();
      const formattedDate = todayDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("-");
      const checkInLog = {
        username,
        type: "check-in",
        timestamp: "08:00:00",
        date: formattedDate,
        status,
      };
      const checkOutLog = {
        username,
        type: "check-out",
        timestamp: "16:00:00",
        date: formattedDate,
        status,
      };
      // Log Check-In
      const checkInResponse = await fetch("http://localhost:3001/AddLog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkInLog),
      });

      if (!checkInResponse.ok) {
        const errorData = await checkInResponse.json();
        setMessage(errorData.message || "Error logging Check-In");
        return;
      }
      // Log Check-Out
      const checkOutResponse = await fetch("http://localhost:3001/AddLog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkOutLog),
      });
      if (!checkOutResponse.ok) {
        const errorData = await checkOutResponse.json();
        setMessage(errorData.message || "Error logging Check-Out");
        return;
      }
      const newCheckInLog = await checkInResponse.json();
      const newCheckOutLog = await checkOutResponse.json();
      setMessage(
        `${
          status.charAt(0).toUpperCase() + status.slice(1)
        } logged successfully!`
      );
      setLogs((prevLogs) => [
        { checkIn: newCheckInLog, checkOut: newCheckOutLog },
        ...prevLogs,
      ]);
    } catch (error) {
      console.error("Unexpected error logging action:", error);
      setMessage("Unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const logOut = () => {
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    if (message && !message.includes("Error")) {
      const timeout = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  return (
    <>
      <button className="bttn-log-out" onClick={logOut}>
        Log Out
      </button>
      {loading && (
        <div className="divLoader">
          <BeatLoader />
        </div>
      )}
      <div className="user-panel">
        <h1>Welcome, {username || "Guest"}</h1>
        <div className="log-buttons">
          <button
            className="bttn-check"
            onClick={() => handleLogAction("check-in")}
            disabled={checkIn}
          >
            Check In
          </button>
          <button
            className="bttn-check"
            onClick={() => handleLogAction("check-out")}
            disabled={!checkIn}
          >
            Check Out
          </button>
          <button
            className="bttn-check"
            onClick={() => handleLogActionWithStatus("holiday")}
          >
            Vacation
          </button>
          <button
            className="bttn-check"
            onClick={() => handleLogActionWithStatus("sick day")}
          >
            Sick Day
          </button>
          <button className="bttn-calc" onClick={() => setCalculate(true)}>
            Calculate <img src={calculator} alt="Calculator Icon" />
          </button>
          <div className="dropdown-container">
            <select
              className="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Select a month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
        {message && (
          <p
            className={`message ${
              message.includes("Error") ? "error" : "success"
            }`}
          >
            {message}
          </p>
        )}
        <div className="logs-table-container">
          {logs.length > 0 ? (
            <table className="logs-table-user">
              <thead>
                <tr>
                  <th>Check-In Time</th>
                  <th>Check-In Date</th>
                  <th>Check-Out Time</th>
                  <th>Check-Out Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.checkIn?.timestamp || ""}</td>
                    <td>{log.checkIn?.date || ""}</td>
                    <td>{log.checkOut?.timestamp || ""}</td>
                    <td>{log.checkOut?.date || ""}</td>
                    <td>{log.checkOut?.status || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-logs">No logs available yet.</p>
          )}
        </div>
      </div>
      {calculate && <Calculator closeCalc={setCalculate} />}
    </>
  );
}
