import { useState, useEffect } from "react";

const Range = ({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  thresholds = [20, 40, 60, 80],
  slideStyle = "bg-blue-600",
  trackStyle = "bg-gray-200",
  thumbStyle = "bg-blue-600 shadow-lg",
  showLabels = true,
  labelFormat = (value) => value,
  onChange = null,
  height = "18px",
  thumbSize = "34px",
  disabled = false,
  showThresholdMarkers = true,
  thresholdMarkerStyle = "bg-gray-400 w-1 absolute h-full",
  className = "",
  thumbClassName = "",
  labelClassName = "text-xs",
  showMinMaxLabels = true,
  showCurrentValue = false,
  currentValuePosition = "above", // "above" or "below"
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    // Update value if defaultValue changes
    setValue(defaultValue);
  }, [defaultValue]);

  // Calculate percentage for slider progress
  const calculatePercentage = (val) => {
    return ((val - min) / (max - min)) * 100 - 1;
  };

  // Calculate position for threshold values
  const getThresholdPosition = (threshold) => {
    return `${calculatePercentage(threshold)}%`;
  };

  // Handle value change
  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // Current value display position
  const currentValueStyle = {
    left: `${calculatePercentage(value)}%`,
    transform: "translateX(-50%)",
  };

  return (
    <div className={`w-full  ${className} relative`}>
      {/* Current Value Display - Above */}
      {showCurrentValue && currentValuePosition === "above" && (
        <div className="absolute -top-10 text-center" style={currentValueStyle}>
          <span className="px-2 py-1 bg-white rounded shadow text-sm font-medium">
            {labelFormat(value)}
          </span>
        </div>
      )}

      {/* Slider Container */}
      <div className="relative">
        {/* Custom Track */}
        <div
          className={`w-full bg-black h-1 rounded-full ${trackStyle}`}
          style={{ height }}
        >
          <div
            className={`h-full rounded-full ${slideStyle}`}
            style={{ width: `${calculatePercentage(value)}%` }}
          />

          {/* Threshold Markers */}
          {showThresholdMarkers &&
            thresholds.map((threshold, index) => (
              <div
                key={index}
                className={thresholdMarkerStyle}
                style={{ left: getThresholdPosition(threshold) }}
              />
            ))}
        </div>

        {/* Custom Thumb */}
        <div
          className={`${thumbStyle} absolute top-1/2 rounded-full ${thumbClassName}`}
          style={{
            left: `${calculatePercentage(value)}%`,
            transform: "translate(-50%, -50%)",
            width: thumbSize,
            height: thumbSize,
            opacity: disabled ? 0.5 : 1,
          }}
        />

        {/* Hidden Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="absolute top-0 w-full h-full opacity-0 cursor-pointer"
          style={{ height }}
        />
      </div>

      {/* Current Value Display - Below */}
      {showCurrentValue && currentValuePosition === "below" && (
        <div className="absolute mt-2" style={currentValueStyle}>
          <span className="px-2 py-1 bg-white rounded shadow text-sm font-medium">
            {labelFormat(value)}
          </span>
        </div>
      )}

      {/* Threshold Values */}
      {showLabels && (
        <div className="relative mt-4 w-full">
          <div className={`flex justify-between ${labelClassName}`}>
            {showMinMaxLabels && <span>{labelFormat(min)}</span>}

            {thresholds.map((threshold, index) => (
              <span
                key={index}
                className="absolute transform -translate-x-1/2"
                style={{ left: getThresholdPosition(threshold) }}
              >
                {labelFormat(threshold)}
              </span>
            ))}

            {showMinMaxLabels && <span>{labelFormat(max)}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Range;
