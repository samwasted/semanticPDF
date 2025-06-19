// components/UserAccountNav.tsx
"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import Link from "next/link";
import { Gem } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { Icons } from "./Icons";

interface UserAccountNavProps {
  email?: string;
  name: string;
  imageUrl?: string;
}

export default function UserAccountNav({
  email,
  name,
  imageUrl,
}: UserAccountNavProps) {
  // Helper to generate initials
  const getUserInitials = (fullName: string) =>
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Use imageUrl as key to force <AvatarImage> remount on URL change
  const avatarKey = imageUrl || "no-image";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full h-8 w-8 aspect-square bg-slate-400">
          <Avatar key={avatarKey} className="relative w-8 h-8">
            {imageUrl ? (
              <AvatarImage
                key={avatarKey}
                src={imageUrl}
                alt={`${name}'s avatar`}
                className="object-cover w-full h-full"
              />
            ) : null}
            <AvatarFallback delayMs={0} className="bg-slate-300 text-xs font-medium text-slate-700">
              {getUserInitials(name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col leading-none">
            <p className="font-medium text-sm text-black">{name}</p>
            {email && (
              <p className="truncate text-xs text-zinc-700 w-48">{email}</p>
            )}
          </div>
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

        <DropdownMenuItem className="cursor-pointer">
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
