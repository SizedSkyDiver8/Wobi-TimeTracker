const fs = require("fs");
const LOGS_FILE = "./logs.json";
const USER_FILE = "./users.json";
const API_URL = "http://worldtimeapi.org/api/timezone/Europe/Berlin";

// Function reads logs from the file
function readLogs() {
  try {
    const data = fs.readFileSync(LOGS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Function writes logs to the file
function writeLogs(logs) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const dayjs = require("dayjs");

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors());

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  try {
    const usersData = fs.readFileSync(USER_FILE, "utf8");
    const users = JSON.parse(usersData);
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      res.json({
        message: "Login successful",
        user: { username: user.username, role: user.role },
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Get Hours by user
app.get("/getHours/:username", (req, res) => {
  try {
    const { username } = req.params;
    const data = fs.readFileSync(LOGS_FILE, "utf8");
    const logs = JSON.parse(data);
    const userLogs = logs.filter((log) => log.username === username);
    const timeByMonth = {};
    let checkInTime = null;
    userLogs.forEach((log) => {
      const [day, month, year] = log.date.split("-");
      const monthYear = `${month}-${year}`; // Format: MM-YYYY
      if (!timeByMonth[monthYear]) timeByMonth[monthYear] = 0;
      if (log.type === "check-in") {
        checkInTime = log.timestamp;
      } else if (log.type === "check-out" && checkInTime) {
        const [checkInH, checkInM] = checkInTime.split(":").map(Number);
        const [checkOutH, checkOutM] = log.timestamp.split(":").map(Number);
        const duration =
          checkOutH * 60 + checkOutM - (checkInH * 60 + checkInM);
        timeByMonth[monthYear] += duration;
        checkInTime = null;
      }
    });
    const allMonths = [
      "01-2024",
      "02-2024",
      "03-2024",
      "04-2024",
      "05-2024",
      "06-2024",
      "07-2024",
      "08-2024",
      "09-2024",
      "10-2024",
      "11-2024",
      "12-2024",
    ];
    const result = allMonths.map((monthYear) => {
      const totalMinutes = timeByMonth[monthYear] || 0;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return {
        month: monthYear,
        time: `${hours}h ${minutes}min`,
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Check if username already exists
app.post("/checkUsername", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }
  fs.readFile(USER_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Server error." });
    }
    const users = JSON.parse(data || "[]");
    const usernameTaken = users.some((user) => user.username === username);
    if (usernameTaken) {
      return res.status(200).json({ usernameTaken: true });
    } else {
      return res.status(200).json({ usernameTaken: false });
    }
  });
});

// Check if password is alike
app.post("/checkPass", (req, res) => {
  const { username, pass } = req.body;
  const checkSimilarity = (userPass, checkPass) => {
    if (checkPass.length > userPass.length) {
      return false;
    }
    if (userPass === checkPass) {
      return true;
    }
    let matchCount = 0;
    for (let char of checkPass) {
      if (userPass.includes(char)) {
        matchCount++;
      }
    }
    const similarityRatio = matchCount / checkPass.length;
    return similarityRatio > 0.5;
  };
  fs.readFile(USER_FILE, "utf8", (error, data) => {
    const users = JSON.parse(data);
    const answer = users.some(
      (user) =>
        user.username === username && checkSimilarity(user.password, pass)
    );
    if (answer) {
      return res.status(200).json({ usernameTaken: true });
    } else {
      return res.status(200).json({ usernameTaken: false });
    }
  });
});

// Update password for user
app.put("/changePass", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }
  fs.readFile(USER_FILE, "utf8", (error, data) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Server error. Could not read file." });
    }
    let users;
    try {
      users = JSON.parse(data || "[]");
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Server error. Invalid file format." });
    }
    let userFound = false;
    users.forEach((user) => {
      if (user.username === username) {
        user.password = password;
        userFound = true;
      }
    });
    if (!userFound) {
      return res.status(404).json({ message: "User not found." });
    }
    fs.writeFile(USER_FILE, JSON.stringify(users, null, 2), (writeErr) => {
      if (writeErr) {
        return res
          .status(500)
          .json({ message: "Server error. Could not update file." });
      }
      return res
        .status(200)
        .json({ message: "Password updated successfully!" });
    });
  });
});

// Add new user
app.post("/AddUser", (req, res) => {
  fs.readFile(USER_FILE, "utf8", (err, users) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch users." });
    }
    const usersList = JSON.parse(users);
    const isUsernameTaken = usersList.some(
      (user) => user.username === req.body.username
    );
    if (isUsernameTaken) {
      return res.status(400).json({ message: "Username is already taken" });
    }
    const newUser = {
      username: req.body.username,
      password: req.body.password,
      role: "user",
      vacation: 18,
      sickDays: 15,
    };
    usersList.push(newUser);
    fs.writeFile(USER_FILE, JSON.stringify(usersList, null, 2), (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ message: "Failed to save new user." });
      }
      res.status(200).json({ message: "User added successfully!" });
    });
  });
});

