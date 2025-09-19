import { Settings } from "../core/entities";

interface SpacesProps {
  currentSpace: Settings['space'];
  handleSpaceChange: (space: Settings['space']) => void;
}

export const Spaces: React.FC<SpacesProps> = ({ currentSpace, handleSpaceChange }) => {
  const options = [
    { id: "space-work", value: "Work", label: "Work Day" },
    { id: "space-personal", value: "Personal", label: "Personal Day" },
    { id: "space-project", value: "Project", label: "Project Day" },
  ];
  return (
    <div className="max-w-md w-full p-4">
      <fieldset>
        <legend className="text-lg font-semibold text-white mb-4">
          Select Your Current Space
        </legend>
        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.id}
              htmlFor={option.id}
              className="flex items-center justify-between w-full p-4 cursor-pointer bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800"
            >
              <span className="text-gray-200 font-medium">{option.label}</span>
              <input
                type="radio"
                id={option.id}
                name="space"
                value={option.value}
                checked={currentSpace === option.value}
                onChange={(e) => handleSpaceChange(e.target.value as Settings['space'])}
                className="form-radio h-5 w-5 text-orange-600 bg-gray-700 border-gray-600 focus:ring-orange-500"
              />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};
