"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail } from "lucide-react";

export default function PendingApproval() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 p-3">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Pending Approval</CardTitle>
          <CardDescription>
            Your agent account is awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Hi {session?.user?.name},</p>
            <p className="mt-2">
              Your agent account has been created but requires approval from an administrator before you can access the agent dashboard.
            </p>
            <p className="mt-2">
              You will receive an email notification once your account is approved.
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Your Email:</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{session?.user?.email}</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}