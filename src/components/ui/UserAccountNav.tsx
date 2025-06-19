// components/UserAccountNav.tsx
"use client"

import React, { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"  // Shadcn UI dropdown components [1]
import { Button } from "./button"               // Shadcn Button component [1]
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"  // Shadcn Avatar primitives [2]
import Link from "next/link"                    // Next.js Link component [3]
import { Gem } from "lucide-react"              // Icon component [4]
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"  // Kinde logout UI [5]
import { Icons } from "./Icons"                // Custom icon set [1]

interface UserAccountNavProps {
  email?: string
  name: string
  imageUrl?: string
}

export default function UserAccountNav({
  email,
  name,
  imageUrl,
}: UserAccountNavProps) {
  // Generate user initials
  const getInitials = (fullName: string) =>
    fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  // Track image load status manually
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    if (!imageUrl) {
      setIsLoaded(false)
      return
    }
    const img = new Image()
    img.src = imageUrl
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setIsLoaded(false)
  }, [imageUrl])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full h-8 w-8 bg-slate-400">
          <Avatar className="w-8 h-8">
            {/* Render image only when loaded */}
            {isLoaded ? (
              <AvatarImage
                src={imageUrl!}
                alt={`${name}'s avatar`}
                className="object-cover w-full h-full"
              />
            ) : null}
            {/* Always render fallback */}
            <AvatarFallback className="bg-slate-300 text-xs font-medium text-slate-700">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="p-2 flex items-center gap-2">
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
  )
}
