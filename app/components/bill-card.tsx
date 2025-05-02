"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Bill } from "../types/bill";
import BillItem from "./bill-item";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

interface BillCardProps {
  month: string;
  bills: Bill[];
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onTogglePaid: (id: number) => void;
  title: string;
  country: string;
  valueColor?: string; // Keeping this for backward compatibility
  onMonthChange?: (newMonthName: string) => void;
  onBillUpdate?: (updatedBill: Bill) => void;
}

export default function BillCard({
  month,
  bills,
  onNextMonth,
  onPrevMonth,
  onTogglePaid,
  title,
  country,
  onMonthChange,
  onBillUpdate,
}: BillCardProps) {
  // We don't use selectedMonth elsewhere, but we need it for the callback
  const [, setSelectedMonth] = useState(month);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Create a wrapper function to handle the type mismatch
  const handleApiChange = useCallback((api: CarouselApi | undefined) => {
    setCarouselApi(api || null);
  }, []);

  // List of all months wrapped in useMemo to fix the dependencies warning
  const months = useMemo(
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

  // Update carousel when month changes from parent component
  useEffect(() => {
    if (!carouselApi) return;

    const monthIndex = months.findIndex((m) => m === month);
    if (monthIndex !== -1 && monthIndex !== currentSlide) {
      carouselApi.scrollTo(monthIndex);
      setCurrentSlide(monthIndex);
    }
  }, [month, carouselApi, months, currentSlide]);

  // Use useCallback for stable event handlers
  const syncCarouselState = useCallback(() => {
    if (!carouselApi) return;

    const index = carouselApi.selectedScrollSnap();
    if (index !== currentSlide) {
      // Update our state
      setCurrentSlide(index);
      const newMonth = months[index];
      setSelectedMonth(newMonth);

      // Notify parent of month change (only if the index changed and we have a callback)
      if (onMonthChange) {
        onMonthChange(newMonth);
      }
    }
  }, [carouselApi, currentSlide, months, onMonthChange]);

  // Use effect to attach all relevant carousel events
  useEffect(() => {
    if (!carouselApi) return;

    // Add event listeners for all carousel interactions
    carouselApi.on("select", syncCarouselState);
    carouselApi.on("settle", syncCarouselState);

    return () => {
      // Clean up event listeners
      carouselApi.off("select", syncCarouselState);
      carouselApi.off("settle", syncCarouselState);
    };
  }, [carouselApi, syncCarouselState]);

  // Modified handlers that leverage the carousel API
  const handlePrevious = useCallback(() => {
    if (!carouselApi) return;
    carouselApi.scrollPrev();
    onPrevMonth();
  }, [carouselApi, onPrevMonth]);

  const handleNext = useCallback(() => {
    if (!carouselApi) return;
    carouselApi.scrollNext();
    onNextMonth();
  }, [carouselApi, onNextMonth]);

  // Function to get bill details for a specific month
  const getBillDetailsForMonth = (monthName: string) => {
    const monthAbbr = monthName.toLowerCase().substring(0, 3);
    const statusField = `${monthAbbr}_status` as keyof Bill;
    const valueField = `${monthAbbr}_value` as keyof Bill;

    const countryBills = bills.filter((bill) => bill.country === country);

    // Sort bills by due date (ascending)
    const sortedBills = [...countryBills].sort((a, b) => a.due_day - b.due_day);

    const totalValue = sortedBills
      .filter((bill) => !bill[statusField])
      .reduce((sum, bill) => {
        const monthValue = bill[valueField];
        return (
          sum + (typeof monthValue === "number" ? monthValue : bill.base_value)
        );
      }, 0);

    const unpaidBillsCount = sortedBills.filter(
      (bill) => !bill[statusField]
    ).length;

    return { totalValue, unpaidBillsCount, countryBills: sortedBills };
  };

  const formatCurrency = (value: number, country: string) => {
    if (country === "Brazil") {
      return `R$ ${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "SEK",
    });
  };

  return (
    <div className="bg-[#171717] p-6 rounded-lg shadow-md border border-gray-800 text-[#898989]">
      <h2 className="text-xl font-semibold mb-2 text-center">{title}</h2>

      <Carousel
        opts={{
          align: "center",
          loop: false,
          containScroll: "trimSnaps",
        }}
        setApi={handleApiChange}
        onSelect={syncCarouselState}
        className="w-full relative"
      >
        <CarouselContent>
          {months.map((monthName) => {
            const { totalValue, unpaidBillsCount, countryBills } =
              getBillDetailsForMonth(monthName);

            return (
              <CarouselItem key={monthName} className="basis-full pl-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-3xl font-bold text-[#898989]">
                      {formatCurrency(totalValue, country)}
                    </p>
                    <p className="text-sm text-gray-300">
                      {unpaidBillsCount} unpaid bills
                    </p>
                  </div>
                  <p className="text-2xl font-medium text-center">
                    {monthName}
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto">
                    {countryBills.map((bill) => (
                      <div key={bill.id} className="w-auto md:w-auto lg:w-auto">
                        <BillItem
                          bill={bill}
                          onTogglePaid={onTogglePaid}
                          month={monthName}
                          onBillUpdate={onBillUpdate}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation with Previous/Next buttons */}
        <div className="flex items-center justify-between mt-4 px-2">
          <CarouselPrevious
            onClick={handlePrevious}
            className="static translate-y-0 opacity-70 hover:opacity-100 hover:bg-white transition-all pointer-events-auto"
            variant="ghost"
            size="sm"
          />

          {/* Month indicator dots with active line style */}
          <div className="flex space-x-1 justify-center items-center">
            {months.map((name, index) => (
              <button
                key={name}
                className={cn(
                  "transition-all flex items-center",
                  currentSlide === index
                    ? "h-2 w-8 rounded-full bg-green-600" // Adjusted height to match inactive dots
                    : "h-2 w-2 rounded-full bg-[#898989]"
                )}
                onClick={() => {
                  carouselApi?.scrollTo(index);
                }}
                aria-label={`Go to ${name}`}
              />
            ))}
          </div>

          <CarouselNext
            onClick={handleNext}
            className="static translate-y-0 opacity-70 hover:opacity-100 hover:bg-white transition-all pointer-events-auto"
            variant="ghost"
            size="sm"
          />
        </div>
      </Carousel>
    </div>
  );
}
