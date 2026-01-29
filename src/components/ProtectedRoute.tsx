"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Client-side route protection component
 * 
 * Wrap your components with this to require authentication.
 * Users will be redirected to the sign-in page if not authenticated.
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <MyProtectedContent />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = "/auth/signin",
  loadingComponent,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentUrl = window.location.pathname + window.location.search;
      const callbackUrl = encodeURIComponent(currentUrl);
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`);
    }
  }, [status, router, redirectTo]);

  if (status === "loading") {
    return (
      <>
        {loadingComponent || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
