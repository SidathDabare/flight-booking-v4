import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * FlightFooter Component
 *
 * Displays the footer section of the flight itinerary card with:
 * - Travel rules information with info icon
 * - Connection protection status badge
 * - Expand/collapse toggle button with smooth animations
 * - Responsive layout for mobile/desktop views
 *
 * Props:
 * - isExpanded: Controls button text and icon state
 * - onToggleExpanded: Callback function for expand/collapse action
 * - connectionInsurance: Shows/hides connection protection badge
 *
 * Purpose: Provides consistent footer controls and status information
 */

interface FlightFooterProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  connectionInsurance?: boolean;
}

export const FlightFooter: React.FC<FlightFooterProps> = ({
  isExpanded,
  onToggleExpanded,
  connectionInsurance = false,
}) => {
  const t = useTranslations("ticketDetails.footer");
  return (
    <div className="p-3 md:p-4 bg-gradient-to-r from-gray-50 via-blue-50/50 to-indigo-50 border-t border-gray-200/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <InfoIcon className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
          <span className="font-medium">{t("travelRules")}</span>
          {connectionInsurance && (
            <span className="ml-1 md:ml-2 px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs rounded-full font-medium border border-green-200">
              ✓ {t("connectionProtected")}
            </span>
          )}
        </div>

        <Button
          onClick={onToggleExpanded}
          className="inline-flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:bg-blue-400 text-blue-700 text-sm rounded-lg border-2 border-blue-200 shadow-sm truncate justify-end"
        >
          {isExpanded ? (
            <>
              <span className="hidden sm:inline">{t("hideDetails")}</span>
              <span className="sm:hidden">{t("hide")}</span>
              <ChevronUpIcon className="w-4 h-4" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">{t("showDetails")}</span>
              <span className="sm:hidden">{t("details")}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
