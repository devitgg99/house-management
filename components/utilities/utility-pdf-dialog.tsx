"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HouseDetailResponse, UtilityResponse } from "@/types/property";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  Printer,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
} from "lucide-react";
import { exportUtilityReportToPdfFrontend } from "@/lib/pdf/export-utility-pdf";
import { UtilityReportDocument, paginateUtilities } from "@/components/utilities/utility-report-document";
import { toast } from "sonner";

interface UtilityPdfDialogProps {
  isOpen: boolean;
  onClose: () => void;
  house: HouseDetailResponse | null;
  month: string | null;
  utilities: UtilityResponse[];
  initialLang?: "en" | "kh";
}

export function UtilityPdfDialog({
  isOpen,
  onClose,
  house,
  month,
  utilities,
  initialLang = "en",
}: UtilityPdfDialogProps) {
  const [lang, setLang] = useState<"en" | "kh">(initialLang);
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState<number>(0.95);
  const reportRef = useRef<HTMLDivElement>(null);

  // Sync initial language if prop updates
  useEffect(() => {
    setLang(initialLang);
  }, [initialLang]);

  // Adjust default zoom on smaller screens (mobile / tablet / laptop)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 768) {
        setZoom(0.5);
      } else if (width < 1024) {
        setZoom(0.75);
      } else if (width < 1440) {
        setZoom(0.9);
      } else {
        setZoom(1.0);
      }
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isExporting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExporting, onClose]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = async () => {
    if (!house || !month) return;
    setIsExporting(true);
    try {
      await exportUtilityReportToPdfFrontend({
        house,
        month,
        utilities,
        lang,
        containerElement: reportRef.current,
      });
      toast.success("PDF report downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isExporting) {
      onClose();
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.4));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.4));
  const handleResetZoom = () => setZoom(1.0);

  if (!month || !house) return null;

  const isKhmer = lang === "kh";
  const pages = paginateUtilities(utilities);
  const totalPages = pages.length;

  const formatMonth = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString(isKhmer ? "km-KH" : "en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formattedMonth = formatMonth(month);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden no-print"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.25 }}
            className="w-full max-w-6xl h-[95vh] bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* TOOLBAR HEADER */}
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur z-20">
              {/* Document Identity */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      {isKhmer ? "គំរូឯកសារ PDF A4" : "A4 Utility Report Preview"}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      A4 Portrait • 210 × 297 mm
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {totalPages} {totalPages === 1 ? (isKhmer ? "ទំព័រ" : "Page") : (isKhmer ? "ទំព័រ" : "Pages")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {house.houseName} • {formattedMonth} • {utilities.length} {isKhmer ? "បន្ទប់" : "records"}
                  </p>
                </div>
              </div>

              {/* Document Actions & Controls */}
              <div className="flex items-center flex-wrap gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700/80 p-0.5">
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out (-)"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[11px] font-mono text-slate-300 select-none min-w-[42px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In (+)"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    title="Fit 100%"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-0.5 border-l border-slate-700"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Language Switcher */}
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as "en" | "kh")}
                  className="h-8 px-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="kh">🇰🇭 ខ្មែរ</option>
                </select>

                {/* Print Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-8 gap-1.5 border-slate-700 bg-slate-800/90 text-slate-200 hover:bg-slate-700 hover:text-white text-xs rounded-xl"
                  title="Print or Save as PDF via Browser (Vector sharp)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {isKhmer ? "បោះពុម្ព / សន្សំជា PDF" : "Print / Save PDF"}
                </Button>

                {/* Direct Download Button */}
                <Button
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  {isKhmer ? "ទាញយក PDF" : "Download PDF"}
                </Button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENT VIEWER WORKBENCH */}
            <div className="flex-1 bg-slate-900/70 overflow-auto p-4 sm:p-8 flex justify-center items-start scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <div
                ref={reportRef}
                className="transition-transform duration-150 origin-top flex flex-col items-center"
                style={{
                  transform: `scale(${zoom})`,
                  width: "210mm",
                  marginBottom: "40px",
                }}
              >
                <UtilityReportDocument
                  house={house}
                  month={month}
                  utilities={utilities}
                  lang={lang}
                  isPreview={true}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
