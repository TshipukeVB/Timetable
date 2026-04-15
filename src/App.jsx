import React, { useState, useEffect } from "react";

// 🔗 Replace with your Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyCWLQA8rZZTFHdVb7SyaRApU1XcGBvPGOfPa4Jy_fmcyX3yreqNNqqvqpGLwisVdDszA/exec";

const labs = [
  {
    name: "Lab 5",
    capacity: 74,
    schedule: {
      Wednesday: ["09:00-09:50"],
      Thursday: ["09:00-09:50", "10:00-10:50"],
      Friday: [
        "09:00-09:50",
        "10:00-10:50",
        "12:00-12:50",
        "14:00-14:50",
        "15:00-15:46",
        "15:50-16:40",
      ],
    },
  },
  {
    name: "Lab 6",
    capacity: 50,
    schedule: {
      Thursday: ["15:00-15:46", "15:50-16:40"],
      Friday: ["14:00-14:50", "15:00-15:46", "15:50-16:40"],
    },
  },
  {
    name: "Lab 7",
    capacity: 54,
    schedule: {
      Wednesday: ["09:00-09:50"],
      Thursday: ["09:00-09:50", "15:00-15:46", "15:50-16:40"],
      Friday: [
        "09:00-09:50",
        "12:00-12:50",
        "14:00-14:50",
        "15:00-15:46",
        "15:50-16:40",
      ],
    },
  },
  {
    name: "Lab 8",
    capacity: 64,
    schedule: {
      Thursday: ["14:00-14:50", "15:00-15:46", "15:50-16:40"],
      Friday: ["14:00-14:50", "15:00-15:46", "15:50-16:40"],
    },
  },
  {
    name: "Lab 9",
    capacity: 66,
    schedule: {
      Thursday: ["15:00-15:46", "15:50-16:40"],
      Friday: ["14:00-14:50", "15:00-15:46", "15:50-16:40"],
    },
  },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function App() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    fetch(SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => setCounts(data))
      .catch(() => console.log("Error loading counts"));
  }, []);

  const handleClick = (labName, day, time) => {
    setSelectedSlot(`${labName} - ${day} ${time}`);
    setSelectedDetails({ labName, day, time });
    setShowForm(true);
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      studentNumber,
      lab: selectedDetails.labName,
      day: selectedDetails.day,
      time: selectedDetails.time,
    };

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmitted(true);
      setName("");
      setStudentNumber("");

      const res = await fetch(SCRIPT_URL);
      const data = await res.json();
      setCounts(data);
    } catch (error) {
      alert("Error submitting data");
    }

    setLoading(false);
  };

  const getRemaining = (labName, day, time, capacity) => {
    const key = `${labName}_${day}_${time}`;
    const used = counts[key] || 0;
    return capacity - used;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        COM1321 Practical Timetable
      </h1>

      {selectedSlot && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-3 rounded mb-4 text-center">
          Selected Slot: {selectedSlot}
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow rounded p-4 mb-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-3 text-center">
            Enter Your Details
          </h2>

          {submitted ? (
            <div className="text-green-600 text-center font-medium">
              ✅ Saved to Google Sheets!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border p-2 mb-3 rounded"
              />

              <input
                type="text"
                placeholder="Student Number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                required
                className="w-full border p-2 mb-3 rounded"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      )}

      {labs.map((lab) => (
        <div key={lab.name} className="bg-white rounded-2xl shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {lab.name} (Capacity: {lab.capacity})
          </h2>

          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Day</th>
                <th className="border p-2">Time Slots</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="border p-2 font-medium">{day}</td>
                  <td className="border p-2">
                    {lab.schedule[day]?.length ? (
                      lab.schedule[day].map((time) => {
                        const remaining = getRemaining(
                          lab.name,
                          day,
                          time,
                          lab.capacity
                        );

                        return (
                          <button
                            key={time}
                            onClick={() => handleClick(lab.name, day, time)}
                            disabled={remaining <= 0}
                            className={`mr-2 mb-2 px-2 py-1 rounded text-white ${
                              remaining > 0
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {time} ({remaining} left)
                          </button>
                        );
                      })
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <footer className="text-center text-sm text-gray-500 mt-6">
        Connected to Google Sheets (Live Capacity)
      </footer>
    </div>
  );
}
