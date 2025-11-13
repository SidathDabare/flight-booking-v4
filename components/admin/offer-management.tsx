"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { OfferImageUpload } from "./offer-image-upload";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  Euro,
  Calendar,
} from "lucide-react";

interface Offer {
  _id: string;
  title: string;
  departureCity: string;
  arrivalCity: string;
  description: string;
  publishedDate: string;
  price: number;
  discount: number;
  expireDate: string;
  isHidden: boolean;
  imageUrl?: string;
  imagePublicId?: string;
  responsiveImages?: {
    desktop: { url: string; width: number; height: number };
    tablet: { url: string; width: number; height: number };
    mobile: { url: string; width: number; height: number };
  };
  createdAt: string;
  updatedAt: string;
}

interface OffersState {
  offers: Offer[];
  isEnabled: boolean;
}

export function OfferManagement() {
  const [offersState, setOffersState] = useState<OffersState>({
    offers: [],
    isEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [newOffer, setNewOffer] = useState({
    title: "",
    departureCity: "",
    arrivalCity: "",
    description: "",
    price: "",
    discount: "0",
    expireDate: "",
    imageUrl: "",
    imagePublicId: "",
    responsiveImages: null as any,
  });
  const { toast } = useToast();

  const fetchOffers = useCallback(async () => {
    try {
      const [offersResponse, settingsResponse] = await Promise.all([
        fetch("/api/admin/offers"),
        fetch("/api/admin/offers/settings"),
      ]);

      const [offersData, settingsData] = await Promise.all([
        offersResponse.json(),
        settingsResponse.json(),
      ]);

      if (offersResponse.ok && settingsResponse.ok) {
        setOffersState({
          offers: offersData.data,
          isEnabled: settingsData.data?.isEnabled ?? true, // Default to true if undefined
        });
      } else {
        // If settings fetch fails, still try to load offers with default enabled state
        if (offersResponse.ok) {
          setOffersState({
            offers: offersData.data,
            isEnabled: true, // Default to enabled
          });
        } else {
          throw new Error(
            offersData.error || settingsData.error || "Failed to fetch data"
          );
        }
      }
    } catch (error) {
      console.error("Fetch offers error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch offers",
        variant: "destructive",
      });
      // Set default state even on error
      setOffersState({
        offers: [],
        isEnabled: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleCreateOffer = async () => {
    if (
      !newOffer.title ||
      !newOffer.departureCity ||
      !newOffer.arrivalCity ||
      !newOffer.description ||
      !newOffer.price ||
      !newOffer.expireDate
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(newOffer.price);
    const discount = parseFloat(newOffer.discount);

    if (isNaN(price) || price < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast({
        title: "Validation Error",
        description: "Discount must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    const expireDate = new Date(newOffer.expireDate);
    if (expireDate <= new Date()) {
      toast({
        title: "Validation Error",
        description: "Expire date must be in the future",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newOffer,
          price,
          discount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOffersState((prev) => ({
          ...prev,
          offers: [data.data, ...prev.offers],
        }));
        setNewOffer({
          title: "",
          departureCity: "",
          arrivalCity: "",
          description: "",
          price: "",
          discount: "0",
          expireDate: "",
          imageUrl: "",
          imagePublicId: "",
          responsiveImages: null,
        });
        setIsCreateDialogOpen(false);
        toast({
          title: "Success",
          description: "Offer created successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Create offer error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create offer",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOffer = async (
    offerId: string,
    updates: Partial<Offer>
  ) => {
    try {
      const response = await fetch("/api/admin/offers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ offerId, ...updates }),
      });

      const data = await response.json();

      if (response.ok) {
        setOffersState((prev) => ({
          ...prev,
          offers: prev.offers.map((offer) =>
            offer._id === offerId ? { ...offer, ...updates } : offer
          ),
        }));
        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update offer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/offers?offerId=${offerId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setOffersState((prev) => ({
          ...prev,
          offers: prev.offers.filter((offer) => offer._id !== offerId),
        }));
        toast({
          title: "Success",
          description: "Offer deleted successfully",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = (offerId: string, isHidden: boolean) => {
    handleUpdateOffer(offerId, { isHidden: !isHidden });
  };

  const handleToggleOffersEnabled = async (enabled: boolean) => {
    try {
      const response = await fetch("/api/admin/offers/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEnabled: enabled }),
      });

      const data = await response.json();

      if (response.ok) {
        // Only update state after successful API call
        setOffersState((prev) => ({ ...prev, isEnabled: enabled }));
        toast({
          title: "Success",
          description: `Offers section ${enabled ? "enabled" : "disabled"}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update offers settings",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer({ ...offer });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingOffer) return;

    const price = parseFloat(editingOffer.price.toString());
    const discount = parseFloat(editingOffer.discount.toString());

    if (isNaN(price) || price < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast({
        title: "Validation Error",
        description: "Discount must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    const expireDate = new Date(editingOffer.expireDate);
    if (expireDate <= new Date()) {
      toast({
        title: "Validation Error",
        description: "Expire date must be in the future",
        variant: "destructive",
      });
      return;
    }

    handleUpdateOffer(editingOffer._id, {
      title: editingOffer.title,
      departureCity: editingOffer.departureCity,
      arrivalCity: editingOffer.arrivalCity,
      description: editingOffer.description,
      price,
      discount,
      expireDate: expireDate.toISOString(),
    });
    setIsEditDialogOpen(false);
    setEditingOffer(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expireDate: string) => {
    return new Date(expireDate) <= new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offer Management</CardTitle>
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
            <CardTitle>Offer Management</CardTitle>
            <CardDescription>
              Manage special offers and promotions
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="offers-enabled" className="text-sm">
                Enable Offers Section
              </Label>
              <Switch
                id="offers-enabled"
                checked={offersState.isEnabled}
                onCheckedChange={handleToggleOffersEnabled}
                disabled={isLoading}
              />
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Offer</DialogTitle>
                  <DialogDescription>
                    Create a new special offer for customers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={newOffer.title}
                        onChange={(e) =>
                          setNewOffer((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="e.g., Summer Special to London"
                        maxLength={150}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (EUR) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newOffer.price}
                        onChange={(e) =>
                          setNewOffer((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="299.99"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="departureCity">Departure City *</Label>
                      <Input
                        id="departureCity"
                        value={newOffer.departureCity}
                        onChange={(e) =>
                          setNewOffer((prev) => ({
                            ...prev,
                            departureCity: e.target.value,
                          }))
                        }
                        placeholder="e.g., Paris"
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="arrivalCity">Arrival City *</Label>
                      <Input
                        id="arrivalCity"
                        value={newOffer.arrivalCity}
                        onChange={(e) =>
                          setNewOffer((prev) => ({
                            ...prev,
                            arrivalCity: e.target.value,
                          }))
                        }
                        placeholder="e.g., London"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={newOffer.discount}
                        onChange={(e) =>
                          setNewOffer((prev) => ({
                            ...prev,
                            discount: e.target.value,
                          }))
                        }
                        placeholder="20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expireDate">Expire Date *</Label>
                      <Input
                        id="expireDate"
                        type="datetime-local"
                        value={newOffer.expireDate}
                        onChange={(e) =>
                          setNewOffer((prev) => ({
                            ...prev,
                            expireDate: e.target.value,
                          }))
                        }
                        className="[color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newOffer.description}
                      onChange={(e) =>
                        setNewOffer((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the offer details..."
                      rows={3}
                      maxLength={500}
                    />
                    <div className="text-right text-xs text-muted-foreground">
                      {newOffer.description.length}/500
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Image (Optional)</Label>
                    <OfferImageUpload
                      onImageUploaded={(imageData) =>
                        setNewOffer((prev) => ({ ...prev, ...imageData }))
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
                  <Button onClick={handleCreateOffer}>Create Offer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {offersState.offers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No offers yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click &quot;Add Offer&quot; to create your first offer.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {offersState.offers.map((offer) => (
              <div
                key={offer._id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                {offer.responsiveImages?.mobile.url || offer.imageUrl ? (
                  <Image
                    src={
                      offer.responsiveImages?.mobile.url ||
                      offer.imageUrl ||
                      "/placeholder.png"
                    }
                    alt={offer.title}
                    width={96}
                    height={64}
                    className="h-16 w-24 rounded-md border object-cover"
                  />
                ) : (
                  <div className="h-16 w-24 rounded-md border bg-muted flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{offer.title}</h4>
                    <div className="flex gap-1">
                      {offer.isHidden && (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                      {isExpired(offer.expireDate) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      {offer.discount > 0 && (
                        <Badge variant="outline">-{offer.discount}%</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {offer.departureCity} → {offer.arrivalCity}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {formatPrice(offer.price)}
                      {offer.discount > 0 && (
                        <span className="text-green-600">
                          (Save{" "}
                          {formatPrice((offer.price * offer.discount) / 100)})
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Expires {formatDate(offer.expireDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleToggleVisibility(offer._id, offer.isHidden)
                    }
                  >
                    {offer.isHidden ? (
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
                      <DropdownMenuItem onClick={() => openEditDialog(offer)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteOffer(offer._id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>Update the offer details.</DialogDescription>
          </DialogHeader>
          {editingOffer && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingOffer.title}
                    onChange={(e) =>
                      setEditingOffer((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                    maxLength={150}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (EUR)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingOffer.price}
                    onChange={(e) =>
                      setEditingOffer((prev) =>
                        prev
                          ? { ...prev, price: parseFloat(e.target.value) || 0 }
                          : null
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-departureCity">Departure City</Label>
                  <Input
                    id="edit-departureCity"
                    value={editingOffer.departureCity}
                    onChange={(e) =>
                      setEditingOffer((prev) =>
                        prev ? { ...prev, departureCity: e.target.value } : null
                      )
                    }
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-arrivalCity">Arrival City</Label>
                  <Input
                    id="edit-arrivalCity"
                    value={editingOffer.arrivalCity}
                    onChange={(e) =>
                      setEditingOffer((prev) =>
                        prev ? { ...prev, arrivalCity: e.target.value } : null
                      )
                    }
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-discount">Discount (%)</Label>
                  <Input
                    id="edit-discount"
                    type="number"
                    min="0"
                    max="100"
                    value={editingOffer.discount}
                    onChange={(e) =>
                      setEditingOffer((prev) =>
                        prev
                          ? {
                              ...prev,
                              discount: parseFloat(e.target.value) || 0,
                            }
                          : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expireDate">Expire Date</Label>
                  <Input
                    id="edit-expireDate"
                    type="datetime-local"
                    value={
                      editingOffer.expireDate
                        ? new Date(editingOffer.expireDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEditingOffer((prev) =>
                        prev ? { ...prev, expireDate: e.target.value } : null
                      )
                    }
                    className="[color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingOffer.description}
                  onChange={(e) =>
                    setEditingOffer((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  rows={3}
                  maxLength={500}
                />
                <div className="text-right text-xs text-muted-foreground">
                  {editingOffer.description.length}/500
                </div>
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
