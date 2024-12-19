// import React, { useState } from "react";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import Button from "@mui/material/Button";
// import close from "../assets/close.png";

// const CalendarSelector = ({ onDateSelect, onClose, minDate }) => {
//   const [selectedDate, setSelectedDate] = useState(minDate || dayjs());

//   const handleSaveDate = () => {
//     const formattedDate = selectedDate.format("DD-MM-YYYY");
//     onDateSelect(formattedDate);
//     onClose(false);
//   };

//   return (
//     <div className="calendar">
//       <button className="bttnCloseCalendar" onClick={() => onClose(false)}>
//         <img
//           src={close}
//           alt="close"
//           style={{ width: "20px", height: "20px" }}
//         />
//       </button>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <DateCalendar
//           value={selectedDate}
//           onChange={(newValue) => setSelectedDate(newValue)}
//           minDate={minDate || dayjs()} // Prevent earlier dates
//         />
//       </LocalizationProvider>
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleSaveDate}
//         style={{ marginTop: "10px" }}
//       >
//         Save
//       </Button>
//     </div>
//   );
// };

// export default CalendarSelector;

import React, { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Button from "@mui/material/Button";
import close from "../assets/close.png";

const CalendarSelector = ({ onDateSelect, onClose, minDate }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Adjust selected date if minDate changes
  useEffect(() => {
    if (minDate && selectedDate.isBefore(minDate)) {
      setSelectedDate(minDate);
    }
  }, [minDate]);

  const handleSaveDate = () => {
    const formattedDate = selectedDate.format("DD-MM-YYYY");
    onDateSelect(formattedDate);
    onClose(false);
  };

  return (
    <div className="calendar">
      <button className="bttnCloseCalendar" onClick={() => onClose(false)}>
        <img
          src={close}
          alt="close"
          style={{ width: "20px", height: "20px" }}
        />
      </button>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          minDate={minDate || null} 
        />
      </LocalizationProvider>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveDate}
        style={{ marginTop: "10px" }}
      >
        Save
      </Button>
    </div>
  );
};

export default CalendarSelector;
