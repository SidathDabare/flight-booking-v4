"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Plane,
  RotateCcw,
  ListFilterPlus,
  CircleDollarSign,
  SendHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type Filters = {
  stops: string;
  airline: string;
  maxPrice: number;
};

interface Props {
  filters: Filters;
  airlines: string[];
  handleFilterChange: (key: keyof Filters, value: string | number) => void;
  maxPrice: number;
  onClearFilters?: () => void;
  isLoading?: boolean;
  resultsCount?: number;
}

export default function SidebarFilter({
  filters,
  airlines,
  handleFilterChange,
  maxPrice,
  onClearFilters,
  isLoading = false,
  resultsCount,
}: Props) {
  const t = useTranslations("flights.sidebar");
  const { isMobile } = useSidebar();

  const hasActiveFilters =
    filters.stops !== "any" ||
    filters.airline !== "any" ||
    filters.maxPrice < maxPrice;

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      handleFilterChange("stops", "any");
      handleFilterChange("airline", "any");
      handleFilterChange("maxPrice", maxPrice);
    }
  };

  return (
    <Sidebar
      variant={isMobile ? "floating" : "inset"}
      collapsible={isMobile ? "offcanvas" : "none"}
      className="min-w-72 h-screen flex flex-col rounded-xs border bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 shadow-xl border-gray-200/60 dark:border-gray-700/60"
    >
      <SidebarHeader className="flex-shrink-0 flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/60 px-2 py-2 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 dark:from-gray-800 dark:via-gray-700/80 dark:to-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <div className="p-1 bg-gradient-to-br rounded-sm shadow-sm border">
            {/* <Filter className="w-5 h-5 text-white"  /> */}
            <ListFilterPlus size={16} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-md font-semibold text-gray-900/70 dark:text-white tracking-tight">
              {t("title")}
            </h2>
            {resultsCount !== undefined && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {t("resultsCount", { count: resultsCount })}
              </p>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-xs px-3 py-1 h-auto bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 border-red-200 hover:border-red-300 dark:from-red-950/50 dark:to-red-900/50 dark:hover:from-red-900/70 dark:hover:to-red-800/70 dark:text-red-400 dark:border-red-800 dark:hover:border-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4" />
            {t("clearAll")}
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto p-6 relative">
        <div className="space-y-6">
          <SidebarGroup className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/80 dark:to-gray-700/40 rounded-xs px-2 py-2 border border-gray-200/60 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
            <SidebarGroupLabel className="mb-4 text-sm font-semibold flex items-center gap-1 text-gray-800/70 dark:text-gray-200">
              <div className="p-1 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-md">
                {/* <DollarSign className="w-4 h-4 text-white" /> */}
                {/* <CircleDollarSign
                  size={14}
                  strokeWidth={2}
                  className="text-white"
                /> */}
              </div>
              {t("priceRange")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    $0
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-sm">
                    ${filters.maxPrice}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    ${maxPrice}
                  </span>
                </div>
                <div className="px-2">
                  <Slider
                    value={[filters.maxPrice]}
                    max={maxPrice}
                    step={50}
                    onValueChange={(value) =>
                      handleFilterChange("maxPrice", value[0])
                    }
                    className="w-full h-[1px] hover:h-2 transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
                <div className="text-center">
                  <span className="inline-block px-4 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-600 shadow-sm">
                    {t("budgetUpTo", { price: filters.maxPrice })}
                  </span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800/80 dark:to-blue-900/20 rounded-xs px-2 py-3 border border-gray-200/60 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
            <SidebarGroupLabel className="mb-4 text-sm font-semibold flex items-center gap-1 text-gray-800/70 dark:text-gray-200">
              <div className="p-1 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-md">
                {/* <Plane className="w-4 h-4 text-white" /> */}
                {/* <SendHorizontal
                  size={14}
                  strokeWidth={2}
                  className="text-white"
                /> */}
              </div>
              {t("flightStops")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <RadioGroup
                value={filters.stops}
                onValueChange={(value) => handleFilterChange("stops", value)}
                className="space-y-2"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-4 p-1 rounded-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                  <RadioGroupItem
                    value="any"
                    id="any"
                    className="border w-4 h-4"
                  />
                  <Label
                    htmlFor="any"
                    className="text-xs flex-1 cursor-pointer"
                  >
                    {t("stops.any")}
                  </Label>
                </div>
                <div className="flex items-center space-x-4 p-1 rounded-sm hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-700">
                  <RadioGroupItem
                    value="0"
                    id="nonstop"
                    className="border w-4 h-4"
                  />
                  <Label
                    htmlFor="nonstop"
                    className="text-xs flex-1 cursor-pointer"
                  >
                    {t("stops.direct")}
                  </Label>
                </div>
                <div className="flex items-center space-x-4 p-1 rounded-sm hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-all duration-200 border border-transparent hover:border-yellow-200 dark:hover:border-yellow-700">
                  <RadioGroupItem
                    value="1"
                    id="onestop"
                    className="border w-4 h-4"
                  />
                  <Label
                    htmlFor="onestop"
                    className="text-xs flex-1 cursor-pointer"
                  >
                    {t("stops.oneMax")}
                  </Label>
                </div>
                <div className="flex items-center space-x-4 p-1 rounded-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-700">
                  <RadioGroupItem
                    value="2+"
                    id="multistop"
                    className="border w-4 h-4"
                  />
                  <Label
                    htmlFor="multistop"
                    className="text-xs flex-1 cursor-pointer"
                  >
                    {t("stops.twoPlus")}
                  </Label>
                </div>
              </RadioGroup>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800/80 dark:to-purple-900/20 rounded-xl px-2 py-2 border border-gray-200/60 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
            <SidebarGroupLabel className="mb-4 text-sm font-semibold flex items-center gap-3 text-gray-800/80 dark:text-gray-200">
              {/* <div className="p-1 bg-gradient-to-br from-purple-400 to-pink-500 rounded-sm shadow-md">
                <Plane className="w-4 h-4 text-white rotate-45" />
              </div> */}
              {t("preferredAirline")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3">
                <Select
                  value={filters.airline}
                  onValueChange={(value) =>
                    handleFilterChange("airline", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full h-10 border-2 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-600 hover:border-purple-300 dark:hover:border-purple-600 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-200 rounded-xs shadow-sm hover:shadow-md">
                    <SelectValue placeholder={t("chooseAirline")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xs p-1">
                    <SelectItem value="any" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm"></div>
                        <span>{t("anyAirline")}</span>
                      </div>
                    </SelectItem>
                    {airlines.map((airline) => (
                      <SelectItem
                        key={airline}
                        value={airline}
                        className="py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            className="block shadow-sm rounded-sm"
                            src={`${process.env.NEXT_PUBLIC_AIRLINE_LOGO_URL}/sm${airline}.gif`}
                            alt={`${airline} logo`}
                            width={18}
                            height={18}
                            unoptimized
                          />
                          <span className="font-medium">{airline}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.airline !== "any" && (
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 rounded-lg border border-purple-200 dark:border-purple-600 shadow-sm">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        {t("filteringBy")}:
                      </span>
                      <div className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                        <Image
                          className="block shadow-sm rounded-sm"
                          src={`${process.env.NEXT_PUBLIC_AIRLINE_LOGO_URL}/sm${filters.airline}.gif`}
                          alt={`${filters.airline} logo`}
                          width={14}
                          height={14}
                          unoptimized
                        />
                        <span className="text-gray-800/80 dark:text-gray-200 text-xs">
                          {filters.airline}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Loading State Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600">
              <div className="relative">
                <div className="w-8 h-8 border-3 border-blue-200 dark:border-blue-800 rounded-full"></div>
                <div className="absolute inset-0 w-8 h-8 border-3 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("updatingFilters")}
              </span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
