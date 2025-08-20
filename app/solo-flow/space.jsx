"use client";

import React, { useEffect, useState } from "react";


// The necessary CSS from the original file is included here as a string.
// In a real React project, this would typically be in a separate CSS file.
const styles = `
    /* Custom style for the radio button itself */
    .custom-radio {
        -webkit-appearance: none;
        appearance: none;
        background-color: #374151; /* bg-gray-700 */
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid #4b5563; /* border-gray-600 */
        border-radius: 50%;
        display: grid;
        place-content: center;
        transition: background-color 0.2s, border-color 0.2s;
    }
    .custom-radio::before {
        content: "";
        width: 0.65rem;
        height: 0.65rem;
        border-radius: 50%;
        transform: scale(0);
        transition: 120ms transform ease-in-out;
        background-color: #f97316; /* orange-500 */
    }
    .custom-radio:checked::before {
        transform: scale(1);
    }
    .custom-radio:checked {
        border-color: #f97316; /* orange-500 */
    }
    /* Style for the container of each radio option */
    .radio-option-container {
        transition: background-color 0.2s;
    }
    .radio-option-container:hover {
        background-color: #1f2937; /* bg-gray-800 */
    }
`;

// This is a single radio button option component for better reusability.
const RadioOption = ({ id, name, value, label, checked, onChange }) => {
  return (
    <div className="radio-option-container bg-gray-900 border border-gray-700 rounded-lg">
      <label
        htmlFor={id}
        className="flex items-center justify-between w-full p-4 cursor-pointer"
      >
        <span className="text-gray-200 font-medium">{label}</span>
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          className="custom-radio"
          checked={checked}
          onChange={onChange}
        />
      </label>
    </div>
  );
};

// This is the main component that holds the state and logic.
const MoodSelector = ({ currentSpace, handleSpaceChange }) => {
  // Use the 'useState' hook to manage the selected value.
  // The initial state is set to 'normal'.
  const [selectedValue, setSelectedValue] = useState(currentSpace);

  // This function is called whenever a radio button is changed.
  const handleRadioChange = (event) => {
    const newSpace = event.target.value;
    // It updates the state to the value of the selected radio button.
    setSelectedValue(newSpace);
    handleSpaceChange(newSpace);
  };

  const options = [
    { id: "mood-focus", value: "Project", label: "Project Day" },
    { id: "mood-normal", value: "Personal", label: "Personal Day" },
    { id: "mood-overwhelmed", value: "Work", label: "Work Day" },
  ];

  return (
    <div className="max-w-md w-full p-4">
      {/* Radio Button Group */}
      <fieldset>
        <legend className="text-lg font-semibold text-white mb-4">
          What kind of day is this?
        </legend>
        <div className="space-y-3">
          {options.map((option) => (
            <RadioOption
              key={option.id}
              id={option.id}
              name="mood"
              value={option.value}
              label={option.label}
              checked={selectedValue === option.value}
              onChange={handleRadioChange}
            />
          ))}
        </div>
      </fieldset>
      {/* End Radio Button Group */}
    </div>
  );
};

export default function Spaces({ currentSpace, handleSpaceChange }) {
  return (
    <>
      {/* Inject the styles into the document head */}
      <style>{styles}</style>
      <div className="antialiased flex items-start justify-start  min-h-screen">
        <MoodSelector
          currentSpace={currentSpace}
          handleSpaceChange={handleSpaceChange}
        />
      </div>
    </>
  );
}
