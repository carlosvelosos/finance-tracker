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
} from "@/components/ui/navigation-menu";

// Define bank links
const bankLinks: { title: string; href: string; description: string }[] = [
  {
    title: "SJ Prio",
    href: "/sjprio",
    description:
      "Track and manage your SJ Prio membership points and benefits.",
  },
  {
    title: "SJ Prio Chart",
    href: "/sjprio/chart",
    description:
      "Visualize your SJ Prio points over time with detailed charts.",
  },
  {
    title: "Amex",
    href: "/amex",
    description: "Manage your American Express card transactions and balances.",
  },
  {
    title: "Amex Chart",
    href: "/amex/chart",
    description:
      "View graphical representations of your Amex spending patterns.",
  },
  {
    title: "Handelsbanken",
    href: "/handelsbanken",
    description:
      "Track accounts, transactions, and balances from Handelsbanken.",
  },
  {
    title: "Handelsbanken Overview",
    href: "/handelsbanken/overview/chart",
    description: "View comprehensive charts for your Handelsbanken accounts.",
  },
];

// Define transaction links
const transactionLinks: { title: string; href: string; description: string }[] =
  [
    {
      title: "All Transactions",
      href: "/global",
      description: "View all financial transactions across all your accounts.",
    },
    {
      title: "Transaction Charts",
      href: "/global/chart",
      description: "Visualize spending patterns across all your accounts.",
    },
    {
      title: "Recurrent Expenses",
      href: "/recurrent",
      description: "Track and manage your recurring bills and subscriptions.",
    },
    {
      title: "Family",
      href: "/family",
      description: "Manage family finances and shared expenses.",
    },
  ];

export function DarkNavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="bg-[#121212] gap-2">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-gray-200 bg-[#121212] rounded-3xl hover:bg-black hover:bg-opacity-30 hover:text-green-400 data-[state=open]:bg-black data-[state=open]:bg-opacity-30 data-[state=open]:text-green-400">
            Bank Accounts
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-[#1E1E1E] border border-gray-700">
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {bankLinks.map((link) => (
                <ListItem key={link.title} title={link.title} href={link.href}>
                  {link.description}
                </ListItem>
              ))}
            </ul>
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
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/upload" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "text-gray-200 bg-[#121212] rounded-3xl hover:bg-black hover:bg-opacity-30 hover:text-green-400"
              )}
            >
              Upload Files
            </NavigationMenuLink>
          </Link>
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
            className
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
