"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Calendar,
  Mail,
  User,
  Shield,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "agent" | "admin";
  isApproved: boolean;
  createdAt: string;
  emailVerified?: string;
}

interface PendingApprovalsProps {
  pendingUsers: User[];
  onUserUpdate: () => void;
}

export function PendingApprovals({
  pendingUsers,
  onUserUpdate,
}: PendingApprovalsProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const approveAgent = async (userId: string) => {
    setIsLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Agent approved successfully. Notification email sent.",
        });
        onUserUpdate();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to approve agent",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while approving agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const rejectAgent = async (userId: string) => {
    setIsLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "PATCH",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Agent application rejected. Notification email sent.",
        });
        onUserUpdate();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to reject agent",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while rejecting agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const filteredUsers = pendingUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pending Agent Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve agent applications. Only verified agents can
            access booking management features.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="px-3 py-1">
            {filteredUsers.length} pending
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Pending Users Grid */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Pending Approvals</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "No agent applications match your search criteria."
                : "All agent applications have been reviewed."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Agent</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Applied {getTimeSince(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">Pending</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-sm">
                  <Badge
                    variant={user.emailVerified ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {user.emailVerified ? "Email Verified" : "Email Pending"}
                  </Badge>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="DialogTitle">
                          Review Agent Application
                        </DialogTitle>
                        <DialogDescription>
                          Detailed information about the agent application
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Full Name
                            </label>
                            <p className="font-medium">{user.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Email
                            </label>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Role{" "}
                            </label>
                            <Badge variant="secondary"> {user.role}</Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Email Status
                            </label>{" "}
                            <Badge
                              variant={
                                user.emailVerified ? "default" : "destructive"
                              }
                            >
                              {" "}
                              {user.emailVerified ? "Verified" : "Pending"}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Applied On
                          </label>
                          <p className="font-medium">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>

                        <div className="flex space-x-2 pt-4">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to approve ${user.name} as an agent? They will gain access to booking management features and receive an approval email.`
                                )
                              ) {
                                approveAgent(user._id);
                              }
                            }}
                            disabled={isLoading === user._id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {isLoading === user._id
                              ? "Approving..."
                              : "Approve"}
                          </Button>

                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to reject ${user.name}'s agent application? This action cannot be undone and they will receive a rejection email.`
                                )
                              ) {
                                rejectAgent(user._id);
                              }
                            }}
                            disabled={isLoading === user._id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {isLoading === user._id ? "Rejecting..." : "Reject"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
