"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileImageUpload } from "@/components/ui/profile-image-upload";
import { ProfileSkeleton } from "@/components/ui/profile-skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Shield,
  CalendarDays,
  CheckCircle2,
  Plane,
  MessageSquare,
  ShoppingBag,
  Settings,
  Edit3,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string | null;
  createdAt: string;
}

export default function ClientProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "client") {
      router.push("/unauthorized");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/profile`);

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data.user);
        setName(data.user.name);
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, status, router, toast]);

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();

    // Validation
    if (!trimmedName) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length < 2) {
      toast({
        title: "Validation Error",
        description: "Name must be at least 2 characters long",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length > 100) {
      toast({
        title: "Validation Error",
        description: "Name must not exceed 100 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data.user);
      setName(data.user.name);
      await update({ name: data.user.name });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpdate = (imageUrl: string | null) => {
    setProfile((prev) => (prev ? { ...prev, profileImage: imageUrl } : null));
  };

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return name !== (profile?.name || "");
  }, [name, profile?.name]);

  if (status === "loading" || isLoading) {
    return <ProfileSkeleton />;
  }

  if (!session || session.user.role !== "client") {
    return null;
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20">
      {/* Animated Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-tl from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        {/* Ultra Modern Hero Header */}
        <div className="mb-10">
          <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-white/20 shadow-2xl shadow-blue-500/10 p-8 overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar with Modern Ring */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/50 dark:ring-slate-800/50 shadow-xl transform transition-all duration-300 group-hover:scale-105">
                  <ProfileImageUpload
                    currentImage={profile?.profileImage}
                    onImageUpdate={handleImageUpdate}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    {getGreeting()},{" "}
                    {profile?.name?.split(" ")[0] || "Traveler"}! ✨
                  </span>
                </div>
                <h1
                  className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white mb-4"
                  role="heading"
                  aria-level={1}
                >
                  {profile?.name || "My Profile"}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 border-0 text-white shadow-lg shadow-blue-500/30">
                    <Shield className="w-3.5 h-3.5" />
                    Client
                  </Badge>
                  <Badge className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 border-0 text-white shadow-lg shadow-green-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </Badge>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-sm">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions with Glassmorphism */}
            <div className="relative backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Manage your travel experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-slate-200/50 dark:border-slate-700/50 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-transparent transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-blue-500/25"
                  asChild
                >
                  <Link href="/">
                    <Plane className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Search Flights
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-slate-200/50 dark:border-slate-700/50 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-purple-500/25"
                  asChild
                >
                  <a href="/client/orders">
                    <ShoppingBag className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    My Bookings
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-slate-200/50 dark:border-slate-700/50 hover:bg-gradient-to-r hover:from-pink-500 hover:to-pink-600 hover:text-white hover:border-transparent transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-pink-500/25"
                  asChild
                >
                  <a href="/client/messages">
                    <MessageSquare className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Messages
                  </a>
                </Button>
              </CardContent>
            </div>

            {/* Account Details with Modern Design */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/70 to-blue-50/70 dark:from-slate-900/70 dark:to-blue-950/70 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 pointer-events-none" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {profile?.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      User ID
                    </div>
                    <div className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                      {profile?._id}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          {/* Right Column - Profile Form with Ultra Modern Design */}
          <div className="lg:col-span-2 relative backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-blue-50/40 to-purple-50/40 dark:from-slate-900/40 dark:via-blue-950/40 dark:to-purple-950/40 pointer-events-none" />

            <CardHeader className="relative z-10 border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Edit3 className="w-5 h-5 text-white" />
                    </div>
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                    Update your personal details
                  </CardDescription>
                </div>
                {hasChanges && (
                  <div className="animate-bounce">
                    <Badge className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 border-0 text-white shadow-lg shadow-amber-500/30">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Unsaved changes
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10 p-8">
              <div className="space-y-3">
                <Label
                  htmlFor="name"
                  className="text-base font-semibold text-slate-700 dark:text-slate-300"
                >
                  Full Name
                </Label>
                <div className="relative group">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={100}
                    aria-label="Full Name"
                    aria-required="true"
                    className="text-base h-14 pr-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-sm hover:shadow-md"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {name.length}/100
                  </span>
                </div>
                {name.length > 80 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl animate-in slide-in-from-top-1">
                    <span className="text-lg">⚠️</span>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Approaching character limit
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-base font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="h-14 text-base pr-24 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl cursor-not-allowed"
                    aria-label="Email Address"
                    aria-readonly="true"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge className="gap-1.5 px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 border-0 text-white shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Email cannot be changed. Contact support if needed.
                  </div>
                </div>
              </div>

              <Separator className="my-4 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving || !hasChanges}
                  aria-label={
                    isSaving ? "Saving profile changes" : "Save profile changes"
                  }
                  className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving</span>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setName(profile?.name || "")}
                  disabled={isSaving || !hasChanges}
                  aria-label="Reset name to original value"
                  className="h-14 text-base font-semibold border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                  size="lg"
                >
                  Reset
                </Button>
              </div>

              {hasChanges && (
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      You have unsaved changes
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Remember to save your changes before leaving this page.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </div>

        {/* Ultra Modern Travel Summary */}
        <div className="mt-8 relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200">
                  Travel Summary
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Your travel activity at a glance
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Bookings Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-slate-800/80 dark:to-blue-950/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Total Bookings
                    </p>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
                    0
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    All time
                  </p>
                </div>
              </div>

              {/* Messages Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-purple-50/80 dark:from-slate-800/80 dark:to-purple-950/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Messages
                    </p>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600">
                    0
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    Unread
                  </p>
                </div>
              </div>

              {/* Account Status Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-green-50/80 dark:from-slate-800/80 dark:to-green-950/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-200/50 dark:border-green-800/50 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-full blur-2xl group-hover:bg-green-400/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Account Status
                    </p>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                    Active
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    Verified
                  </p>
                </div>
              </div>

              {/* Member Since Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-white/80 to-pink-50/80 dark:from-slate-800/80 dark:to-pink-950/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-400/10 rounded-full blur-2xl group-hover:bg-pink-400/20 transition-all" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Member Since
                    </p>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-pink-800 dark:from-pink-400 dark:to-pink-600">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    {profile?.createdAt
                      ? `${Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
