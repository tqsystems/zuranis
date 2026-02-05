import { Header } from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent lg:text-6xl">
              Releason
            </h1>
            <p className="text-xl text-gray-600 mb-4 lg:text-2xl font-semibold">
              Ship confident. Ship informed.
            </p>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Not zero risk. <span className="font-bold text-green-400">Acceptable risk.</span> Know the difference before you deploy.   
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-[#667eea] px-8 py-3 text-base font-medium text-[#667eea] transition-all hover:bg-[#667eea] hover:text-white"
                >
                  Documentation
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  Get Started
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-[#667eea] px-8 py-3 text-base font-medium text-[#667eea] transition-all hover:bg-[#667eea] hover:text-white"
                >
                  View on GitHub
                </a>
              </div>
            )}

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Test Coverage</h3>
                <p className="text-sm text-gray-600">
                  Track coverage across features and identify gaps before they become issues.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Risk Analysis</h3>
                <p className="text-sm text-gray-600">
                  Get real-time insights into potential risks and their impact on your release.
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ship Faster</h3>
                <p className="text-sm text-gray-600">
                  Make confident decisions and reduce time to production with data-driven insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
