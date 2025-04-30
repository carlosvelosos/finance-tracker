"use client";

import { useState, useEffect } from "react";
import { Bill } from "../types/bill";
import BillItem from "./bill-item";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface BillCardProps {
  month: string;
  bills: Bill[];
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onTogglePaid: (id: number) => void;
  title: string;
  country: string;
  valueColor?: string;
}

export default function BillCard({
  month,
  bills,
  onNextMonth,
  onPrevMonth,
  onTogglePaid,
  title,
  country,
  valueColor = "text-blue-600",
}: BillCardProps) {
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // List of all months
  const months = [
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
  ];

  // Find the index of the current month
  const currentMonthIndex = months.findIndex((m) => m === month);

  useEffect(() => {
    if (!carouselApi) return;

    // Set the carousel to the current month when it changes
    const monthIndex = months.findIndex((m) => m === month);
    if (monthIndex !== -1) {
      carouselApi.scrollTo(monthIndex);
      setCurrentSlide(monthIndex);
    }
  }, [month, carouselApi, months]);

  // Handle carousel change
  const handleCarouselChange = () => {
    if (!carouselApi) return;

    const index = carouselApi.selectedScrollSnap();
    setCurrentSlide(index);

    const newMonth = months[index];
    setSelectedMonth(newMonth);
  };

  // Handle navigation with parent component awareness
  const handlePrevious = () => {
    if (!carouselApi) return;

    // First update the carousel to show the visual transition
    carouselApi.scrollPrev();

    // Then inform the parent component
    onPrevMonth();
  };

  const handleNext = () => {
    if (!carouselApi) return;

    // First update the carousel to show the visual transition
    carouselApi.scrollNext();

    // Then inform the parent component
    onNextMonth();
  };

  // Function to get bill details for a specific month
  const getBillDetailsForMonth = (monthName: string) => {
    const monthAbbr = monthName.toLowerCase().substring(0, 3);
    const statusField = `${monthAbbr}_status` as keyof Bill;
    const valueField = `${monthAbbr}_value` as keyof Bill;

    const countryBills = bills.filter((bill) => bill.country === country);
    const totalValue = countryBills
      .filter((bill) => !bill[statusField])
      .reduce((sum, bill) => {
        const monthValue = bill[valueField];
        return (
          sum + (typeof monthValue === "number" ? monthValue : bill.base_value)
        );
      }, 0);

    const unpaidBillsCount = countryBills.filter(
      (bill) => !bill[statusField]
    ).length;

    return { totalValue, unpaidBillsCount, countryBills };
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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>

      <Carousel
        opts={{
          align: "center",
          loop: false, // Changed from true to false to prevent looping from December to January
          containScroll: "trimSnaps",
        }}
        setApi={setCarouselApi}
        onSelect={handleCarouselChange}
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
                    <p className={`text-3xl font-bold ${valueColor}`}>
                      {formatCurrency(totalValue, country)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {unpaidBillsCount} unpaid bills
                    </p>
                  </div>
                  <p className="text-2xl font-medium text-center">
                    {monthName}
                  </p>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {countryBills.map((bill) => (
                      <BillItem
                        key={bill.id}
                        bill={bill}
                        onTogglePaid={onTogglePaid}
                        month={monthName}
                      />
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
          <div className="flex space-x-1 justify-center">
            {months.map((name, index) => (
              <button
                key={name}
                className={cn(
                  "transition-all",
                  currentSlide === index
                    ? "h-1.5 w-8 rounded-full bg-primary" // Line shape for active slide
                    : "h-2 w-2 rounded-full bg-gray-300" // Circle shape for inactive slides
                )}
                onClick={() => {
                  // First update the carousel
                  carouselApi?.scrollTo(index);

                  // Then inform the parent component about the month change
                  // If moving forward
                  if (index > currentSlide) {
                    for (let i = currentSlide; i < index; i++) {
                      onNextMonth();
                    }
                  }
                  // If moving backward
                  else if (index < currentSlide) {
                    for (let i = currentSlide; i > index; i--) {
                      onPrevMonth();
                    }
                  }
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
