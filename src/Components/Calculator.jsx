import React, { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import close from "../assets/close.png";

export default function Calculator({ closeCalc }) {
  const months = [
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
  ];

  const [fromMonth, setFromMonth] = useState(1);
  const [untilMonth, setUntilMonth] = useState(1);
  const [hours, setHours] = useState(0);
  const [salary, setSalary] = useState("");
  const [total, setTotal] = useState(null);
  const [error, setError] = useState("");
  const { user } = useUser();

  useEffect(() => {
    if (fromMonth <= untilMonth) {
      setError("");
      fetch(
        `http://localhost:3001/getHoursByMonths/${user.username}/${fromMonth}/${untilMonth}`
      )
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch data");
          return response.json();
        })
        .then((data) => setHours(parseFloat(data.totalHours).toFixed(2)))
        .catch(() => {
          setHours(0);
          setError("Error fetching hours. Please try again.");
        });
    } else {
      setHours(0);
      setError("The 'Until' month must be after the 'From' month.");
    }
  }, [fromMonth, untilMonth, user]);

  const handleCalculate = () => {
    if (!salary || isNaN(salary) || parseFloat(salary) <= 0) {
      setError("Please enter a valid salary greater than 0.");
      setTotal(null);
      return;
    }
    setError("");
    setTotal((hours * parseFloat(salary)).toFixed(2));
  };

  return (
    <div className="calculator-div">
      <button
        className="bttnCloseModal"
        onClick={() => {
          closeCalc(false);
        }}
      >
        <img src={close} alt="close" />
      </button>
      <h1 className="title">Salary Calculator</h1>

      <div className="div-calc">
        <span>From</span>
        <select
          value={fromMonth}
          onChange={(e) => setFromMonth(Number(e.target.value))}
        >
          {months.map((month, index) => (
            <option key={index} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div className="div-calc">
        <span>Until</span>
        <select
          value={untilMonth}
          onChange={(e) => setUntilMonth(Number(e.target.value))}
        >
          {months.map((month, index) => (
            <option key={index} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <p className="hours-text">Total hours worked: {hours} hours</p>
      <div className="salary-input">
        <span>Salary per hour:</span>
        <input
          type="text"
          value={salary}
          placeholder="Enter salary"
          onChange={(e) => setSalary(e.target.value)}
        />
        <span>€</span>
      </div>
      {error && <p className="error">{error}</p>}
      {total && !error && <p className="total">Total Earnings: {total} €</p>}
      <button
        className="calculate-btn"
        onClick={handleCalculate}
        disabled={fromMonth > untilMonth}
      >
        Calculate
      </button>
    </div>
  );
}
