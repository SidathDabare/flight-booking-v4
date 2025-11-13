"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [userRole, setUserRole] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Verify the email token
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setIsApproved(data.isApproved);
          setUserRole(data.role);
          
          if (data.isApproved) {
            setMessage('Email verified successfully! Your account is now active and you can sign in.');
          } else {
            setMessage('Email verified successfully! Your account is pending admin approval.');
          }
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed. Please try again or contact support.');
      });
  }, [searchParams]);

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
            <CardDescription>
              {status === 'loading' && 'Verifying your email address...'}
              {status === 'success' && 'Verification Complete'}
              {status === 'error' && 'Verification Failed'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                
                <p className="text-green-700 font-medium">{message}</p>
                
                {userRole === 'agent' && !isApproved && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> As an agent, your account requires admin approval. 
                      You will receive an email notification once your account is approved.
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {isApproved && (
                    <Button 
                      onClick={handleSignIn} 
                      className="w-full"
                    >
                      Sign In Now
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleGoHome} 
                    variant="outline" 
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-red-100 p-3">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                </div>
                
                <p className="text-red-700 font-medium">{message}</p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    If you continue having problems, please contact our support team or try registering again.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/auth/register')} 
                    className="w-full"
                  >
                    Register Again
                  </Button>
                  
                  <Button 
                    onClick={handleGoHome} 
                    variant="outline" 
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}