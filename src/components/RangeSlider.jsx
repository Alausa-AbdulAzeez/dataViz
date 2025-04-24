import React, { useState, useEffect, useRef } from "react";

const RangeSlider = ({
  min,
  max,
  step = 1,
  defaultValue,
  showLabels = true,
  thresholds = [],
  slideStyle = "bg-blue-500 h-2",
  trackStyle = "bg-gray-300 h-2",
  thumbStyle = "bg-blue-700 border-2 border-white",
  labelFormat = (value) => value,
  showCurrentValue = true,
  currentValuePosition = "above",
  height = "6px",
  thumbSize = "20px",
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue || min);
  const [dragging, setDragging] = useState(false);
  const rangeRef = useRef(null);

  useEffect(() => {
    setValue(defaultValue || min);
  }, [defaultValue, min]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging || !rangeRef.current) return;

      const rect = rangeRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const rawValue = min + percentage * (max - min);

      // Snap to steps
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      setValue(clampedValue);

      if (onChange) {
        onChange(clampedValue);
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, min, max, step, onChange]);

  const handleTrackClick = (e) => {
    if (!rangeRef.current) return;

    const rect = rangeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const rawValue = min + percentage * (max - min);

    // Snap to steps
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    setValue(clampedValue);

    if (onChange) {
      onChange(clampedValue);
    }
  };

  const handleThumbMouseDown = (e) => {
    e.stopPropagation();
    setDragging(true);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="relative" ref={rangeRef}>
        {/* Thresholds */}
        {thresholds.map((threshold, index) => {
          const thresholdPercentage =
            ((threshold.value - min) / (max - min)) * 100;
          return (
            <div
              key={index}
              className="absolute w-1 bg-gray-400 top-0 bottom-0 z-10"
              style={{
                left: `${thresholdPercentage}%`,
                height: height,
                transform: "translateX(-50%)",
              }}
              title={threshold.label || `${threshold.value}`}
            />
          );
        })}

        {/* Track */}
        <div
          className={`w-full rounded-full ${trackStyle}`}
          style={{ height }}
          onClick={handleTrackClick}
        >
          {/* Filled area */}
          <div
            className={`absolute left-0 top-0 rounded-full ${slideStyle}`}
            style={{
              width: `${percentage}%`,
              height,
            }}
          />
        </div>

        {/* Thumb */}
        <div
          className={`absolute rounded-full cursor-pointer ${thumbStyle}`}
          style={{
            left: `${percentage}%`,
            top: "50%",
            width: thumbSize,
            height: thumbSize,
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={handleThumbMouseDown}
        />

        {/* Current value */}
        {showCurrentValue && (
          <div
            className="absolute text-xs font-semibold"
            style={{
              left: `${percentage}%`,
              transform: "translateX(-50%)",
              ...(currentValuePosition === "above"
                ? { bottom: "calc(100% + 8px)" }
                : { top: "calc(100% + 8px)" }),
            }}
          >
            {labelFormat(value)}
          </div>
        )}
      </div>

      {/* Min/Max labels */}
      {showLabels && (
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{labelFormat(min)}</span>
          <span>{labelFormat(max)}</span>
        </div>
      )}
    </div>
  );
};

export default RangeSlider;
