"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { FlightOffer } from "amadeus-ts";
import { Filter } from "lucide-react";
import FlightCard from "./flight-card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Props {
  flights: FlightOffer[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function FlightsList({
  flights,
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const t = useTranslations("flights.list");

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = Math.min(3, totalPages);

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="w-full max-w-7xl p-0 md:p-2">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-lg md:text-lg font-bold px-2 mb-2 text-gray-600">
          {t("heading")}
        </h1>
        <SidebarTrigger className="md:hidden">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">{t("toggleFilters")}</span>
          </Button>
        </SidebarTrigger>
      </div>

      {flights.length > 0 ? (
        <div className="space-y-2">
          {flights.map((flight, i) => (
            <FlightCard flight={flight} key={i} />
          ))}

          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePrevious();
                    }}
                    className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>

                {getVisiblePages().map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNext();
                    }}
                    className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-center text-xl">
            {t("noResults")}
          </p>
        </div>
      )}
    </div>
  );
}
