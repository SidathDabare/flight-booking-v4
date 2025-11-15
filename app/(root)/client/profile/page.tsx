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
  Shield,
  CalendarDays,
  CheckCircle2,
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
    <div className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {profile?.name?.split(" ")[0] || "Traveler"}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your profile and travel preferences
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Image Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-slate-200 dark:ring-slate-700">
                    <ProfileImageUpload
                      currentImage={profile?.profileImage}
                      onImageUpdate={handleImageUpdate}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">Role</span>
                  </div>
                  <Badge>Client</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Edit3 className="w-5 h-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Update your personal details
                    </CardDescription>
                  </div>
                  {hasChanges && (
                    <Badge variant="secondary" className="gap-1.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      Unsaved changes
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={100}
                    aria-label="Full Name"
                    aria-required="true"
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {name.length}/100
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="pr-20"
                    aria-label="Email Address"
                    aria-readonly="true"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge variant="outline" className="gap-1 text-xs bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving || !hasChanges}
                  className="flex-1"
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setName(profile?.name || "")}
                  disabled={isSaving || !hasChanges}
                  size="lg"
                >
                  Reset
                </Button>
              </div>

              {hasChanges && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    You have unsaved changes
                  </p>
                </div>
              )}
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
