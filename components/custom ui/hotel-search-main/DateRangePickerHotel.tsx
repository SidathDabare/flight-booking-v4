"use client";

import * as React from "react";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface DateRangePickerHotelProps {
  checkInDate: Date | null;
  checkOutDate: Date | null;
  getDateValue: (dates: { checkIn: Date | null; checkOut: Date | null }) => void;
}

export default function DateRangePickerHotel({
  checkInDate,
  checkOutDate,
  getDateValue,
}: DateRangePickerHotelProps) {
  const t = useTranslations("hotelSearch");
  const [open, setOpen] = React.useState(false);
  const [internalCheckIn, setInternalCheckIn] = React.useState<Date | null>(checkInDate);
  const [internalCheckOut, setInternalCheckOut] = React.useState<Date | null>(checkOutDate);

  React.useEffect(() => {
    setInternalCheckIn(checkInDate);
    setInternalCheckOut(checkOutDate);
  }, [checkInDate, checkOutDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Reset time to midnight for consistent comparison
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (!internalCheckIn || (internalCheckIn && internalCheckOut)) {
      // First selection or reset
      setInternalCheckIn(selectedDate);
      setInternalCheckOut(null);
      getDateValue({ checkIn: selectedDate, checkOut: null });
    } else if (selectedDate > internalCheckIn) {
      // Second selection - check-out date
      const nights = differenceInDays(selectedDate, internalCheckIn);

      if (nights > 30) {
        // Maximum 30 nights
        const maxCheckOut = addDays(internalCheckIn, 30);
        setInternalCheckOut(maxCheckOut);
        getDateValue({ checkIn: internalCheckIn, checkOut: maxCheckOut });
      } else {
        setInternalCheckOut(selectedDate);
        getDateValue({ checkIn: internalCheckIn, checkOut: selectedDate });
      }

      // Close popover after both dates selected
      setTimeout(() => setOpen(false), 100);
    } else {
      // Selected date is before or same as check-in, reset
      setInternalCheckIn(selectedDate);
      setInternalCheckOut(null);
      getDateValue({ checkIn: selectedDate, checkOut: null });
    }
  };

  const formatDateRange = () => {
    if (internalCheckIn && internalCheckOut) {
      const nights = differenceInDays(internalCheckOut, internalCheckIn);
      return `${format(internalCheckIn, "MMM dd")} - ${format(internalCheckOut, "MMM dd")} (${nights} ${nights === 1 ? t("night") : t("nights")})`;
    } else if (internalCheckIn) {
      return `${format(internalCheckIn, "MMM dd, yyyy")} - ${t("selectCheckOut")}`;
    }
    return t("selectDates");
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = internalCheckIn ? addDays(internalCheckIn, 30) : addDays(today, 365);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-[57px] justify-start text-left font-normal border hover:border-blue-600 focus:border-blue-500 rounded-none bg-transparent hover:bg-transparent",
            !internalCheckIn && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 shrink-0" />
          <span className="truncate">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-none" align="start">
        <div className="p-3 border-b">
          <p className="text-sm font-medium">
            {!internalCheckIn
              ? t("selectCheckInDate")
              : !internalCheckOut
              ? t("selectCheckOutDate")
              : t("datesSelected")}
          </p>
          {internalCheckIn && !internalCheckOut && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("minStay")}: 1 {t("night")} | {t("maxStay")}: 30 {t("nights")}
            </p>
          )}
        </div>
        <Calendar
          mode="single"
          selected={internalCheckIn || undefined}
          onSelect={handleDateSelect}
          disabled={(date) => {
            const dateObj = new Date(date);
            dateObj.setHours(0, 0, 0, 0);

            // Disable past dates
            if (dateObj < today) return true;

            // If check-in is selected, disable dates more than 30 days after
            if (internalCheckIn && dateObj > maxDate) return true;

            return false;
          }}
          modifiers={{
            checkIn: internalCheckIn ? [internalCheckIn] : [],
            checkOut: internalCheckOut ? [internalCheckOut] : [],
            range:
              internalCheckIn && internalCheckOut
                ? {
                    from: internalCheckIn,
                    to: internalCheckOut,
                  }
                : undefined,
          }}
          modifiersClassNames={{
            checkIn: "bg-blue-500 text-white hover:bg-blue-600",
            checkOut: "bg-red-500 text-white hover:bg-red-600",
            range: "bg-blue-100",
          }}
          initialFocus
        />
        {internalCheckIn && internalCheckOut && (
          <div className="p-3 border-t flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">
                {differenceInDays(internalCheckOut, internalCheckIn)} {t("nights")}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInternalCheckIn(null);
                setInternalCheckOut(null);
                getDateValue({ checkIn: null, checkOut: null });
              }}
            >
              {t("clear")}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