//Get All users
app.get("/getUsers", (req, res) => {
  fs.readFile(USER_FILE, "utf8", (err, users) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch users." });
    }
    try {
      const usersList = JSON.parse(users);
      res.json(usersList);
    } catch (parseError) {
      res.status(500).json({ message: "Invalid users file format." });
    }
  });
});

// Returns the logs of a specific user
app.get("/getLogs", (req, res) => {
  if (!req.query.username) {
    return res
      .status(400)
      .json({ message: "Username query parameter is required." });
  }
  fs.readFile(LOGS_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch logs." });
    }
    try {
      const logs = JSON.parse(data);
      const userLogs = logs.filter(
        (log) => log.username === req.query.username
      );
      res.json(userLogs);
    } catch (parseError) {
      res.status(500).json({ message: "Invalid logs format." });
    }
  });
});

// User makes an action (check-in or check-out)
app.post("/log", async (req, res) => {
  const { username, type } = req.body;
  if (!username || !type) {
    return res.status(400).json({ message: "Username and type are required" });
  }
  let berlinTime;
  let date;
  try {
    let retries = 0;
    const maxRetries = 500;
    let success = false;
    while (!success && retries < maxRetries) {
      try {
        const response = await axios.get(API_URL);
        const timestamp = response.data.datetime;
        berlinTime = timestamp.split("T")[1].split("+")[0].split(".")[0];
        const calendarDate = timestamp.split("T")[0];
        date = `${calendarDate.split("-")[2]}-${calendarDate.split("-")[1]}-${
          calendarDate.split("-")[0]
        }`;
        success = true;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error("Max retries reached. Could not fetch Berlin time.");
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch Berlin time. Please try again later.",
    });
  }
  try {
    const logs = readLogs();
    const nextId = logs.length > 0 ? logs.length : 1;
    const newLog = {
      id: nextId,
      username,
      type,
      timestamp: berlinTime,
      date: date,
      status: "work",
    };
    logs.push(newLog);
    writeLogs(logs);
    res.json({ message: "Log added successfully", log: newLog });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to log action due to a server error." });
  }
});

// Returns the logs of a specific user
app.get("/adminLogs", (req, res) => {
  fs.readFile(LOGS_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch logs." });
    }
    try {
      const logs = JSON.parse(data);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Invalid logs format." });
    }
  });
});

// Admin deletes users log
app.delete("/deleteLog/:id", (req, res) => {
  const { id } = req.params;
  const logs = readLogs();
  const filteredLogs = logs.filter((log) => log.id !== parseInt(id));
  if (logs.length === filteredLogs.length) {
    return res.status(404).json({ message: "Log not found" });
  }
  writeLogs(filteredLogs);
  res.json({ message: "Log deleted successfully" });
});

// PUT Route to update a specific log by its ID
app.put("/updateLog/:id", (req, res) => {
  const { id } = req.params;
  const updatedLog = req.body;
  try {
    const logs = readLogs();
    const users = JSON.parse(fs.readFileSync(USER_FILE, "utf8"));
    const index = logs.findIndex((log) => log.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ message: "Log not found" });
    }
    const user = users.find((u) => u.username === updatedLog.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (updatedLog.status) {
      if (updatedLog.status === "holiday" && user.holiday <= 0) {
        return res.status(400).json({ message: "No holiday days left" });
      }
      if (updatedLog.status === "sick-day" && user.sickDays <= 0) {
        return res.status(400).json({ message: "No sick days left" });
      }
      if (logs[index].status !== updatedLog.status) {
        if (updatedLog.status === "holiday") {
          user.holiday -= 1;
        }
        if (updatedLog.status === "sick-day") {
          user.sickDays -= 1;
        }
        fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));
      }
    }
    logs[index] = { ...logs[index], ...updatedLog };
    writeLogs(logs);
    res.json(logs[index]);
  } catch (error) {
    res.status(500).json({ message: "Server error. Could not update log." });
  }
});

