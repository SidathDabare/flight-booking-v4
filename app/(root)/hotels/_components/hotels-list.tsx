"use client";

import HotelCard from "./hotel-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface HotelsListProps {
  hotels: any[];
  searchCriteria: any;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function HotelsList({
  hotels,
  searchCriteria,
  currentPage,
  totalPages,
  onPageChange,
}: HotelsListProps) {
  const t = useTranslations("hotelResults");

  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">{t("noHotelsMatch")}</p>
        <p className="text-sm text-muted-foreground mt-2">{t("tryAdjustingFilters")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hotels */}
      {hotels.map((hotel, index) => (
        <HotelCard key={`${hotel.hotel?.hotelId || index}-${index}`} hotel={hotel} searchCriteria={searchCriteria} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={page === currentPage ? "bg-red-600 hover:bg-red-700 rounded-none" : "rounded-none"}
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 py-1">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page info */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        {t("page")} {currentPage} {t("of")} {totalPages}
      </div>
    </div>
  );
}
