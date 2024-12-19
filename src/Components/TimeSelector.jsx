import { useState } from "react";
import Button from "@mui/material/Button";
import close from "../assets/close.png";

const TimeSelector = ({ onTimeSelect, initialTime, closeTimeSelector }) => {
  const [hour, setHour] = useState(() =>
    initialTime ? initialTime.split(":")[0] : "12"
  );
  const [minute, setMinute] = useState(() =>
    initialTime ? initialTime.split(":")[1] : "00"
  );

  const handleSaveTime = () => {
    const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(
      2,
      "0"
    )}:00`;
    onTimeSelect(formattedTime);
  };

  const incrementHour = () => {
    setHour((prev) => {
      const newHour = (parseInt(prev, 10) + 1) % 24;
      return String(newHour).padStart(2, "0");
    });
  };

  const decrementHour = () => {
    setHour((prev) => {
      const newHour = (parseInt(prev, 10) - 1 + 24) % 24;
      return String(newHour).padStart(2, "0");
    });
  };

  const incrementMinute = () => {
    setMinute((prev) => {
      const newMinute = (parseInt(prev, 10) + 1) % 60;
      return String(newMinute).padStart(2, "0");
    });
  };

  const decrementMinute = () => {
    setMinute((prev) => {
      const newMinute = (parseInt(prev, 10) - 1 + 60) % 60;
      return String(newMinute).padStart(2, "0");
    });
  };

  return (
    <div className="time-selector-wrapper">
      <button
        className="bttnCloseTimeSelector"
        onClick={() => closeTimeSelector(false)}
      >
        <img src={close} alt="close" />
      </button>
      <div className="time-row">
        <div className="dial">
          <button onClick={incrementHour}>▲</button>
          <div className="timeInClock">{hour.padStart(2, "0")}</div>
          <button onClick={decrementHour}>▼</button>
        </div>
        <div className="dial">
          <button onClick={incrementMinute}>▲</button>
          <div className="timeInClock">{minute.padStart(2, "0")}</div>
          <button onClick={decrementMinute}>▼</button>
        </div>
      </div>
      <div className="button-row">
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveTime}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default TimeSelector;
