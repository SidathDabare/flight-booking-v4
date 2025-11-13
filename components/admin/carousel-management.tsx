"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CarouselImageUpload } from "./carousel-image-upload";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imagePublicId: string;
  isHidden: boolean;
  order: number;
  responsiveImages: {
    desktop: { url: string; width: number; height: number };
    tablet: { url: string; width: number; height: number };
    mobile: { url: string; width: number; height: number };
  };
  createdAt: string;
  updatedAt: string;
}

interface CarouselData {
  items: CarouselItem[];
  isEnabled: boolean;
}

export function CarouselManagement() {
  const [carouselData, setCarouselData] = useState<CarouselData>({
    items: [],
    isEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    imagePublicId: "",
    responsiveImages: null as any,
  });
  const { toast } = useToast();

  const fetchCarouselData = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/carousel");
      const data = await response.json();

      if (response.ok) {
        setCarouselData(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch carousel data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCarouselData();
  }, [fetchCarouselData]);

  const handleCreateItem = async () => {
    if (
      !newItem.title ||
      !newItem.subtitle ||
      !newItem.imageUrl ||
      !newItem.responsiveImages
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields and upload an image",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/carousel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const data = await response.json();

      if (response.ok) {
        setCarouselData((prev) => ({
          ...prev,
          items: [...prev.items, data.data],
        }));
        setNewItem({
          title: "",
          subtitle: "",
          imageUrl: "",
          imagePublicId: "",
          responsiveImages: null,
        });
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Carousel item created successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Create carousel item error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create carousel item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (
    itemId: string,
    updates: Partial<CarouselItem>
  ) => {
    try {
      const response = await fetch("/api/admin/carousel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, ...updates }),
      });

      const data = await response.json();

      if (response.ok) {
        setCarouselData((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        }));
        toast({
          title: "Success",
          description: "Carousel item updated successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update carousel item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this carousel item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/carousel?itemId=${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setCarouselData((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
        }));
        toast({
          title: "Success",
          description: "Carousel item deleted successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete carousel item",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = (itemId: string, isHidden: boolean) => {
    handleUpdateItem(itemId, { isHidden: !isHidden });
  };

  const openEditDialog = (item: CarouselItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingItem) return;

    handleUpdateItem(editingItem.id, {
      title: editingItem.title,
      subtitle: editingItem.subtitle,
    });
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carousel Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Carousel Management</CardTitle>
            {/* <CardDescription>
              Manage homepage carousel images and content
            </CardDescription> */}
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Carousel Item</DialogTitle>
                <DialogDescription>
                  Create a new carousel item with title, subtitle, and image.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter title"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={newItem.subtitle}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        subtitle: e.target.value,
                      }))
                    }
                    placeholder="Enter subtitle"
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <CarouselImageUpload
                    onImageUploaded={(imageData) =>
                      setNewItem((prev) => ({ ...prev, ...imageData }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateItem}>Create Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {carouselData.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No carousel items yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click &quot;Add Item&quot; to create your first carousel item.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {carouselData.items
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.responsiveImages.mobile.url}
                    alt={item.title}
                    className="h-16 w-24 rounded-md border object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.isHidden && (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleVisibility(item.id, item.isHidden)
                      }
                    >
                      {item.isHidden ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Carousel Item</DialogTitle>
            <DialogDescription>
              Update the title and subtitle for this carousel item.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingItem.title}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    )
                  }
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subtitle">Subtitle</Label>
                <Input
                  id="edit-subtitle"
                  value={editingItem.subtitle}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, subtitle: e.target.value } : null
                    )
                  }
                  maxLength={200}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
