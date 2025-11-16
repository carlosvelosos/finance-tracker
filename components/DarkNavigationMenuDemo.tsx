"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/modified-navigation-menu";

// Define Sweden bank links
const SEbankLinks: { title: string; href: string; description: string }[] = [
  {
    title: "Handelsbanken",
    href: "/handelsbanken",
    description:
      "Track accounts, transactions, and balances from Handelsbanken.",
  },
  {
    title: "SJ Prio",
    href: "/sjprio",
    description:
      "Track and manage your SJ Prio membership points and benefits.",
  },
  {
    title: "Amex",
    href: "/amex",
    description: "Manage your American Express card transactions and balances.",
  },
];

// SVG Flag Components
const SwedenFlag = () => (
  <svg
    width="24"
    height="16"
    viewBox="0 0 24 16"
    className="rounded-sm border border-gray-600"
  >
    <rect width="24" height="16" fill="#006AA7" />
    <rect x="6" y="0" width="3" height="16" fill="#FECC00" />
    <rect x="0" y="6.5" width="24" height="3" fill="#FECC00" />
  </svg>
);

const BrazilFlag = () => (
  <svg
    width="24"
    height="16"
    viewBox="0 0 24 16"
    className="rounded-sm border border-gray-600"
  >
    <rect width="24" height="16" fill="#009739" />
    <polygon points="12,2 20,8 12,14 4,8" fill="#FEDD00" />
    <circle cx="12" cy="8" r="3.5" fill="#012169" />
  </svg>
);

// Define Brazil bank links
const BRbankLinks: { title: string; href: string; description: string }[] = [
  {
    title: "Inter",
    href: "/inter-account",
    description: "Track accounts, transactions, and balances from Inter.",
  },
  {
    title: "Clear",
    href: "/clear",
    description: "Track and manage your Clear membership points and benefits.",
  },
  {
    title: "Rico",
    href: "/rico",
    description: "Manage your Rico investments and portfolio.",
  },
];

// Define transaction links
const transactionLinks: { title: string; href: string; description: string }[] =
  [
    {
      title: "Transaction Tables",
      href: "/global_2",
      description: "View all financial transactions across all your accounts.",
    },
    {
      title: "Transaction Charts",
      href: "/global_2/chart",
      description: "Visualize spending patterns across all your accounts.",
    },
    {
      title: "Recurrent Expenses",
      href: "/recurrent",
      description: "Track and manage your recurring bills and subscriptions.",
    },
    {
      title: "Monthly Summary",
      href: "/monthly-summary",
      description: "View a detailed summary of your monthly financial data.",
    },
    // {
    //   title: "Family",
    //   href: "/family",
    //   description: "Manage family finances and shared expenses.",
    // },
  ];

export function DarkNavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="bg-[#121212] rounded-md gap-2">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-200 bg-[#121212] rounded-3xl hover:bg-black hover:bg-opacity-30 hover:text-green-400 data-[state=open]:bg-black data-[state=open]:bg-opacity-30 data-[state=open]:text-green-400">
            Bank Accounts
          </NavigationMenuTrigger>{" "}
          <NavigationMenuContent className="bg-[#1E1E1E] border border-gray-700">
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {" "}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <SwedenFlag />
                  Sweden
                </h3>
                <ul className="space-y-2">
                  {SEbankLinks.map((link) => (
                    <ListItem
                      key={link.title}
                      title={link.title}
                      href={link.href}
                    >
                      {link.description}
                    </ListItem>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <BrazilFlag />
                  Brazil
                </h3>
                <ul className="space-y-2">
                  {BRbankLinks.map((link) => (
                    <ListItem
                      key={link.title}
                      title={link.title}
                      href={link.href}
                    >
                      {link.description}
                    </ListItem>
                  ))}
                </ul>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-200 bg-[#121212] rounded-3xl hover:bg-black hover:bg-opacity-30 hover:text-green-400 data-[state=open]:bg-black data-[state=open]:bg-opacity-30 data-[state=open]:text-green-400">
            Transactions
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-[#1E1E1E] border border-gray-700">
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {transactionLinks.map((link) => (
                <ListItem key={link.title} title={link.title} href={link.href}>
                  {link.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>{" "}
        <NavigationMenuItem>
          <Link href="/upload" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "text-gray-200 bg-[#121212] rounded-3xl hover:bg-black hover:bg-opacity-30 hover:text-green-400",
              )}
            >
              Upload Files
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>{" "}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-200 bg-[#121212] rounded-3xl hover:bg-black hover:bg-opacity-30 hover:text-green-400 data-[state=open]:bg-black data-[state=open]:bg-opacity-30 data-[state=open]:text-green-400">
            Email Tools
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-[#1E1E1E] border border-gray-700">
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px]">
              <ListItem title="Email Client" href="/email-client">
                Browse and manage your Gmail exports with a user-friendly
                interface.
              </ListItem>
              <ListItem title="Email Merge Tool" href="/email-merge">
                Merge multiple Gmail export JSON files into a single file with
                duplicate removal.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-black hover:bg-opacity-30 hover:text-green-400",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-gray-200">
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-400">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
