'use client';
import Link from "next/link";
import MaxWidthWrapper from "../MaxWidthWrapper";
import { buttonVariants } from "./button";
import {RegisterLink, LoginLink} from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight } from "lucide-react";
const Navbar = () => {
  return (
    <nav className="sticky top-0 inset-x-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg">
      <MaxWidthWrapper className="flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center font-semibold text-xl">
          <span>semanticPDF.</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden sm:flex items-center space-x-4">
          <Link
            href="/pricing"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Pricing
          </Link>
          <LoginLink
            className={buttonVariants({
                variant: 'ghost',
                size: 'sm'
            })}
          >Sign in</LoginLink>
          <RegisterLink
            className={buttonVariants({
                size: 'sm'
            })}
          >
            Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
          </RegisterLink>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <button
            aria-label="Open menu"
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            {/* Simple hamburger icon */}
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
