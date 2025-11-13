"use client";

import * as React from "react";
import { format, isValid, addMonths, startOfMonth } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerWithRangeProps {
  departureDate: Date | null;
  returnDate: Date | null;
  className?: string;
  getDateValue: ({ from, to }: { from: Date | null; to: Date | null }) => void;
  twoWay?: boolean;
}

export default function FlightDatePicker({
  departureDate,
  returnDate,
  className,
  getDateValue,
  twoWay,
}: DatePickerWithRangeProps) {
  const isValidDate = (date: Date | null): date is Date => {
    if (!date) return false;
    if (!(date instanceof Date)) return false;
    return isValid(date);
  };

  const [isOpen, setIsOpen] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState(() => {
    try {
      const now = new Date();
      return isValidDate(now) ? now : new Date(2024, 0, 1); // fallback to Jan 1, 2024
    } catch (error) {
      console.error("Error creating initial date:", error);
      return new Date(2024, 0, 1); // fallback
    }
  });

  const [selectedStart, setSelectedStart] = React.useState<Date | null>(
    isValidDate(departureDate) ? departureDate : null
  );
  const [selectedEnd, setSelectedEnd] = React.useState<Date | null>(
    isValidDate(returnDate) ? returnDate : null
  );
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState<
    "bottom" | "top"
  >("bottom");
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>(
    {}
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Validate and create safe copies of prop dates
    let safeDepartureDate: Date | null = null;
    let safeReturnDate: Date | null = null;

    if (departureDate && isValidDate(departureDate)) {
      try {
        const timeValue = departureDate.getTime();
        if (!isNaN(timeValue) && isFinite(timeValue)) {
          const newDate = new Date(timeValue);
          if (isValidDate(newDate) && isValid(newDate)) {
            safeDepartureDate = newDate;
          }
        }
      } catch (error) {
        console.error("Error creating safe departure date:", error);
      }
    }

    if (returnDate && isValidDate(returnDate)) {
      try {
        const timeValue = returnDate.getTime();
        if (!isNaN(timeValue) && isFinite(timeValue)) {
          const newDate = new Date(timeValue);
          if (isValidDate(newDate) && isValid(newDate)) {
            safeReturnDate = newDate;
          }
        }
      } catch (error) {
        console.error("Error creating safe return date:", error);
      }
    }

    setSelectedStart(safeDepartureDate);
    setSelectedEnd(safeReturnDate);
    setHoverDate(null); // Reset hover state when props change
  }, [departureDate, returnDate]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoverDate(null); // Reset hover state when closing
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const calculateDropdownPosition = React.useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 400; // Approximate calendar height
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Use 'top' if insufficient space below and enough space above
    const position =
      spaceBelow < dropdownHeight && spaceAbove > dropdownHeight
        ? "top"
        : "bottom";

    setDropdownPosition(position);

    // Calculate the actual position
    setDropdownStyle({
      zIndex: 9999,
      left: triggerRect.left,
      top:
        position === "bottom"
          ? triggerRect.bottom + 8
          : triggerRect.top - dropdownHeight - 8,
    });
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();

      const handleResize = () => calculateDropdownPosition();
      const handleScroll = () => calculateDropdownPosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isOpen, calculateDropdownPosition]);

  const monthNames = React.useMemo(
    () => [
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
    ],
    []
  );

  const dayNames = React.useMemo(
    () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    []
  );

  const createSafeDate = React.useMemo(
    () =>
      (year: number, month: number, day: number): Date | null => {
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
        if (year < 1900 || year > 2100) return null;
        if (month < 0 || month > 11) return null;
        if (day < 1 || day > 31) return null;

        const date = new Date(year, month, day);
        return isValidDate(date) ? date : null;
      },
    []
  );

  const getDaysInMonth = React.useMemo(
    () => (date: Date) => {
      if (!isValidDate(date)) return [];

      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDay = createSafeDate(year, month, 1);
      if (!firstDay) return [];

      // Get the number of days in the month by creating date for next month's day 0
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startingDayOfWeek = firstDay.getDay();
      const days = [];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }

      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = createSafeDate(year, month, day);
        if (dayDate) {
          days.push(dayDate);
        }
      }

      return days;
    },
    [createSafeDate]
  );

  const isDateDisabled = React.useCallback((date: Date | null) => {
    if (!date || !isValidDate(date)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, []);

  const isDateInRange = React.useCallback(
    (date: Date | null) => {
      if (
        !date ||
        !isValidDate(date) ||
        !selectedStart ||
        !isValidDate(selectedStart)
      )
        return false;
      if (twoWay && selectedEnd && isValidDate(selectedEnd)) {
        return date >= selectedStart && date <= selectedEnd;
      }
      if (
        twoWay &&
        hoverDate &&
        isValidDate(hoverDate) &&
        selectedStart &&
        !selectedEnd
      ) {
        const start = selectedStart;
        const end = hoverDate > selectedStart ? hoverDate : selectedStart;
        const rangeStart =
          hoverDate > selectedStart ? selectedStart : hoverDate;
        return date >= rangeStart && date <= end;
      }
      return false;
    },
    [selectedStart, selectedEnd, hoverDate, twoWay]
  );

  const isDateSelected = React.useCallback(
    (date: Date | null) => {
      if (!date || !isValidDate(date)) return false;
      if (
        selectedStart &&
        isValidDate(selectedStart) &&
        date.getTime() === selectedStart.getTime()
      )
        return true;
      if (
        selectedEnd &&
        isValidDate(selectedEnd) &&
        date.getTime() === selectedEnd.getTime()
      )
        return true;
      return false;
    },
    [selectedStart, selectedEnd]
  );

  const isDateToday = React.useCallback((date: Date | null) => {
    if (!date || !isValidDate(date)) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const handleDateClick = React.useCallback(
    (date: Date) => {
      if (isDateDisabled(date) || !isValidDate(date) || !isValid(date)) return;

      // Create safe copies of dates to avoid mutation issues
      let safeDate: Date;
      try {
        const timeValue = date.getTime();
        if (isNaN(timeValue) || !isFinite(timeValue)) {
          console.error("Invalid time value:", timeValue, "from date:", date);
          return;
        }
        safeDate = new Date(timeValue);
        if (!isValidDate(safeDate) || !isValid(safeDate)) {
          console.error("Invalid date created:", date, safeDate);
          return;
        }
      } catch (error) {
        console.error("Error creating safe date:", error, "from date:", date);
        return;
      }

      if (!twoWay) {
        setSelectedStart(safeDate);
        setSelectedEnd(null);
        getDateValue({ from: safeDate, to: null });
        setTimeout(() => setIsOpen(false), 300);
        return;
      }

      if (!selectedStart || (selectedStart && selectedEnd)) {
        setSelectedStart(safeDate);
        setSelectedEnd(null);
        setIsSelecting(true);
      } else if (
        selectedStart &&
        !selectedEnd &&
        isValidDate(selectedStart) &&
        isValid(selectedStart)
      ) {
        let safeSelectedStart: Date;
        try {
          const timeValue = selectedStart.getTime();
          if (isNaN(timeValue) || !isFinite(timeValue)) {
            console.error(
              "Invalid selectedStart time value:",
              timeValue,
              "from date:",
              selectedStart
            );
            return;
          }
          safeSelectedStart = new Date(timeValue);
          if (!isValidDate(safeSelectedStart) || !isValid(safeSelectedStart)) {
            console.error("Invalid selectedStart:", selectedStart);
            return;
          }
        } catch (error) {
          console.error(
            "Error creating safe selectedStart:",
            error,
            "from date:",
            selectedStart
          );
          return;
        }

        if (safeDate >= safeSelectedStart) {
          setSelectedEnd(safeDate);
          getDateValue({ from: safeSelectedStart, to: safeDate });
        } else {
          setSelectedStart(safeDate);
          setSelectedEnd(safeSelectedStart);
          getDateValue({ from: safeDate, to: safeSelectedStart });
        }
        setIsSelecting(false);
        setTimeout(() => setIsOpen(false), 500);
      }
    },
    [isDateDisabled, twoWay, selectedStart, selectedEnd, getDateValue]
  );

  const navigateMonth = React.useCallback((direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      if (!isValidDate(prev)) {
        console.warn(
          "Invalid currentDate in navigateMonth, resetting to today"
        );
        return new Date();
      }

      try {
        // Additional validation before date-fns operations
        const timeValue = prev.getTime();
        if (isNaN(timeValue) || !isFinite(timeValue)) {
          console.warn("Invalid time value in navigateMonth:", timeValue);
          return new Date();
        }

        if (!isValid(prev)) {
          console.warn("date-fns validation failed in navigateMonth");
          return new Date();
        }

        const monthsToAdd = direction === "prev" ? -1 : 1;
        const startOfCurrentMonth = startOfMonth(prev);

        // Validate startOfMonth result
        if (
          !isValidDate(startOfCurrentMonth) ||
          !isValid(startOfCurrentMonth)
        ) {
          console.warn("startOfMonth produced invalid date");
          return new Date();
        }

        const newDate = addMonths(startOfCurrentMonth, monthsToAdd);

        // Validate final result
        if (!isValidDate(newDate) || !isValid(newDate)) {
          console.warn("addMonths produced invalid date");
          return prev; // Return previous valid date as fallback
        }

        return newDate;
      } catch (error) {
        console.error("Error navigating month:", error);
        // Return a safe fallback instead of potentially invalid prev
        return new Date();
      }
    });
  }, []);

  const formatDisplayValue = React.useCallback(() => {
    try {
      if (
        selectedStart &&
        selectedEnd &&
        twoWay &&
        isValidDate(selectedStart) &&
        isValidDate(selectedEnd)
      ) {
        // Double-check with date-fns isValid before formatting
        if (isValid(selectedStart) && isValid(selectedEnd)) {
          const startFormatted = format(selectedStart, "MMM dd, yy");
          const endFormatted = format(selectedEnd, "MMM dd, yy");
          return `${startFormatted} - ${endFormatted}`;
        }
      } else if (
        selectedStart &&
        isValidDate(selectedStart) &&
        isValid(selectedStart)
      ) {
        return format(selectedStart, "MMM dd, yyyy");
      }
    } catch (error) {
      console.error("Date formatting error in formatDisplayValue:", error);
      return "";
    }
    return "";
  }, [selectedStart, selectedEnd, twoWay]);

  const renderCalendar = React.useCallback(
    (date: Date) => {
      if (!isValidDate(date)) {
        return (
          <div className="p-6 text-center text-red-500">
            Error loading calendar
          </div>
        );
      }

      const days = getDaysInMonth(date);

      return (
        <div className="w-full p-6 border">
          <div className="flex justify-center items-center mb-4 relative">
            <h3 className="text-sm font-semibold text-gray-900">
              {monthNames[date.getMonth()]} {date.getFullYear()}
            </h3>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-10 w-10 flex items-center justify-center text-xs font-medium text-gray-700"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0 text-gray-500">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-10 w-10" />;
              }

              const isDisabled = isDateDisabled(day);
              const isSelected = isDateSelected(day);
              const isInRange = isDateInRange(day);
              const isToday = isDateToday(day);
              const isStart =
                selectedStart &&
                isValidDate(selectedStart) &&
                isValidDate(day) &&
                day.getTime() === selectedStart.getTime();
              const isEnd =
                selectedEnd &&
                isValidDate(selectedEnd) &&
                isValidDate(day) &&
                day.getTime() === selectedEnd.getTime();

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() =>
                    twoWay && selectedStart && !selectedEnd && setHoverDate(day)
                  }
                  onMouseLeave={() => setHoverDate(null)}
                  disabled={isDisabled}
                  className={cn(
                    "h-10 w-10 text-xs font-normal flex items-center justify-center transition-colors relative",
                    "hover:bg-gray-100 hover:text-gray-500",
                    {
                      "text-blue-400 opacity-50 cursor-not-allowed": isDisabled,
                      "bg-gray-900 text-gray-100 hover:bg-gray-300 hover:text-gray-600 rounded-none":
                        isSelected,
                      "bg-gray-200 text-gray-400": isInRange && !isSelected,
                      "bg-gray-100 text-gray-400 font-semibold rounded-none":
                        isToday && !isSelected,
                      "rounded-l-md": isStart && twoWay,
                      "rounded-r-md": isEnd && twoWay,
                      "rounded-md": !twoWay || (!isInRange && !isSelected),
                    }
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      );
    },
    [
      getDaysInMonth,
      isDateDisabled,
      isDateSelected,
      isDateInRange,
      isDateToday,
      handleDateClick,
      selectedStart,
      selectedEnd,
      twoWay,
      setHoverDate,
      dayNames,
      monthNames,
    ]
  );

  return (
    <div ref={containerRef} className={cn("w-full relative", className)}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={0}
        className="w-full h-[57px] px-3 py-3 border border-gray-500/40 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 transition-colors rounded-none"
      >
        <div className="flex items-center justify-between h-full relative">
          <div className="flex-1 w-[80%]">
            {formatDisplayValue() ? (
              <span className="text-sm text-gray-900 truncate font-medium">
                {formatDisplayValue()}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Pick a date</span>
            )}
          </div>
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </div>
        {/* {(isFocused || formatDisplayValue()) && (
          <div className="absolute -top-2 left-3 px-1 text-xs bg-[color-to-match-parent]">
            {twoWay ? "Departure and Return" : "Departure"}
          </div>
        )} */}
      </div>

      {isOpen && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-[320px] max-h-96 overflow-visible"
          style={dropdownStyle}
        >
          <div className="relative">
            <button
              onClick={() => navigateMonth("prev")}
              className="absolute left-2 top-6 z-10 h-8 w-8 border text-gray-400 border-gray-400 bg-white hover:bg-gray-50 flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="absolute right-2 top-6 z-10 h-8 w-8 border text-gray-400 border-gray-400 bg-white hover:bg-gray-50 flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {renderCalendar(currentDate)}
          </div>
        </div>
      )}
    </div>
  );
}
