"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DoorOpen, Loader2, Upload, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UpdateRoomAction } from "@/actions/room/RoomAction";
import { UploadFileAction } from "@/actions/file/FileAction";
import { RoomResponse } from "@/types/property";


type EditRoomDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  room: RoomResponse | null;
};

export function EditRoomDialog({
  isOpen,
  onClose,
  onSuccess,
  room,
}: EditRoomDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    roomName: "",
    price: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when room changes
  useEffect(() => {
    if (room) {
      setFormData({
        roomName: room.roomName,
        price: room.price?.toString() || "0",
      });
      setImages(room.images?.filter((img) => img !== "string") || []);
    }
  }, [room]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const invalidFiles = Array.from(files).filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Invalid file type", {
        description: "Please upload only image files (JPEG, PNG, GIF, WEBP)",
      });
      return;
    }

    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      toast.error("File too large", {
        description: "Each image must be less than 5MB",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const result = await UploadFileAction(formData);

        if (result.success && result.url) {
          uploadedUrls.push(result.url);
        } else {
          toast.error("Upload failed", {
            description: result.error || `Failed to upload ${file.name}`,
          });
        }
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded`);
      }
    } catch (error) {
      toast.error("Upload error", {
        description: "Failed to upload images",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.token) {
      toast.error("Authentication required", {
        description: "Please login to update room",
      });
      return;
    }

    if (!room) {
      toast.error("Error", {
        description: "Room data not found",
      });
      return;
    }

    if (!formData.roomName.trim()) {
      toast.error("Validation error", {
        description: "Please enter a room name",
      });
      return;
    }

    const price = parseFloat(formData.price) || 0;
    if (price < 0) {
      toast.error("Validation error", {
        description: "Price cannot be negative",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await UpdateRoomAction(
        room.roomId,
        {
          roomName: formData.roomName.trim(),
          floorId: room.floorId,
          images: images,
          price: price,
        },
        session.user.token
      );

      if (result.success) {
        toast.success("Room updated!", {
          description: `${formData.roomName} has been updated`,
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Failed to update room", {
          description: result.error || "Something went wrong",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to connect to server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading && !isUploading) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading && !isUploading) {
      onClose();
    }
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/[^\d]/g, "");
    return num ? parseInt(num).toLocaleString() : "";
  };

  return (
    <AnimatePresence>
      {isOpen && room && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Edit Room</h2>
                  <p className="text-sm text-muted-foreground">
                    Update room details
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading || isUploading}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Room Name */}
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name *</Label>
                  <Input
                    id="roomName"
                    type="text"
                    value={formData.roomName}
                    onChange={(e) =>
                      setFormData({ ...formData, roomName: e.target.value })
                    }
                    placeholder="e.g. Room 101, Suite A"
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="text"
                      value={formatPrice(formData.price)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        setFormData({ ...formData, price: raw });
                      }}
                      placeholder="500,000"
                      disabled={isLoading}
                      className="h-11 pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the monthly rental price
                  </p>
                </div>

                {/* Room Images */}
                <div className="space-y-2">
                  <Label>Room Images</Label>
                  <div className="space-y-3">
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                          >
                            <img
                              src={image}
                              alt={`Room image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 p-1 rounded-md bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all ${
                        isUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">
                            Uploading...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Click to upload images
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG, GIF, WEBP up to 5MB each
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 p-6 pt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading || isUploading}
                  className="flex-1 h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="flex-1 h-11 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Room"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
