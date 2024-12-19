import React, { useEffect, useState } from "react";
import BasicModal from "../Components/Modal";
import NewLogModal from "./NewLogModal";
import * as XLSX from "xlsx";
import pencil from "../assets/pencil.png";
import garbage from "../assets/garbage.png";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import DonutChart from "./DonutChart";
import clear from "../assets/clear.png";

export default function AdminPanel() {
  const [logs, setLogs] = useState([]); // Logs fetched from server
  const [pairedLogs, setPairedLogs] = useState([]);
  const [isNewLog, setIsNewLog] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [changeLog, setChangeLog] = useState(null);
  const [otherLog, setOtherLog] = useState(null);
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState("");
  const [userForChart, setUserForChart] = useState("");

  // Fetch all logs
  const fetchLogs = async () => {
    try {
      const response = await fetch(`http://localhost:3001/adminLogs`);
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error.message);
    }
  };

  // useEffect for initial load
  useEffect(() => {
    fetchLogs();
  }, []);

  // Pair logs and sort by Check-In Date
  useEffect(() => {
    const pairLogs = () => {
      const paired = [];
      // order by their Check-In or Check-Out timestamps
      const unpairedLogs = [...logs].sort((a, b) => {
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
          paired.push({ checkIn: currentCheckIn, checkOut: log });
          currentCheckIn = null;
        }
      }
      if (currentCheckIn) {
        paired.push({ checkIn: currentCheckIn, checkOut: null });
      }
      // Sort paired logs by Check-In Date in descending order
      const sortedLogs = paired.sort((a, b) => {
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
        return dateB - dateA;
      });
      setPairedLogs(sortedLogs);
    };
    if (logs.length) {
      pairLogs();
    }
  }, [logs]);

  // Add new log
  // const addNewLog = async (log) => {
  //   try {
  //     // Fetch user data to validate holiday/sick day balance
  //     const userResponse = await fetch(
  //       `http://localhost:3001/getUser/${log.username}`
  //     );
  //     if (!userResponse.ok) throw new Error("Failed to fetch user data");
  //     const userData = await userResponse.json();

  //     if (log.status === "holiday" && userData.holiday <= 0) {
  //       throw new Error("User has no remaining holiday days.");
  //     }
  //     if (log.status === "sick day" && userData.sickDays <= 0) {
  //       throw new Error("User has no remaining sick days.");
  //     }

  //     // Proceed with adding the log
  //     const response = await fetch(`http://localhost:3001/AddLog`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(log),
  //     });
  //     if (!response.ok) throw new Error("Failed to add log");
  //     const newLog = await response.json();

  //     // Trigger re-fetch of logs
  //     fetchLogs();
  //   } catch (error) {
  //     console.error("Error adding new log:", error.message);
  //     alert(error.message); // Show error message to the admin
  //   } finally {
  //     setIsNewLog(false); // Close modal
  //   }
  // };

  const addNewLog = async (log) => {
    try {
      // Fetch user data to validate holiday/sick day balance if required
      if (log.status === "holiday" || log.status === "sick-day") {
        const userResponse = await fetch(
          `http://localhost:3001/getUser/${log.username}`
        );
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
        const userData = await userResponse.json();

        if (log.status === "holiday" && userData.holiday <= 0) {
          throw new Error("User has no remaining holiday days.");
        }
        if (log.status === "sick-day" && userData.sickDays <= 0) {
          throw new Error("User has no remaining sick days.");
        }
      }

      // Proceed with adding the log
      const response = await fetch(`http://localhost:3001/AddLog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      });
      if (!response.ok) throw new Error("Failed to add log");
      const newLog = await response.json();

      // Add the new log directly to the logs state
      setLogs((prevLogs) => [...prevLogs, newLog]);
    } catch (error) {
      console.error("Error adding new log:", error.message);
      alert(error.message); // Show error message to the admin
    }
  };

  // Edit and save logs
  const handleSave = async (updatedCheckIn, updatedCheckOut) => {
    try {
      const updateOrAddLog = async (log) => {
        if (log.id) {
          const response = await fetch(
            `http://localhost:3001/updateLog/${log.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(log),
            }
          );
          return response.ok ? await response.json() : null;
        } else {
          const response = await fetch(`http://localhost:3001/AddLog`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(log),
          });
          return response.ok ? await response.json() : null;
        }
      };
      const [checkInResult, checkOutResult] = await Promise.all([
        updateOrAddLog(updatedCheckIn),
        updateOrAddLog(updatedCheckOut),
      ]);
      setLogs((prevLogs) =>
        prevLogs
          .filter(
            (log) =>
              log.id !== updatedCheckIn.id && log.id !== updatedCheckOut.id
          )
          .concat([checkInResult, checkOutResult].filter(Boolean))
      );
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving logs:", error.message);
    }
  };

  // Delete logs
  const handleDelete = async (checkInId, checkOutId) => {
    try {
      await Promise.all([
        fetch(`http://localhost:3001/deleteLog/${checkInId}`, {
          method: "DELETE",
        }),
        checkOutId &&
          fetch(`http://localhost:3001/deleteLog/${checkOutId}`, {
            method: "DELETE",
          }),
      ]);
      setLogs((prevLogs) =>
        prevLogs.filter((log) => log.id !== checkInId && log.id !== checkOutId)
      );
    } catch (error) {
      console.error("Error deleting logs:", error.message);
    }
  };

  // Export paired logs to Excel
  const exportLogsToExcel = () => {
    const dataToExport = pairedLogs.map((pair) => ({
      Username: pair.checkIn.username,
      "Check-In Time": pair.checkIn.timestamp,
      "Check-In Date": pair.checkIn.date,
      "Check-Out Time": pair.checkOut?.timestamp || "",
      "Check-Out Date": pair.checkOut?.date || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paired Logs");
    XLSX.writeFile(workbook, `paired_logs_${new Date().toISOString()}.xlsx`);
  };

  const logOut = () => {
    setUser(null);
    navigate("/login");
  };

  // filters the table by user
  const searchByChar = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/userByChar/${searchUser}`
      );
      if (!response.ok) throw new Error("Failed to fetch filtered logs");
      const filteredLogs = await response.json();
      setLogs(filteredLogs);
    } catch (error) {
      console.error("Error fetching filtered logs:", error.message);
    }
  };

  useEffect(() => {
    if (searchUser === "") {
      fetchLogs();
    } else {
      searchByChar();
    }
  }, [searchUser]);

  return (
    <div className="admin-panel">
      <h1>Welcome, Admin</h1>
      <button className="bttn-log-out" onClick={logOut}>
        Log Out
      </button>
      <button className="Add-new-log" onClick={() => setIsNewLog(true)}>
        Add Log
      </button>
      <button className="export-btn" onClick={exportLogsToExcel}>
        Export to Excel
      </button>
      <div className="input-search">
        <input
          type="text"
          placeholder="Search"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <img
          src={clear}
          alt="search"
          className="toggleClearIcon"
          onClick={() => setSearchUser("")}
        />
      </div>
      {pairedLogs.length > 0 ? (
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Check-In Time</th>
                <th>Check-In Date</th>
                <th>Check-Out Time</th>
                <th>Check-Out Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pairedLogs.map((pair, index) => (
                <tr key={index}>
                  <td
                    className="user-td"
                    onClick={() => setUserForChart(pair.checkIn.username)}
                  >
                    {pair.checkIn.username}
                  </td>
                  <td>{pair.checkIn.timestamp}</td>
                  <td>{pair.checkIn.date}</td>
                  <td>{pair.checkOut?.timestamp || ""}</td>
                  <td>{pair.checkOut?.date || ""}</td>
                  <td>{pair.checkOut?.status || ""}</td>
                  <td>
                    <button
                      className="bttnImg"
                      onClick={() => {
                        setChangeLog(pair.checkIn);
                        setOtherLog(pair.checkOut);
                        setOpenModal(true);
                      }}
                    >
                      <img src={pencil} alt="edit" />
                    </button>
                    <button
                      className="bttnImg"
                      onClick={() =>
                        handleDelete(pair.checkIn.id, pair.checkOut?.id)
                      }
                    >
                      <img src={garbage} alt="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No logs available yet.</p>
      )}
      {userForChart && (
        <DonutChart nameOfUser={userForChart} closeChart={setUserForChart} />
      )}
      {isNewLog && (
        <NewLogModal
          openModal={isNewLog}
          closeModal={() => setIsNewLog(false)}
          addNewLog={addNewLog}
        />
      )}
      {openModal && (
        <BasicModal
          openModal={openModal}
          closeModal={() => setOpenModal(false)}
          logData={changeLog}
          secondLog={otherLog}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
