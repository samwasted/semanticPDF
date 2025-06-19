// components/UserAccountNav.tsx
"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./dropdown-menu";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import Link from "next/link";
import { Gem } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

interface UserAccountNavProps {
  email?: string;
  name: string;
}

export default function UserAccountNav({
  email,
  name,
}: UserAccountNavProps) {
  // Generate user initials (first two letters) for fallback
  const getInitials = (fullName: string) =>
    fullName
      .split(" ")
      .map((segment) => segment[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full h-8 w-8 bg-slate-400">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-slate-300 text-xs font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-white">
        <div className="p-2 flex flex-col gap-1">
          <span className="font-medium text-sm text-black">{name}</span>
          {email && (
            <span className="truncate text-xs text-zinc-700 w-48">
              {email}
            </span>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pricing">
            Upgrade <Gem className="ml-1.5 h-4 w-4 text-blue-600" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
