'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import LoginForm from '@/components/login-form';
import { Plane } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Plane className="h-12 w-12 text-sky-600 animate-bounce" />
          <p className="mt-4 text-sky-800">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <div className="flex justify-center">
                <Plane className="h-12 w-12 text-sky-600" />
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                Paragliding Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Track and analyze your DHV-XC flights with detailed statistics and insights
              </p>
            </div>

            <div className="bg-white shadow-xl rounded-lg p-6 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Sign in to your DHV-XC Account
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Connect securely with your DHV-XC credentials
                </p>
              </div>
              <LoginForm />
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                Your credentials are securely transmitted directly to DHV-XC.
                We never store your password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}