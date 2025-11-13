"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, MessageSquare, User, CheckCircle, Search, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { AdminMessageThreadDialog } from "./admin-message-thread-dialog";

interface Message {
  _id: string;
  subject: string;
  content: string;
  status: "pending" | "accepted" | "resolved" | "closed";
  senderName: string;
  senderEmail: string;
  senderRole: string;
  assignedToName?: string;
  assignedTo?: string;
  createdAt: string;
  replies: any[];
}

export function AdminMessagesInbox() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMessages = useCallback(async (silent = false) => {
    try {
      const response = await fetch("/api/messages");

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages || []);
        filterMessages(data.messages || [], activeTab);
      } else {
        throw new Error(data.error || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, activeTab]);

  const filterMessages = (msgs: Message[], tab: string, query: string = searchQuery) => {
    let filtered = msgs;

    // Filter by tab
    if (tab === "pending") {
      filtered = msgs.filter((m) => m.status === "pending");
    } else if (tab === "accepted") {
      filtered = msgs.filter((m) => m.status === "accepted");
    } else if (tab === "resolved") {
      filtered = msgs.filter((m) => m.status === "resolved" || m.status === "closed");
    }

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter((m) =>
        m.subject.toLowerCase().includes(query.toLowerCase()) ||
        m.content.toLowerCase().includes(query.toLowerCase()) ||
        m.senderName.toLowerCase().includes(query.toLowerCase()) ||
        m.senderEmail.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    filterMessages(messages, tab);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    filterMessages(messages, activeTab, query);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleCloseThread = () => {
    setSelectedMessage(null);
    fetchMessages(); // Refresh to get latest updates
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      accepted: { label: "In Progress", variant: "default" as const },
      resolved: { label: "Resolved", variant: "outline" as const },
      closed: { label: "Closed", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPendingCount = () => messages.filter((m) => m.status === "pending").length;
  const getAcceptedCount = () => messages.filter((m) => m.status === "accepted").length;
  const getResolvedCount = () => messages.filter((m) => m.status === "resolved" || m.status === "closed").length;

  useEffect(() => {
    fetchMessages();
  }, []);

  // Optimized polling with idle detection and adaptive intervals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let lastActivityTime = Date.now();
    const IDLE_POLLING_INTERVAL = 60000; // 1 minute when idle
    const ACTIVE_POLLING_INTERVAL = 30000; // 30 seconds when active
    const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 minutes of inactivity

    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    const isUserIdle = () => {
      return Date.now() - lastActivityTime > IDLE_THRESHOLD;
    };

    const startPolling = () => {
      const currentInterval = isUserIdle() ? IDLE_POLLING_INTERVAL : ACTIVE_POLLING_INTERVAL;

      interval = setInterval(() => {
        if (!document.hidden) {
          fetchMessages(true); // Silent background polling
        }
      }, currentInterval);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateActivity();
        fetchMessages(true); // Silent refresh on tab focus
        clearInterval(interval);
        startPolling();
      } else {
        clearInterval(interval);
      }
    };

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      const wasIdle = isUserIdle();
      updateActivity();

      // Switch from idle to active interval
      if (wasIdle) {
        clearInterval(interval);
        startPolling();
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [fetchMessages]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-muted-foreground mt-1">
            Manage customer messages and inquiries
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getPendingCount()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              In Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{getAcceptedCount()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Resolved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getResolvedCount()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by subject, content, sender name or email..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Messages
            <Badge variant="secondary" className="ml-2">
              {messages.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {getPendingCount() > 0 && (
              <Badge variant="destructive" className="ml-2">
                {getPendingCount()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            In Progress
            {getAcceptedCount() > 0 && (
              <Badge variant="default" className="ml-2">
                {getAcceptedCount()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">
                  {searchQuery ? "No results found" : "No messages"}
                </CardTitle>
                <CardDescription>
                  {searchQuery
                    ? "Try adjusting your search query"
                    : activeTab === "pending"
                      ? "No pending messages at the moment"
                      : activeTab === "accepted"
                        ? "No messages in progress"
                        : activeTab === "resolved"
                          ? "No resolved messages"
                          : "No messages yet"
                  }
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map((message) => (
              <Card
                key={message._id}
                className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200"
                onClick={() => handleViewMessage(message)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base md:text-lg truncate">{message.subject}</CardTitle>
                        {getStatusBadge(message.status)}
                      </div>
                      <CardDescription className="text-xs md:text-sm">
                        <span className="font-medium">{message.senderName}</span>
                        <span className="hidden md:inline"> ({message.senderEmail})</span>
                      </CardDescription>
                      <CardDescription className="text-xs">
                        {format(new Date(message.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {message.content}
                  </p>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
                      {message.assignedToName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="truncate">Assigned: {message.assignedToName}</span>
                        </div>
                      )}
                      {message.replies.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMessage(message);
                      }}
                      className="w-full md:w-auto"
                    >
                      {message.status === "pending" ? "Accept & View" : "View Thread"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {selectedMessage && (
        <AdminMessageThreadDialog
          message={selectedMessage}
          open={!!selectedMessage}
          onClose={handleCloseThread}
        />
      )}
    </div>
  );
}
