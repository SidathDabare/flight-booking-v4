"use client";

import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { formatFareRulesText } from "./flight-utils";
import { useTranslations } from "next-intl";

interface FareDescription {
  descriptionType: string;
  text: string;
  [key: string]: unknown;
}

interface FareRule {
  name: string;
  fareBasis: string;
  fareNotes?: {
    descriptions?: FareDescription[];
  };
  [key: string]: unknown;
}

interface FareRules {
  included?: {
    "detailed-fare-rules"?: {
      [segmentId: string]: FareRule;
    };
  };
  [key: string]: unknown;
}

interface FareRulesProps {
  selectedFlight: unknown;
}

export default function FareRules({ selectedFlight }: FareRulesProps) {
  const t = useTranslations("ticketDetails.fareRules");
  const [fareRules, setFareRules] = useState<FareRules | null>(null);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);

  const getFlightRules = useCallback(async () => {
    if (!selectedFlight) return;

    setIsLoadingRules(true);
    setRulesError(null);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          flightOffers: [selectedFlight],
        }),
      };

      const response = await fetch(
        "/api/flight-pricing-fare-rules",
        requestOptions
      );

      if (!response.ok) {
        console.log(`Failed to fetch fare rules: ${response.status}`);
      }

      const data = await response.json();
      setFareRules(data);
    } catch (error) {
      console.error("Error fetching fare rules:", error);
      setRulesError(
        error instanceof Error ? error.message : "Failed to load fare rules"
      );
    } finally {
      setIsLoadingRules(false);
    }
  }, [selectedFlight]);

  useEffect(() => {
    if (selectedFlight) {
      getFlightRules();
    }
  }, [selectedFlight, getFlightRules]);

  return (
    <Card className="h-fit sticky top-8 shadow-md">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="fare-rules" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <span className="text-xl font-semibold">{t("title")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="max-h-96 overflow-y-auto">
              {isLoadingRules ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-gray-500">
                    {t("loading")}
                  </div>
                </div>
              ) : rulesError ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-red-500 text-center">
                    <p className="font-medium">{t("unableToLoad")}</p>
                    <p className="mt-1">{rulesError}</p>
                  </div>
                </div>
              ) : fareRules?.included?.["detailed-fare-rules"] ? (
                <div className="space-y-4 text-xs">
                  {Object.entries(
                    fareRules.included["detailed-fare-rules"]
                  ).map(([segmentId, rule]: [string, FareRule]) => (
                    <div
                      key={segmentId}
                      className="border-b border-gray-100 pb-4 last:border-b-0"
                    >
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">
                          {rule.name} ({rule.fareBasis})
                        </h4>
                        <p className="text-xs text-gray-600">
                          {t("segment")} {segmentId}
                        </p>
                      </div>

                      {rule.fareNotes?.descriptions?.map(
                        (description: FareDescription, idx: number) => (
                          <div key={idx} className="mb-3">
                            <h5 className="font-medium text-xs text-blue-700 mb-2 uppercase tracking-wide">
                              {description.descriptionType}
                            </h5>
                            <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-white border border-gray-100 rounded p-2">
                              <small>
                                {" "}
                                {formatFareRulesText(description.text)}
                              </small>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-gray-500 text-center">
                    <p className="font-medium">{t("noRulesAvailable")}</p>
                    <p className="mt-1">
                      {t("noRulesFound")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
