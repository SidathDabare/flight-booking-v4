"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, XCircle, Lightbulb, User, Briefcase, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculatePasswordStrength, generateStrongPassword } from "@/lib/password-utils";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function SignUp() {
  const t = useTranslations("auth.signup");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client" as "client" | "agent",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Calculate password strength in real-time
  const passwordStrength = useMemo(() => {
    if (!formData.password) {
      return null;
    }
    return calculatePasswordStrength(formData.password);
  }, [formData.password]);

  // Generate password suggestion
  const suggestedPassword = useMemo(() => {
    if (passwordStrength && passwordStrength.score < 5) {
      return generateStrongPassword(formData.password);
    }
    return null;
  }, [formData.password, passwordStrength]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate password strength
    if (passwordStrength && passwordStrength.score < 4) {
      toast({
        title: t("error.weakPassword.title"),
        description: t("error.weakPassword.description"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("error.passwordMismatch.title"),
        description: t("error.passwordMismatch.description"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistrationSuccess(true);
      } else {
        toast({
          title: t("error.registrationFailed.title"),
          description: data.error || t("error.registrationFailed.description"),
          variant: "destructive",
        });
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

  if (registrationSuccess) {
    return (
      <div className="container mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-green-600">{t("success.title")}</CardTitle>
              <CardDescription className="mt-2">
                {t("success.description")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-sm text-green-800">
                <p className="font-medium mb-1">{t("success.email.verify")}</p>
                <p>{t("success.email.sent")}</p>
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Link href="/auth/signin" className="block">
                <Button className="w-full" size="lg">
                  {t("success.button")}
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                {t("success.email.spam")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Label htmlFor="name">{t("form.name.label")}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t("form.name.placeholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("form.email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("form.email.placeholder")}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("form.password.label")}</Label>
              <PasswordInput
                id="password"
                placeholder={t("form.password.placeholder")}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />

              {/* Password Strength Indicator */}
              {formData.password && passwordStrength && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("form.passwordStrength.label")}</span>
                    <span className={`font-semibold ${
                      passwordStrength.label === "Weak" ? "text-red-600" :
                      passwordStrength.label === "Fair" ? "text-orange-600" :
                      passwordStrength.label === "Good" ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {passwordStrength.label === "Weak" ? t("form.passwordStrength.weak") :
                       passwordStrength.label === "Fair" ? t("form.passwordStrength.fair") :
                       passwordStrength.label === "Good" ? t("form.passwordStrength.good") :
                       t("form.passwordStrength.strong")}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>

                  {/* Validation Requirements */}
                  <div className="space-y-1 text-xs">
                    {passwordStrength.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-1 text-red-600">
                        <XCircle className="h-3 w-3" />
                        <span>{issue}</span>
                      </div>
                    ))}
                    {passwordStrength.score >= 4 && passwordStrength.issues.length === 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{t("form.passwordValidation.success")}</span>
                      </div>
                    )}
                  </div>

                  {/* Password Suggestion Alert */}
                  {suggestedPassword && passwordStrength.score < 5 && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm">
                        <div className="space-y-2">
                          <p className="font-semibold text-blue-900">{t("form.passwordSuggestion.heading")}</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white px-3 py-2 rounded border text-blue-900 font-mono text-xs break-all">
                              {suggestedPassword}
                            </code>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  password: suggestedPassword,
                                  confirmPassword: suggestedPassword
                                });
                                toast({
                                  title: t("success.passwordApplied.title"),
                                  description: t("success.passwordApplied.description"),
                                });
                              }}
                              className="shrink-0 text-xs"
                            >
                              {t("form.passwordSuggestion.button")}
                            </Button>
                          </div>
                          <ul className="text-xs text-blue-800 space-y-1 ml-1">
                            {passwordStrength.suggestions.map((suggestion, index) => (
                              <li key={index}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="confirmPassword">{t("form.confirmPassword.label")}</Label>
                {formData.confirmPassword && (
                  formData.password === formData.confirmPassword ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t("form.confirmPassword.match")}
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {t("form.confirmPassword.mismatch")}
                    </span>
                  )
                )}
              </div>
              <PasswordInput
                id="confirmPassword"
                placeholder={t("form.confirmPassword.placeholder")}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-3">
              <Label>{t("form.role.label")}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "client" })}
                  className={cn(
                    "relative flex flex-col items-start p-4 border-2 rounded-lg transition-all hover:border-primary/50",
                    formData.role === "client"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t("form.role.client.label")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {t("form.role.client.description")}
                  </p>
                  {formData.role === "client" && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "agent" })}
                  className={cn(
                    "relative flex flex-col items-start p-4 border-2 rounded-lg transition-all hover:border-primary/50",
                    formData.role === "agent"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{t("form.role.agent.label")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {t("form.role.agent.description")}
                  </p>
                  {formData.role === "agent" && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t("button.loading") : t("button.submit")}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm border-t pt-6">
            <span className="text-muted-foreground">{t("link.signin.prompt")}</span>{" "}
            <Link href="/auth/signin" className="text-primary font-semibold hover:underline">
              {t("link.signin.text")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}