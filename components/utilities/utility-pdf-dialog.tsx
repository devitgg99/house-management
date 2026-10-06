"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HouseDetailResponse, UtilityResponse } from "@/types/property";
import { Button } from "@/components/ui/button";
import {
  FileDown,
  Printer,
  Loader2,
  Sparkles,
  Building2,
  X,
} from "lucide-react";
import { exportUtilityReportToPdfFrontend } from "@/lib/pdf/export-utility-pdf";
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
  const reportRef = useRef<HTMLDivElement>(null);

  if (!month || !house) return null;

  const isKhmer = lang === "kh";

  // Calculate totals
  const totalAmount = utilities.reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const paidAmount = utilities.filter((u) => u.isPay).reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const unpaidAmount = utilities.filter((u) => !u.isPay).reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const totalWaterUsage = utilities.reduce((sum, u) => sum + (u.waterUsage || 0), 0);
  const totalWaterCost = utilities.reduce((sum, u) => sum + (u.waterCost || 0), 0);
  const totalRoomCost = utilities.reduce((sum, u) => sum + (u.roomCost || 0), 0);

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
  const formattedDate = new Date().toLocaleDateString(isKhmer ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await exportUtilityReportToPdfFrontend({
        house,
        month,
        utilities,
        lang,
      });
      toast.success("PDF report downloaded successfully!");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isExporting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-[80] flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-4xl max-h-[92vh] bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto"
          >
            {/* Modal Toolbar Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    {isKhmer ? "មើលគំរូ និង នាំចេញ PDF" : "Utility Report PDF Preview"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Frontend Client-Side PDF Generator • {house.houseName} ({formattedMonth})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as "en" | "kh")}
                  className="h-9 px-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="kh">🇰🇭 ខ្មែរ</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-1.5 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs rounded-xl"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </Button>

                <Button
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/30"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  {isKhmer ? "ទាញយក PDF" : "Download PDF"}
                </Button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Paper Document Preview Container */}
            <div className="p-6 sm:p-8 bg-slate-900/60 overflow-y-auto flex justify-center">
              <div
                ref={reportRef}
                className="w-full max-w-[794px] bg-white text-slate-900 p-8 rounded-xl shadow-2xl border border-slate-200 font-sans"
                style={{
                  fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hanuman', 'Noto Sans Khmer', sans-serif",
                }}
              >
                {/* Document Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-200 pb-5 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {house.houseName}
                      </h1>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      📍 {house.houseAddress || "Property Address"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold border border-blue-200 mb-1.5">
                      {isKhmer ? "របាយការណ៍បង់ប្រាក់ទឹក និងបន្ទប់" : "UTILITY & RENT REPORT"}
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {isKhmer ? "ខែ" : "Month"}: {formattedMonth}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isKhmer ? "ថ្ងៃចេញរបាយការណ៍" : "Generated"}: {formattedDate}
                    </p>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {isKhmer ? "សរុបរួម" : "Total Revenue"}
                    </span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-green-50/80 border border-green-200 rounded-lg p-3 text-center">
                    <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">
                      {isKhmer ? "បានបង់" : "Total Paid"}
                    </span>
                    <p className="text-lg font-extrabold text-green-700 mt-1">
                      ${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-center">
                    <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                      {isKhmer ? "មិនទាន់បង់" : "Total Unpaid"}
                    </span>
                    <p className="text-lg font-extrabold text-amber-700 mt-1">
                      ${unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {isKhmer ? "បន្ទប់សរុប" : "Total Rooms"}
                    </span>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">
                      {utilities.length}
                    </p>
                  </div>
                </div>

                {/* Main Utility Table */}
                <div className="overflow-hidden border border-slate-200 rounded-lg mb-6">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2.5 text-left w-[5%]">#</th>
                        <th className="p-2.5 text-left w-[22%]">{isKhmer ? "បន្ទប់" : "Room"}</th>
                        <th className="p-2.5 text-center w-[16%]">{isKhmer ? "អំណាន (ចាស់→ថ្មី)" : "Reading (Old→New)"}</th>
                        <th className="p-2.5 text-right w-[11%]">{isKhmer ? "ប្រើប្រាស់" : "Usage (m³)"}</th>
                        <th className="p-2.5 text-right w-[12%]">{isKhmer ? "ថ្លៃទឹក" : "Water Cost"}</th>
                        <th className="p-2.5 text-right w-[12%]">{isKhmer ? "ថ្លៃបន្ទប់" : "Room Rent"}</th>
                        <th className="p-2.5 text-right w-[12%]">{isKhmer ? "សរុប" : "Total"}</th>
                        <th className="p-2.5 text-center w-[10%]">{isKhmer ? "ស្ថានភាព" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {utilities.map((u, index) => (
                        <tr
                          key={u.utilityId || index}
                          className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                        >
                          <td className="p-2.5 text-slate-400 font-medium">{index + 1}</td>
                          <td className="p-2.5 font-semibold text-slate-900">
                            {u.roomName || `Room #${index + 1}`}
                          </td>
                          <td className="p-2.5 text-center font-mono text-slate-600">
                            {u.oldWater} → {u.newWater}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-blue-600">
                            {u.waterUsage} m³
                          </td>
                          <td className="p-2.5 text-right text-slate-700">
                            ${(u.waterCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right text-slate-700">
                            ${(u.roomCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            ${(u.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.isPay
                                  ? "bg-green-100 text-green-800 border border-green-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {u.isPay ? (isKhmer ? "បានបង់" : "PAID") : (isKhmer ? "មិនទាន់បង់" : "UNPAID")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                        <td colSpan={3} className="p-2.5 text-right text-[11px] uppercase">
                          {isKhmer ? "សរុបសរុប (Grand Total)" : "Grand Total"}
                        </td>
                        <td className="p-2.5 text-right text-blue-700">
                          {totalWaterUsage} m³
                        </td>
                        <td className="p-2.5 text-right">
                          ${totalWaterCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right">
                          ${totalRoomCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right text-sm text-blue-700 font-extrabold">
                          ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Document Footer & Signature */}
                <div className="pt-4 border-t border-dashed border-slate-300 flex justify-between items-end">
                  <div className="text-[11px] text-slate-500 w-1/2">
                    <p className="font-bold text-slate-700 mb-1">{isKhmer ? "ចំណាំ:" : "Note:"}</p>
                    <p className="mb-0.5">
                      • {isKhmer ? "សូមពិនិត្យមើលអំណាននាឡិកាទឹក និងប្រាក់ត្រូវបង់ឱ្យបានត្រឹមត្រូវ" : "Please verify meter readings and payment details before completing transaction."}
                    </p>
                    <p>
                      • {isKhmer ? "របាយការណ៍នេះបង្កើតឡើងដោយស្វ័យប្រវត្តិដោយប្រព័ន្ធគ្រប់គ្រងអចលនទ្រព្យ" : "This document was generated automatically by House Management System."}
                    </p>
                  </div>

                  <div className="text-center w-1/3">
                    <div className="h-12 border-b border-slate-400 mb-1.5"></div>
                    <p className="text-xs font-bold text-slate-900">
                      {isKhmer ? "ហត្ថលេខាម្ចាស់ផ្ទះ / ហត្ថលេខាអ្នកគ្រប់គ្រង" : "Property Manager Signature"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isKhmer ? "កាលបរិច្ឆេទ" : "Date"}: ____ / ____ / ________
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
