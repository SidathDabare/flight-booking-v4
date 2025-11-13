"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Hi {session?.user?.name},</p>
            <p className="mt-2">
              You don&apos;t have the required permissions to access this section of the application.
            </p>
            <p className="mt-2">
              Your current role: <span className="font-medium capitalize">{session?.user?.role}</span>
            </p>
          </div>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}