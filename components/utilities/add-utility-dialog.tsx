"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Droplets, 
  Loader2, 
  Calendar, 
  Camera, 
  Upload, 
  Trash2, 
  ZoomIn, 
  CheckCircle2, 
  Image as ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AddUtilityAction } from "@/actions/utility/UtilityAction";
import { UploadFileAction } from "@/actions/file/FileAction";
import { browserLogger } from "@/lib/logger";
import { ensureHttps } from "@/lib/utils";

type AddUtilityDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (month?: string) => void;
  roomId: string;
  roomName: string;
  lastReading?: number;
};

export function AddUtilityDialog({
  isOpen,
  onClose,
  onSuccess,
  roomId,
  roomName,
  lastReading = 0,
}: AddUtilityDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [meterImageUrl, setMeterImageUrl] = useState<string | null>(null);
  const [meterImagePreview, setMeterImagePreview] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    oldWater: lastReading.toString(),
    newWater: "",
    month: new Date().toISOString().split("T")[0],
  });

  // Sync oldWater with lastReading prop when it changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        oldWater: lastReading.toString(),
        newWater: "",
        month: new Date().toISOString().split("T")[0],
      }));
      setMeterImageUrl(null);
      setMeterImagePreview(null);
      setIsLightboxOpen(false);
    }
  }, [isOpen, lastReading]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please select an image file (JPEG, PNG, GIF, WebP)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", {
        description: "File size must be under 5MB",
      });
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setMeterImagePreview(localPreview);
    setIsUploadingImage(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const result = await UploadFileAction(uploadData);

      if (result.success && result.url) {
        const secureUrl = ensureHttps(result.url);
        setMeterImageUrl(secureUrl);
        toast.success("Meter photo attached");
      } else {
        browserLogger.error("Utility", "Failed to upload meter image", { error: result.error, fileName: file.name });
        toast.error("Upload failed", {
          description: result.error || "Failed to upload meter image",
        });
        setMeterImagePreview(null);
        setMeterImageUrl(null);
      }
    } catch (error) {
      browserLogger.error("Utility", "Exception uploading meter image", { error, fileName: file.name });
      toast.error("Upload error", {
        description: "Failed to upload meter image",
      });
      setMeterImagePreview(null);
      setMeterImageUrl(null);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setMeterImageUrl(null);
    setMeterImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.token) {
      browserLogger.warn("Utility", "Authentication required to add utility reading");
      toast.error("Authentication required", {
        description: "Please login to add utility reading",
      });
      return;
    }

    const oldWater = parseFloat(formData.oldWater) || 0;
    const newWater = parseFloat(formData.newWater) || 0;

    if (newWater < oldWater) {
      browserLogger.warn("Utility", "Validation failed: new reading cannot be less than old reading", {
        oldWater,
        newWater,
        roomId,
      });
      toast.error("Validation error", {
        description: "New water reading cannot be less than old reading",
      });
      return;
    }

    if (!formData.month) {
      browserLogger.warn("Utility", "Validation failed: month is required", { roomId });
      toast.error("Validation error", {
        description: "Please select a month",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        roomId,
        oldWater,
        newWater,
        month: formData.month,
        meterImageUrl: meterImageUrl || undefined,
      };

      const result = await AddUtilityAction(payload, session.user.token);

      if (result.success) {
        browserLogger.success("Utility", `Utility recorded for ${roomName}: ${newWater - oldWater} units`, {
          payload,
          result,
        });
        toast.success("Utility recorded!", {
          description: `Water usage: ${newWater - oldWater} units`,
        });

        const savedMonth = formData.month;
        setFormData({
          oldWater: newWater.toString(),
          newWater: "",
          month: new Date().toISOString().split("T")[0],
        });
        setMeterImageUrl(null);
        setMeterImagePreview(null);

        // Close modal first to avoid layout jump during exit transition
        onClose();
        onSuccess?.(savedMonth);
      } else {
        browserLogger.error("Utility", "Failed to add utility reading", {
          error: result.error,
          payload,
          result,
        });
        toast.error("Failed to add utility", {
          description: result.error || "Something went wrong",
        });
      }
    } catch (error) {
      browserLogger.error("Utility", "Network or server exception while adding utility reading", {
        error,
        roomId,
        formData,
      });
      toast.error("Error", {
        description: "Failed to connect to server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading && !isUploadingImage) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading && !isUploadingImage) {
      setFormData({
        oldWater: lastReading.toString(),
        newWater: "",
        month: new Date().toISOString().split("T")[0],
      });
      setMeterImageUrl(null);
      setMeterImagePreview(null);
      onClose();
    }
  };

  const waterUsage = Math.max(0, (parseFloat(formData.newWater) || 0) - (parseFloat(formData.oldWater) || 0));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Add Utility Reading</h2>
                  <p className="text-sm text-muted-foreground">{roomName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading || isUploadingImage}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Month */}
              <div className="space-y-2">
                <Label htmlFor="month">Month *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="month"
                    type="date"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    disabled={isLoading}
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              {/* Old Water Reading */}
              <div className="space-y-2">
                <Label htmlFor="oldWater">Previous Reading *</Label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="oldWater"
                    type="number"
                    value={formData.oldWater}
                    onChange={(e) =>
                      setFormData({ ...formData, oldWater: e.target.value })
                    }
                    placeholder="0"
                    disabled={isLoading}
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              {/* New Water Reading */}
              <div className="space-y-2">
                <Label htmlFor="newWater">Current Reading *</Label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <Input
                    id="newWater"
                    type="number"
                    value={formData.newWater}
                    onChange={(e) =>
                      setFormData({ ...formData, newWater: e.target.value })
                    }
                    placeholder="0"
                    disabled={isLoading}
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              {/* Water Usage Preview */}
              {formData.newWater && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Water Usage</span>
                    <span className="text-lg font-bold text-blue-600">
                      {waterUsage} units
                    </span>
                  </div>
                </div>
              )}

              {/* Hidden file inputs for Camera & Upload */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading || isUploadingImage}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading || isUploadingImage}
              />

              {/* Meter Photo Proof Section */}
              <div className="space-y-2 pt-1">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Camera className="w-4 h-4 text-blue-500" />
                  Meter Photo Proof{" "}
                  <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </Label>

                {isUploadingImage ? (
                  <div className="p-4 rounded-xl border border-border bg-muted/40 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Uploading meter photo...
                  </div>
                ) : meterImagePreview || meterImageUrl ? (
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center gap-3">
                    <div
                      onClick={() => setIsLightboxOpen(true)}
                      className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted cursor-pointer group shrink-0 border border-border"
                    >
                      <img
                        src={meterImagePreview || ensureHttps(meterImageUrl) || ""}
                        alt="Water meter reading"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Photo Attached
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        Click thumbnail to enlarge dial
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={isLoading || isUploadingImage}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Retake Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveImage}
                        disabled={isLoading || isUploadingImage}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={isLoading || isUploadingImage}
                        className="gap-1.5 rounded-lg border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 text-xs font-medium"
                      >
                        <Camera className="w-4 h-4 text-blue-500" />
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isUploadingImage}
                        className="gap-1.5 rounded-lg text-xs font-medium"
                      >
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        Upload Image
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Capture physical water meter numbers for billing proof
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading || isUploadingImage}
                  className="flex-1 h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isUploadingImage}
                  className="flex-1 h-11 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Reading"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Lightbox / Zoom Dialog */}
          <AnimatePresence>
            {isLightboxOpen && (meterImagePreview || meterImageUrl) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLightboxOpen(false)}
                className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
              >
                <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-black border border-white/10">
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src={meterImagePreview || ensureHttps(meterImageUrl) || ""}
                    alt="Enlarged meter reading"
                    className="w-full h-full max-h-[80vh] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
