"use client";

import Image from "next/image";
import { getInitials } from "@/lib/auth-utils";

interface UserAvatarProps {
  user?: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

/**
 * User avatar component with fallback to initials
 * 
 * @example
 * ```tsx
 * <UserAvatar user={session.user} size="md" />
 * ```
 */
export function UserAvatar({ user, size = "md", className = "" }: UserAvatarProps) {
  const initials = getInitials(user?.name || user?.email);

  if (user?.image) {
    return (
      <div className={`relative overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}>
        <Image
          src={user.image}
          alt={user.name || user.email || "User"}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
