"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { AgentMessageThreadDialog } from "./agent-message-thread-dialog";

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

export function AgentMessagesInbox() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchMessages = useCallback(async () => {
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
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, activeTab]);

  const filterMessages = (msgs: Message[], tab: string) => {
    let filtered = msgs;

    if (tab === "pending") {
      filtered = msgs.filter((m) => m.status === "pending");
    } else if (tab === "myMessages") {
      filtered = msgs.filter((m) => m.assignedTo === session?.user?.id);
    } else if (tab === "all") {
      filtered = msgs;
    }

    setFilteredMessages(filtered);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    filterMessages(messages, tab);
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
  const getMyMessagesCount = () => messages.filter((m) => m.assignedTo === session?.user?.id).length;

  useEffect(() => {
    fetchMessages();
  }, []);

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
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {getPendingCount() > 0 && (
              <Badge variant="destructive" className="ml-2">
                {getPendingCount()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="myMessages">
            My Messages
            {getMyMessagesCount() > 0 && (
              <Badge variant="default" className="ml-2">
                {getMyMessagesCount()}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">
            All Messages
            <Badge variant="secondary" className="ml-2">
              {messages.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No messages</CardTitle>
                <CardDescription>
                  {activeTab === "pending" && "No pending messages at the moment"}
                  {activeTab === "myMessages" && "You haven't accepted any messages yet"}
                  {activeTab === "all" && "No messages yet"}
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map((message) => (
              <Card key={message._id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{message.subject}</CardTitle>
                      <CardDescription className="mt-1">
                        From: {message.senderName} ({message.senderEmail})
                      </CardDescription>
                      <CardDescription>
                        {format(new Date(message.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(message.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {message.assignedToName && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Assigned to: {message.assignedToName}</span>
                        </div>
                      )}
                      {message.replies.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMessage(message)}
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
        <AgentMessageThreadDialog
          message={selectedMessage}
          open={!!selectedMessage}
          onClose={handleCloseThread}
        />
      )}
    </div>
  );
}