//Get users check-out or check-in
app.get("/getUserType/:id/:username/:type", (req, res) => {
  const { id, username, type } = req.params;
  try {
    const logs = readLogs();
    const userLogs = logs.filter((log) => log.username === username);
    const checkIns = userLogs.filter((log) => log.type === "check-in");
    const checkOuts = userLogs.filter((log) => log.type === "check-out");
    let result;
    if (type === "check-out") {
      const unmatchedCheckIns = checkIns.filter(
        (checkIn) =>
          checkIn.id < parseInt(id) &&
          !checkOuts.some(
            (checkOut) => checkOut.id > checkIn.id && checkOut.id < parseInt(id)
          )
      );

      if (unmatchedCheckIns.length === 0) {
        return res.json({
          username: "",
          type: "",
          timestamp: "",
          date: "",
        });
      }
      result = unmatchedCheckIns[unmatchedCheckIns.length - 1];
    } else if (type === "check-in") {
      const unmatchedCheckOuts = checkOuts.filter(
        (checkOut) =>
          checkOut.id > parseInt(id) &&
          !checkIns.some(
            (checkIn) => checkIn.id < checkOut.id && checkIn.id > parseInt(id)
          )
      );
      if (unmatchedCheckOuts.length === 0) {
        return res.json({
          username: "",
          type: "",
          timestamp: "",
          date: "",
        });
      }
      result = unmatchedCheckOuts[0];
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve logs." });
  }
});

//Adds new log
app.post("/AddLog", (req, res) => {
  const { username, type, timestamp, date, status } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(USER_FILE, "utf8"));
    const logs = readLogs();
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (status === "holiday" || status === "sick day") {
      if (status === "holiday") {
        if (user.holiday <= 0) {
          console.log(`You don't have remaining holiday days.`);
          return res
            .status(400)
            .json({ message: "No holiday days remaining." });
        }
        user.holiday -= 1;
      }
      if (status === "sick day") {
        if (user.sickDays <= 0) {
          console.log(`You don't have remaining sick days.`);
          return res.status(400).json({ message: "No sick days remaining." });
        }
        user.sickDays -= 1;
      }
      fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));
      console.log(`Updated user data for ${username}:`, user);
    }
    const nextId = logs.length > 0 ? logs[logs.length - 1].id + 1 : 1;
    const newLog = {
      id: nextId,
      username,
      type,
      timestamp,
      date,
      status,
    };
    logs.push(newLog);
    writeLogs(logs);
    res.json(newLog);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to log action due to a server error." });
  }
});

// Returns all the users that includes the char in there username
app.get("/userByChar/:char", (req, res) => {
  fs.readFile(LOGS_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch logs." });
    }
    try {
      const logs = JSON.parse(data);
      const array = logs.filter((log) =>
        log.username.includes(req.params.char)
      );
      res.json(array);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to log action due to a server error." });
    }
  });
});

//Return hours by months
app.get("/getHoursByMonths/:user/:month1/:month2", (req, res) => {
  const { user, month1, month2 } = req.params;
  fs.readFile(LOGS_FILE, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch logs." });
    }
    try {
      const logs = JSON.parse(data);
      const month1Num = parseInt(month1, 10);
      const month2Num = parseInt(month2, 10);
      const startMonth = Math.min(month1Num, month2Num);
      const endMonth = Math.max(month1Num, month2Num);
      const filteredLogs = logs.filter((log) => {
        const [day, logMonth, logYear] = log.date.split("-").map(Number);
        return (
          log.username === user &&
          logYear === 2024 &&
          logMonth >= startMonth &&
          logMonth <= endMonth
        );
      });
      const pairedLogs = [];
      let checkOutLogs = filteredLogs.filter((log) => log.type === "check-out");
      filteredLogs
        .filter((log) => log.type === "check-in")
        .forEach((checkIn) => {
          const checkOutIndex = checkOutLogs.findIndex(
            (checkOut) => checkOut.date === checkIn.date
          );
          if (checkOutIndex !== -1) {
            pairedLogs.push({
              checkIn,
              checkOut: checkOutLogs[checkOutIndex],
            });
            checkOutLogs.splice(checkOutIndex, 1);
          }
        });
      let totalHours = 0;
      pairedLogs.forEach(({ checkIn, checkOut }) => {
        const checkInTime = dayjs(
          `${checkIn.date} ${checkIn.timestamp}`,
          "DD-MM-YYYY HH:mm:ss"
        );
        const checkOutTime = dayjs(
          `${checkOut.date} ${checkOut.timestamp}`,
          "DD-MM-YYYY HH:mm:ss"
        );
        if (checkInTime.isValid() && checkOutTime.isValid()) {
          const duration = checkOutTime.diff(checkInTime, "hours", true);
          totalHours += duration;
        }
      });
      res.json({ totalHours: totalHours.toFixed(2) });
    } catch (error) {
      res.status(500).json({ message: "Server error processing logs." });
    }
  });
});

// Returns users mounthly log
app.get("/monthlyLog/:user/:month", (req, res) => {
  const { user, month } = req.params;
  fs.readFile(LOGS_FILE, "utf-8", (err, data) => {
    if (err) {
      console.error("Failed to read logs file:", err);
      return res.status(500).json({ message: "Failed to fetch logs." });
    }
    try {
      const logs = JSON.parse(data);
      const monthNum = parseInt(month, 10);
      const monthlyLogs = logs.filter((log) => {
        const [day, logMonth, year] = log.date.split("-").map(Number);
        return log.username === user && logMonth === monthNum;
      });
      return res.json(monthlyLogs);
    } catch (error) {
      return res.status(500).json({ message: "Server error processing logs." });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
