"use client";

import TransactionTable from "@/components/ui/transaction/TransactionTable";
import { Transaction } from "@/types/transaction";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface TableSection {
  id: string;
  title: string;
  transactions: Transaction[];
  bankFilter?: string;
  initialSortColumn?: string;
  initialSortDirection?: "asc" | "desc";
  hiddenColumns?: string[];
  showMonthFilter?: boolean;
  showCategoryFilter?: boolean;
  showDescriptionFilter?: boolean;
  showResponsibleFilter?: boolean;
  showCommentFilter?: boolean;
  showFilters?: boolean;
  showTotalAmount?: boolean;
  excludeCategories?: string[];
  includeCategories?: string[];
  customFilter?: (transaction: Transaction) => boolean;
  TransactionTableName?: string; // Added for Inter Account page
}

interface BankTablePageBodyProps {
  sections: TableSection[];
  className?: string;
}

export default function BankTablePageBody({
  sections,
  className = "",
}: BankTablePageBodyProps) {
  return (
    <div className={className}>
      <Accordion type="single" collapsible>
        {sections.map((section) => {
          // Apply filters
          let filteredTransactions = section.transactions;

          // Apply bank filter
          if (section.bankFilter) {
            filteredTransactions = filteredTransactions.filter(
              (t) => t.Bank === section.bankFilter,
            );
          }

          // Apply category exclusions
          if (section.excludeCategories) {
            filteredTransactions = filteredTransactions.filter(
              (t) =>
                t.Category && !section.excludeCategories!.includes(t.Category),
            );
          }

          // Apply category inclusions
          if (section.includeCategories) {
            filteredTransactions = filteredTransactions.filter(
              (t) =>
                t.Category && section.includeCategories!.includes(t.Category),
            );
          }

          // Apply custom filter
          if (section.customFilter) {
            filteredTransactions = filteredTransactions.filter(
              section.customFilter,
            );
          }

          return (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent>
                <TransactionTable
                  transactions={filteredTransactions}
                  bankFilter={section.bankFilter}
                  initialSortColumn={section.initialSortColumn || "Date"}
                  initialSortDirection={section.initialSortDirection || "desc"}
                  hiddenColumns={section.hiddenColumns || []}
                  showMonthFilter={section.showMonthFilter ?? true}
                  showCategoryFilter={section.showCategoryFilter ?? true}
                  showDescriptionFilter={section.showDescriptionFilter ?? true}
                  showResponsibleFilter={section.showResponsibleFilter ?? true}
                  showCommentFilter={section.showCommentFilter ?? true}
                  showFilters={section.showFilters ?? true}
                  showTotalAmount={section.showTotalAmount ?? true}
                  excludeCategories={section.excludeCategories}
                  TransactionTableName={section.TransactionTableName}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
