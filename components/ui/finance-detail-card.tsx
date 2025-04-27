import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Transaction } from "@/types/transaction";

interface FinanceDetailCardProps {
  title: string;
  cardType:
    | "personal"
    | "sweden"
    | "brasil"
    | "pix"
    | "Casamento Karlinha e Perna";
  amandaTransactions: Transaction[];
  usTransactions: Transaction[];
  usTransactionsAmanda: Transaction[];
}

export function FinanceDetailCard({
  title,
  cardType,
  amandaTransactions,
  usTransactions,
  usTransactionsAmanda,
}: FinanceDetailCardProps) {
  // Helper function to filter transactions
  const filterTransactions = (
    transactions: Transaction[],
    startDate: string,
    endDate: string
  ) =>
    transactions.filter(
      (transaction) =>
        transaction.Date &&
        new Date(transaction.Date) >= new Date(startDate) &&
        new Date(transaction.Date) <= new Date(endDate) &&
        ![
          "bagaggio",
          "unibh",
          "gympass",
          "iphone",
          "casas bahia - 111240002982009-01",
          "pix",
          "recebido",
        ].some((keyword) =>
          transaction.Description?.toLowerCase().includes(keyword)
        )
    );

  // Helper function to calculate the total amount of transactions
  const calculateTotal = (transactions: Transaction[]) =>
    transactions.reduce(
      (total, transaction) => total + (transaction.Amount || 0),
      0
    );

  // Render different card content based on cardType
  const renderCardContent = () => {
    switch (cardType) {
      case "personal":
        return (
          <>
            <p className="text-xl font-bold mb-4">
              {(() => {
                const bagaggioTransactions = amandaTransactions.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes(
                      "bagaggio".toLowerCase()
                    )
                );
                const unibhTransactions = amandaTransactions.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes(
                      "unibh".toLowerCase()
                    )
                );
                const gympassTransactions = amandaTransactions.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes(
                      "gympass".toLowerCase()
                    )
                );
                const iphoneTransactions = amandaTransactions.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes(
                      "iphone".toLowerCase()
                    ) ||
                    transaction.Description?.toLowerCase().includes(
                      "casas bahia - 111240002982009-01".toLowerCase()
                    )
                );

                const totalAmount = [
                  ...bagaggioTransactions,
                  ...unibhTransactions,
                  ...gympassTransactions,
                  ...iphoneTransactions,
                ].reduce(
                  (total, transaction) => total + (transaction.Amount || 0),
                  0
                );

                const isPositive = totalAmount >= 0;

                return (
                  <span
                    className={`${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {`Total: ${new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalAmount)}`}
                  </span>
                );
              })()}
            </p>

            {[
              {
                label: "Amanda's expenses:",
                transactions: amandaTransactions.filter((transaction) =>
                  [
                    "bagaggio",
                    "unibh",
                    "gympass",
                    "iphone",
                    "casas bahia - 111240002982009-01",
                  ].some((keyword) =>
                    transaction.Description?.toLowerCase().includes(
                      keyword.toLowerCase()
                    )
                  )
                ),
              },
              {
                label: "Carlos' shared (÷2):",
                transactions: [],
                divideBy: 2,
              },
              {
                label: "Amanda's shared (÷2):",
                transactions: [],
                divideBy: 2,
              },
            ].map(({ label, transactions, divideBy = 1 }, index) => (
              <div
                key={index}
                className={`flex justify-between text-sm ${
                  index < 2 ? "mb-2" : ""
                }`}
              >
                <span>{label}</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(calculateTotal(transactions) / divideBy)}
                </span>
              </div>
            ))}
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="personalDetails">
                <AccordionTrigger className="text-xs">
                  View All Personal Transactions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar monospace-font">
                    {(() => {
                      const allPersonalTransactions = [
                        ...amandaTransactions.filter(
                          (transaction) =>
                            transaction.Description?.toLowerCase().includes(
                              "bagaggio"
                            ) ||
                            transaction.Description?.toLowerCase().includes(
                              "unibh"
                            ) ||
                            transaction.Description?.toLowerCase().includes(
                              "gympass"
                            ) ||
                            transaction.Description?.toLowerCase().includes(
                              "iphone"
                            ) ||
                            transaction.Description?.toLowerCase().includes(
                              "casas bahia - 111240002982009-01"
                            )
                        ),
                      ];

                      return allPersonalTransactions
                        .sort((a, b) => {
                          if (!a.Date || !b.Date) return 0;
                          return (
                            new Date(b.Date).getTime() -
                            new Date(a.Date).getTime()
                          );
                        })
                        .map((transaction, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex flex-col w-3/5">
                              <span className="truncate font-mono">
                                {transaction.Description}
                              </span>
                              <span className="text-gray-500 text-[10px]">
                                {transaction.Date &&
                                  new Date(transaction.Date).toLocaleDateString(
                                    "pt-BR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )}
                              </span>
                            </div>
                            <span
                              className={`w-2/5 text-right ${
                                transaction.Amount && transaction.Amount > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(transaction.Amount || 0)}
                            </span>
                          </div>
                        ));
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );

      case "sweden":
        return (
          <>
            <p className="text-xl font-bold mb-4">
              {(() => {
                const amandaFiltered = amandaTransactions.filter(
                  (transaction) =>
                    transaction.Date &&
                    new Date(transaction.Date) >= new Date("2024-11-01") &&
                    new Date(transaction.Date) <= new Date("2025-01-31") &&
                    ![
                      "bagaggio",
                      "unibh",
                      "gympass",
                      "iphone",
                      "casas bahia - 111240002982009-01",
                      "pix", // Added to exclude PIX transactions
                      "recebido", // Added to exclude incoming transfers
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA", // Exclude wedding transactions
                    ].some((keyword) =>
                      transaction.Description?.toLowerCase().includes(
                        keyword.toLowerCase()
                      )
                    )
                );
                const amandaTotal = amandaFiltered.reduce(
                  (total, transaction) => total + (transaction.Amount || 0),
                  0
                );

                const usFiltered = usTransactions.filter(
                  (transaction) =>
                    transaction.Date &&
                    new Date(transaction.Date) >= new Date("2024-11-01") &&
                    new Date(transaction.Date) <= new Date("2025-01-31") &&
                    ![
                      "pix", // Added to exclude PIX transactions
                      "recebido", // Added to exclude incoming transfers
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA", // Exclude wedding transactions
                    ].some((keyword) =>
                      transaction.Description?.toLowerCase().includes(
                        keyword.toLowerCase()
                      )
                    )
                );
                const usTotal =
                  usFiltered.reduce(
                    (total, transaction) => total + (transaction.Amount || 0),
                    0
                  ) / 2;

                const usAmandaFiltered = usTransactionsAmanda.filter(
                  (transaction) =>
                    transaction.Date &&
                    new Date(transaction.Date) >= new Date("2024-11-01") &&
                    new Date(transaction.Date) <= new Date("2025-01-31") &&
                    ![
                      "pix", // Added to exclude PIX transactions
                      "recebido", // Added to exclude incoming transfers
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA", // Exclude wedding transactions
                    ].some((keyword) =>
                      transaction.Description?.toLowerCase().includes(
                        keyword.toLowerCase()
                      )
                    )
                );
                const usAmandaTotal =
                  usAmandaFiltered.reduce(
                    (total, transaction) => total + (transaction.Amount || 0),
                    0
                  ) / 2;

                const finalTotal = amandaTotal + usTotal - usAmandaTotal;
                const isPositive = finalTotal >= 0;

                return (
                  <span
                    className={`${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {`Total: ${new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(finalTotal)}`}
                  </span>
                );
              })()}
            </p>

            {/* Amanda's transactions */}
            <div className="flex justify-between text-sm mb-2">
              <span>Amanda&apos;s expenses:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  calculateTotal(
                    filterTransactions(
                      amandaTransactions,
                      "2024-11-01",
                      "2025-01-31"
                    ).filter(
                      (transaction) =>
                        !transaction.Description?.includes(
                          "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                        )
                    )
                  )
                )}
              </span>
            </div>

            {/* Carlos' shared expenses */}
            <div className="flex justify-between text-sm mb-2">
              <span>Carlos&apos; shared (÷2):</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  calculateTotal(
                    filterTransactions(
                      usTransactions,
                      "2024-11-01",
                      "2025-01-31"
                    ).filter(
                      (transaction) =>
                        !transaction.Description?.includes(
                          "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                        )
                    )
                  ) / 2
                )}
              </span>
            </div>

            {/* Amanda's shared expenses */}
            <div className="flex justify-between text-sm">
              <span>Amanda&apos;s shared (÷2):</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  calculateTotal(
                    filterTransactions(
                      usTransactionsAmanda,
                      "2024-11-01",
                      "2025-01-31"
                    ).filter(
                      (transaction) =>
                        !transaction.Description?.includes(
                          "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                        )
                    )
                  ) / 2
                )}
              </span>
            </div>

            {/* Optional: Display all merchants with scrolling */}
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="details">
                <AccordionTrigger className="text-xs">
                  View All Merchants
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar monospace-font">
                    {(() => {
                      const allTransactions = [
                        ...amandaTransactions,
                        ...usTransactions,
                        ...usTransactionsAmanda,
                      ].filter(
                        (transaction) =>
                          transaction.Date &&
                          new Date(transaction.Date) >=
                            new Date("2024-11-01") &&
                          new Date(transaction.Date) <=
                            new Date("2025-01-31") &&
                          ![
                            "bagaggio",
                            "unibh",
                            "gympass",
                            "iphone",
                            "casas bahia - 111240002982009-01",
                            "pix", // Added to exclude PIX transactions
                            "recebido", // Added to exclude incoming transfers
                            "POUSADA DA CYSSA       ARMACAO DOS B BRA", // Exclude wedding transactions
                          ].some((keyword) =>
                            transaction.Description?.toLowerCase().includes(
                              keyword.toLowerCase()
                            )
                          )
                      );

                      // Group by description and sum amounts
                      const merchants = allTransactions.reduce(
                        (acc, transaction) => {
                          const key = transaction.Description || "Unknown";
                          if (!acc[key]) {
                            acc[key] = 0;
                          }
                          acc[key] += transaction.Amount || 0;
                          return acc;
                        },
                        {} as Record<string, number>
                      );

                      // Update the merchant list item in each accordion
                      return Object.entries(merchants)
                        .sort(
                          ([, amountA], [, amountB]) =>
                            Math.abs(amountB) - Math.abs(amountA)
                        )
                        .map(([name, amount]) => (
                          <div
                            key={name}
                            className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0"
                          >
                            <span className="truncate w-1/2 pr-2">{name}</span>
                            <span
                              className={`w-1/2 text-right ${
                                amount < 0 ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(amount)}
                            </span>
                          </div>
                        ));
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );

      case "brasil":
        return (
          <>
            <p className="text-xl font-bold mb-4">
              {(() => {
                const filterTransactions = (
                  transactions: Transaction[],
                  startDate: string,
                  endDate: string
                ) =>
                  transactions.filter(
                    (transaction) =>
                      transaction.Date &&
                      new Date(transaction.Date) >= new Date(startDate) &&
                      new Date(transaction.Date) <= new Date(endDate) &&
                      ![
                        "bagaggio",
                        "unibh",
                        "gympass",
                        "iphone",
                        "casas bahia - 111240002982009-01",
                        "pix",
                        "recebido",
                      ].some((keyword) =>
                        transaction.Description?.toLowerCase().includes(keyword)
                      )
                  );

                const calculateTotal = (transactions: Transaction[]) =>
                  transactions.reduce(
                    (total, transaction) => total + (transaction.Amount || 0),
                    0
                  );

                const amandaFiltered = filterTransactions(
                  amandaTransactions,
                  "2025-02-01",
                  "2025-03-31"
                );
                const amandaTotal = calculateTotal(amandaFiltered);

                const usFiltered = filterTransactions(
                  usTransactions,
                  "2025-02-01",
                  "2025-03-31"
                );
                const usTotal = calculateTotal(usFiltered) / 2;

                const usAmandaFiltered = filterTransactions(
                  usTransactionsAmanda,
                  "2025-02-01",
                  "2025-03-31"
                );
                const usAmandaTotal = calculateTotal(usAmandaFiltered) / 2;

                const finalTotal = amandaTotal + usTotal - usAmandaTotal;

                const isPositive = finalTotal >= 0;

                return (
                  <span
                    className={`${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {`Total: ${new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(finalTotal)}`}
                  </span>
                );
              })()}
            </p>

            {[
              {
                label: "Amanda's expenses:",
                transactions: filterTransactions(
                  amandaTransactions,
                  "2025-02-01",
                  "2025-03-31"
                ),
              },
              {
                label: "Carlos' shared (÷2):",
                transactions: filterTransactions(
                  usTransactions,
                  "2025-02-01",
                  "2025-03-31"
                ),
                divideBy: 2,
              },
              {
                label: "Amanda's shared (÷2):",
                transactions: filterTransactions(
                  usTransactionsAmanda,
                  "2025-02-01",
                  "2025-03-31"
                ),
                divideBy: 2,
              },
            ].map(({ label, transactions, divideBy = 1 }, index) => (
              <div
                key={index}
                className={`flex justify-between text-sm ${
                  index < 2 ? "mb-2" : ""
                }`}
              >
                <span>{label}</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(calculateTotal(transactions) / divideBy)}
                </span>
              </div>
            ))}

            {/* Common Brazil merchants with scrolling */}
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="details">
                <AccordionTrigger className="text-xs">
                  View All Brazil Merchants
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar monospace-font">
                    {(() => {
                      const allTransactions = [
                        ...usTransactions.filter(
                          (transaction) =>
                            transaction.Date &&
                            new Date(transaction.Date) >=
                              new Date("2025-02-01") &&
                            new Date(transaction.Date) <= new Date("2025-03-31")
                        ),
                        ...usTransactionsAmanda.filter(
                          (transaction) =>
                            transaction.Date &&
                            new Date(transaction.Date) >=
                              new Date("2025-02-01") &&
                            new Date(transaction.Date) <= new Date("2025-03-31")
                        ),
                      ];

                      // Group by description and sum amounts
                      const merchants = allTransactions.reduce(
                        (acc, transaction) => {
                          const key = transaction.Description || "Unknown";
                          if (!acc[key]) {
                            acc[key] = 0;
                          }
                          acc[key] += transaction.Amount || 0;
                          return acc;
                        },
                        {} as Record<string, number>
                      );

                      // Update the merchant list item in each accordion
                      return Object.entries(merchants)
                        .sort(
                          ([, amountA], [, amountB]) =>
                            Math.abs(amountB) - Math.abs(amountA)
                        )
                        .map(([name, amount]) => (
                          <div
                            key={name}
                            className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0"
                          >
                            <span className="truncate w-1/2 pr-2">{name}</span>
                            <span
                              className={`w-1/2 text-right ${
                                amount < 0 ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(amount)}
                            </span>
                          </div>
                        ));
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );

      case "pix":
        return (
          <>
            <p className="text-xl font-bold mb-4">
              {(() => {
                // Filter transactions containing "pix" or "recebido" in the description
                const amandaPixTransactions = amandaTransactions.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes("pix") &&
                    transaction.Amount
                );

                const carlosShared = usTransactions.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes("pix") &&
                    transaction.Amount
                );

                const amandaShared = usTransactionsAmanda.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes("pix") &&
                    transaction.Amount
                );

                // Updated calculation to match the values shown in the card
                const totalAmount =
                  calculateTotal(amandaPixTransactions) +
                  calculateTotal(carlosShared) / 2 +
                  calculateTotal(amandaShared) / 2;

                const isPositive = totalAmount >= 0;

                return (
                  <span
                    className={`${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {`Total: ${new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalAmount)}`}
                  </span>
                );
              })()}
            </p>

            {[
              {
                label: "Amanda's expenses:",
                transactions: amandaTransactions.filter(
                  (transaction) =>
                    (transaction.Description?.toLowerCase().includes("pix") ||
                      transaction.Description?.toLowerCase().includes(
                        "recebido"
                      )) &&
                    transaction.Amount
                ),
                divideBy: 1,
              },
              {
                label: "Carlos' shared (÷2):",
                transactions: usTransactions.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes("pix") &&
                    transaction.Amount
                ),
                divideBy: 2,
              },
              {
                label: "Amanda's shared (÷2):",
                transactions: usTransactionsAmanda.filter(
                  (transaction) =>
                    transaction.Description?.toLowerCase().includes("pix") &&
                    transaction.Amount
                ),
                divideBy: 2,
              },
            ].map(({ label, transactions, divideBy = 1 }, index) => (
              <div
                key={index}
                className={`flex justify-between text-sm ${
                  index < 2 ? "mb-2" : ""
                }`}
              >
                <span>{label}</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(calculateTotal(transactions) / divideBy)}
                </span>
              </div>
            ))}

            {/* View All PIX Transactions */}
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="pixDetails">
                <AccordionTrigger className="text-xs">
                  View All PIX Transactions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar monospace-font">
                    {(() => {
                      // Include all PIX transactions, both incoming and outgoing
                      const pixTransactions = [
                        ...amandaTransactions.filter(
                          (transaction) =>
                            transaction.Description?.toLowerCase().includes(
                              "pix"
                            ) ||
                            transaction.Description?.toLowerCase().includes(
                              "recebido"
                            )
                        ),
                        ...usTransactions.filter((transaction) =>
                          transaction.Description?.toLowerCase().includes("pix")
                        ),
                        ...usTransactionsAmanda.filter((transaction) =>
                          transaction.Description?.toLowerCase().includes("pix")
                        ),
                      ];

                      return pixTransactions
                        .sort((a, b) => {
                          if (!a.Date || !b.Date) return 0;
                          return (
                            new Date(b.Date).getTime() -
                            new Date(a.Date).getTime()
                          );
                        })
                        .map((transaction, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex flex-col w-3/5">
                              <span className="truncate font-mono">
                                {transaction.Description}
                              </span>
                              <span className="text-gray-500 text-[10px]">
                                {transaction.Date &&
                                  new Date(transaction.Date).toLocaleDateString(
                                    "pt-BR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    }
                                  )}
                              </span>
                            </div>
                            <span
                              className={`w-2/5 text-right ${
                                transaction.Amount && transaction.Amount > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(transaction.Amount || 0)}
                            </span>
                          </div>
                        ));
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );

      case "Casamento Karlinha e Perna":
        return (
          <>
            <p className="text-xl font-bold mb-4">
              {(() => {
                // Filter transactions with exact description match

                const amandaExpenses = amandaTransactions.filter(
                  (transaction) =>
                    transaction.Description &&
                    transaction.Description.includes(
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                    )
                );

                const carlosShared = usTransactions.filter(
                  (transaction) =>
                    transaction.Description &&
                    transaction.Description.includes(
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                    )
                );

                const amandaShared = usTransactionsAmanda.filter(
                  (transaction) =>
                    transaction.Description &&
                    transaction.Description.includes(
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                    )
                );

                const totalAmount =
                  calculateTotal(amandaExpenses) +
                  calculateTotal(carlosShared) / 2 +
                  calculateTotal(amandaShared) / 2;

                const isPositive = totalAmount >= 0;

                return (
                  <span
                    className={`${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {`Total: ${new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalAmount)}`}
                  </span>
                );
              })()}
            </p>

            {[
              {
                label: "Amanda's expenses:",
                transactions: amandaTransactions.filter(
                  (transaction) =>
                    transaction.Description &&
                    transaction.Description.includes(
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                    )
                ),
                divideBy: 1,
              },
              {
                label: "Carlos' shared (÷2):",
                transactions: usTransactions.filter(
                  (transaction) =>
                    transaction.Description &&
                    transaction.Description.includes(
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                    )
                ),
                divideBy: 2,
              },
              {
                label: "Amanda's shared (÷2):",
                transactions: usTransactionsAmanda.filter(
                  (transaction) =>
                    transaction.Description &&
                    transaction.Description.includes(
                      "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                    )
                ),
                divideBy: 2,
              },
            ].map(({ label, transactions, divideBy = 1 }, index) => (
              <div
                key={index}
                className={`flex justify-between text-sm ${
                  index < 2 ? "mb-2" : ""
                }`}
              >
                <span>{label}</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(calculateTotal(transactions) / divideBy)}
                </span>
              </div>
            ))}

            {/* Wedding transactions with scrolling */}
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="details">
                <AccordionTrigger className="text-xs">
                  View All Wedding Transactions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-40 overflow-y-auto pr-1 custom-scrollbar monospace-font">
                    {(() => {
                      const allWeddingTransactions = [
                        ...amandaTransactions,
                        ...usTransactions,
                        ...usTransactionsAmanda,
                      ].filter(
                        (transaction) =>
                          transaction.Description &&
                          transaction.Description.includes(
                            "POUSADA DA CYSSA       ARMACAO DOS B BRA"
                          )
                      );

                      // Group by description and sum amounts
                      const merchants = allWeddingTransactions.reduce(
                        (acc, transaction) => {
                          const key = transaction.Description || "Unknown";
                          if (!acc[key]) {
                            acc[key] = 0;
                          }
                          acc[key] += transaction.Amount || 0;
                          return acc;
                        },
                        {} as Record<string, number>
                      );

                      return Object.entries(merchants)
                        .sort(
                          ([, amountA], [, amountB]) =>
                            Math.abs(amountB) - Math.abs(amountA)
                        )
                        .map(([name, amount]) => (
                          <div
                            key={name}
                            className="flex justify-between text-xs mb-1 py-1 border-b border-gray-100 last:border-0"
                          >
                            <span className="truncate w-1/2 pr-2">{name}</span>
                            <span
                              className={`w-1/2 text-right ${
                                amount < 0 ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(amount)}
                            </span>
                          </div>
                        ));
                    })()}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border border-gray-300 shadow-none h-full mx-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{renderCardContent()}</CardContent>
    </Card>
  );
}
