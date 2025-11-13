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
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  AlertCircle,
  Clock,
  Eye,
  Calendar,
  Mail,
  User,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "agent" | "admin";
  isApproved: boolean;
  createdAt: string;
  emailVerified?: string;
}

interface UserManagementProps {
  users: User[];
  onUserUpdate: () => void;
}

type SortField = "name" | "email" | "role" | "createdAt";
type SortOrder = "asc" | "desc";

export function UserManagement({ users, onUserUpdate }: UserManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
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

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        onUserUpdate();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting user",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <SortAsc className="ml-1 h-4 w-4" />
    ) : (
      <SortDesc className="ml-1 h-4 w-4" />
    );
  };

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

  // Get pending agents
  const pendingAgents = users.filter(
    (user) => user.role === "agent" && !user.isApproved
  );
  const pendingAgentsCount = pendingAgents.length;

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && user.isApproved) ||
        (statusFilter === "pending" && !user.isApproved);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="p-6 space-y-6">
      {/* Pending Agent Approvals Section */}
      {pendingAgentsCount > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    Pending Agent Approvals
                    <Badge variant="secondary" className="font-medium">
                      {pendingAgentsCount}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Review and approve agent applications to grant system access
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {pendingAgents.map((agent) => (
                <div
                  key={agent._id}
                  className="group relative rounded-2xl p-6 border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-sm flex items-center justify-center shadow-lg border border-blue-500">
                            <User className="h-4 w-4" />
                          </div>
                          {/* <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full flex items-center justify-center border">
                            <Clock className="h-2.5 w-2.5 text-blue-500" />
                          </div> */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {agent.name}
                          </h4>
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="text-xs truncate">
                              {agent.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-medium">
                        Agent
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs">
                          <Calendar className="h-4 w-4" />
                          <span>Applied {getTimeSince(agent.createdAt)}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          Pending Review
                        </Badge>
                      </div>

                      <div className="flex items-center">
                        <Badge
                          variant={
                            agent.emailVerified ? "default" : "destructive"
                          }
                          className="text-xs font-medium"
                        >
                          <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
                          {agent.emailVerified
                            ? "Email Verified"
                            : "Email Pending"}
                        </Badge>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full font-medium transition-all duration-200 group"
                        >
                          <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                          Review & Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg shadow-2xl">
                        <DialogHeader className="pb-6">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                              Review Agent Application
                            </DialogTitle>
                          </div>
                          <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Review and approve or reject{" "}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {agent.name}&apos;s
                            </span>{" "}
                            agent application
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div className="rounded-xl p-4 space-y-4 border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                  Full Name
                                </label>
                                <p className="font-medium text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                  {agent.name}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                  Email Address
                                </label>
                                <p className="font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 truncate">
                                  {agent.email}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                  Requested Role
                                </label>
                                <Badge variant="outline">{agent.role}</Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                  Email Verification
                                </label>
                                <Badge
                                  variant={
                                    agent.emailVerified
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  <div className="w-2 h-2 rounded-full mr-1.5 bg-current" />
                                  {agent.emailVerified ? "Verified" : "Pending"}
                                </Badge>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Application Date
                              </label>
                              <p className="font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                {formatDate(agent.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <Button
                              className="flex-1 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                              variant="default"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to approve ${agent.name} as an agent? They will gain access to booking management features and receive an approval email.`
                                  )
                                ) {
                                  approveAgent(agent._id);
                                }
                              }}
                              disabled={isLoading === agent._id}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {isLoading === agent._id
                                ? "Approving..."
                                : "Approve Agent"}
                            </Button>

                            <Button
                              variant="destructive"
                              className="flex-1 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to reject ${agent.name}'s agent application? This action cannot be undone and they will receive a rejection email.`
                                  )
                                ) {
                                  rejectAgent(agent._id);
                                }
                              }}
                              disabled={isLoading === agent._id}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {isLoading === agent._id
                                ? "Rejecting..."
                                : "Reject Application"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedUsers.length} of {users.length} users
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {getSortIcon("role")}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Registered
                      {getSortIcon("createdAt")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "default"
                              : user.role === "agent"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isApproved ? "default" : "destructive"}
                        >
                          {user.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {user.role === "agent" && !user.isApproved && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Review & Approve
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle className="DialogTitle">
                                        Review Agent Application
                                      </DialogTitle>
                                      <DialogDescription>
                                        Review and approve or reject {user.name}
                                        &apos;s agent application
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">
                                            Full Name
                                          </label>
                                          <p className="font-medium">
                                            {user.name}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">
                                            Email
                                          </label>
                                          <p className="font-medium">
                                            {user.email}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">
                                            Role
                                          </label>
                                          <Badge variant="secondary">
                                            {user.role}
                                          </Badge>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">
                                            Email Status
                                          </label>
                                          <Badge
                                            variant={
                                              user.emailVerified
                                                ? "default"
                                                : "destructive"
                                            }
                                          >
                                            {user.emailVerified
                                              ? "Verified"
                                              : "Pending"}
                                          </Badge>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-gray-600">
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
                                          {isLoading === user._id
                                            ? "Rejecting..."
                                            : "Reject"}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteUser(user._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
