"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

function SignInForm() {
  const t = useTranslations("auth.signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const callbackUrl = searchParams.get("callbackUrl");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = "";
        let nextStep = "";

        // Handle specific error messages from the auth provider
        if (result.error === "No account found with this email address") {
          errorMessage = t("error.noAccount.title");
          nextStep = t("error.noAccount.description");
        } else if (result.error === "Incorrect password") {
          errorMessage = t("error.incorrectPassword.title");
          nextStep = t("error.incorrectPassword.description");
        } else if (
          result.error === "Please verify your email before signing in"
        ) {
          errorMessage = t("error.unverifiedEmail.title");
          nextStep = t("error.unverifiedEmail.description");
        } else if (result.error === "Your account is pending approval") {
          errorMessage = t("error.pendingApproval.title");
          nextStep = t("error.pendingApproval.description");
        } else if (result.error === "Please enter both email and password") {
          errorMessage = t("error.missingFields.title");
          nextStep = t("error.missingFields.description");
        } else {
          // Fallback for any other NextAuth errors
          errorMessage = t("error.generic.title");
          nextStep = t("error.generic.description");
        }

        toast({
          title: errorMessage,
          description: nextStep,
          variant: "destructive",
        });
      } else {
        const session = await getSession();
        toast({
          title: t("success.title"),
          description: t("success.description"),
        });

        // Redirect to callback URL if present, otherwise redirect based on role
        if (callbackUrl) {
          router.push(decodeURIComponent(callbackUrl));
        } else {
          // Default role-based redirects
          if (session?.user?.role === "admin") {
            router.push("/admin");
          } else if (session?.user?.role === "agent") {
            if (session.user.isApproved) {
              router.push("/agent");
            } else {
              router.push("/pending-approval");
            }
          } else {
            router.push("/");
          }
        }
      }
    } catch (error) {
      toast({
        title: t("error.generic.title"),
        description: t("error.generic.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-bold">{t("title")}</CardTitle>
          <CardDescription className="text-base">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("form.email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("form.email.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("form.password.label")}</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t("form.password.forgot")}
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder={t("form.password.placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t("button.loading") : t("button.submit")}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm border-t pt-6">
            <span className="text-muted-foreground">{t("link.signup.prompt")}</span>{" "}
            <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
              {t("link.signup.text")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignIn() {
  const t = useTranslations("auth.signin");

  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex min-h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          </div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
