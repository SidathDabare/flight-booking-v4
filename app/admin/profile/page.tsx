"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
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
import { ClientNavbar } from "@/components/client ui/ClientNavbar";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Mail,
  Shield,
  CalendarDays,
  Crown,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  profileImage?: string | null;
  createdAt: string;
}

export default function AdminProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");

  const fetchProfile = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/unauthorized");
      return;
    }

    fetchProfile();
  }, [session, status, router, fetchProfile]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
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
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data.user);
      await update({ name });

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
    if (profile) {
      setProfile({ ...profile, profileImage: imageUrl });
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientNavbar />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Crown className="h-8 w-8 text-yellow-500" />
            Administrator Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your admin account settings and profile information
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload and manage your profile image
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ProfileImageUpload
                currentImage={profile?.profileImage}
                onImageUpdate={handleImageUpdate}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact system administrator if you
                  need to update it.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setName(profile?.name || "")}
                  disabled={isSaving}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Administrator Information</CardTitle>
            <CardDescription>
              Your admin account details and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Admin ID</div>
                  <div className="text-xs text-muted-foreground">
                    {profile?._id}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <Badge
                    variant="default"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Administrator
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Status</p>
                  <p className="text-xs text-green-600">Verified</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Admin Since</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator Privileges
              </CardTitle>
              <CardDescription>
                Current permissions and access levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Management</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Agent Approvals</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Settings</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reports & Analytics</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
