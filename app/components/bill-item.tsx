"use client";

import { Bill } from "../types/bill";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface BillItemProps {
  bill: Bill;
  onTogglePaid: (id: number) => void;
  month: string;
}

export default function BillItem({ bill, onTogglePaid, month }: BillItemProps) {
  const monthAbbr = month.toLowerCase().substring(0, 3);
  const statusField = `${monthAbbr}_status` as keyof Bill;
  const valueField = `${monthAbbr}_value` as keyof Bill;

  const isPaid = bill[statusField];
  const currentValue =
    typeof bill[valueField] === "number"
      ? (bill[valueField] as number)
      : bill.base_value;

  const [editBill, setEditBill] = useState<Bill>({ ...bill });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleInputChange = (field: keyof Bill, value: string | number) => {
    setEditBill((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Here you would add the logic to save the bill changes to your database
    console.log("Saving bill changes:", editBill);
    // Then you would update the parent component with the new bill data
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={`p-3 rounded-lg border transition-colors cursor-pointer flex-shrink-0 w-auto ${
            isPaid
              ? "bg-gray-800 border-[#0d172b] text-gray-400"
              : "bg-[#2f2f2f] border-[#365341] hover:bg-[#1e3925]"
          }`}
          onClick={() => onTogglePaid(bill.id)}
        >
          <div className="flex items-center">
            <p
              className={`font-medium text-gray-400 ${
                isPaid ? "line-through" : ""
              }`}
            >
              {bill.due_day}
            </p>
            <span className="mx-2 text-gray-500">|</span>
            <h3
              className={`font-medium text-gray-200 ${
                isPaid ? "line-through" : ""
              }`}
            >
              {bill.description}
            </h3>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className={`w-80 ${
          isPaid
            ? "bg-gray-800 border-[#0d172b] text-gray-300"
            : "bg-[#1e3925] border-[#365341] text-gray-200"
        }`}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-white">
              {bill.description}
            </h4>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700 rounded-full"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Edit bill</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit Bill</SheetTitle>
                  <SheetDescription>
                    Make changes to your bill details here. Click save when
                    you're done.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={editBill.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="due_day" className="text-right">
                      Due Day
                    </Label>
                    <Input
                      id="due_day"
                      type="number"
                      value={editBill.due_day}
                      onChange={(e) =>
                        handleInputChange("due_day", parseInt(e.target.value))
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="payment_method" className="text-right">
                      Payment Method
                    </Label>
                    <Input
                      id="payment_method"
                      value={editBill.payment_method}
                      onChange={(e) =>
                        handleInputChange("payment_method", e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="country" className="text-right">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={editBill.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="base_value" className="text-right">
                      Base Value
                    </Label>
                    <Input
                      id="base_value"
                      type="number"
                      value={editBill.base_value}
                      onChange={(e) =>
                        handleInputChange(
                          "base_value",
                          parseFloat(e.target.value)
                        )
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current_month_value" className="text-right">
                      {month} Value
                    </Label>
                    <Input
                      id="current_month_value"
                      type="number"
                      value={
                        typeof editBill[valueField] === "number"
                          ? (editBill[valueField] as number)
                          : editBill.base_value
                      }
                      onChange={(e) =>
                        handleInputChange(
                          valueField,
                          parseFloat(e.target.value)
                        )
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit" onClick={handleSave}>
                      Save changes
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium text-gray-300">Country:</div>
            <div>{bill.country}</div>

            <div className="font-medium text-gray-300">Due Day:</div>
            <div>{bill.due_day}</div>

            <div className="font-medium text-gray-300">Payment Method:</div>
            <div>{bill.payment_method}</div>

            <div className="font-medium text-gray-300">Base Value:</div>
            <div>{formatCurrency(bill.base_value, bill.country)}</div>

            <div className="font-medium text-gray-300">Current Value:</div>
            <div>{formatCurrency(currentValue, bill.country)}</div>

            <div className="font-medium text-gray-300">Current Status:</div>
            <div className={isPaid ? "text-green-400" : "text-red-400"}>
              {isPaid ? "Paid" : "Pending"}
            </div>

            <div className="font-medium text-gray-300">Created:</div>
            <div>{formatDate(bill.created_at)}</div>

            <div className="font-medium text-gray-300">Last Updated:</div>
            <div>{formatDate(bill.updated_at)}</div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              Click to toggle payment status
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
