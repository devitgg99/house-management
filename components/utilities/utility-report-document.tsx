"use client";

import React from "react";
import { HouseDetailResponse, UtilityResponse } from "@/types/property";
import { Building2, CheckCircle2, Clock } from "lucide-react";

export interface UtilityReportDocumentProps {
  house: HouseDetailResponse | { houseName: string; houseAddress?: string; totalRooms?: number };
  month: string;
  utilities: UtilityResponse[];
  lang?: "en" | "kh";
  isPreview?: boolean;
}

/**
 * Intelligent pagination calculation for A4 portrait document:
 * - Single-page limit: Up to 18 rooms fit comfortably on a single A4 page with Header, KPIs, Table, Totals, and Signatures.
 * - Multi-page pagination:
 *     Page 1: 16 rooms (includes Header + KPI Summary Cards + Table)
 *     Final Page: Up to 18 rooms (includes Continuation Header + Table + Grand Totals + Signatures)
 *     Middle Pages: Up to 22 rooms (includes Continuation Header + Table)
 */
export function paginateUtilities(utilities: UtilityResponse[]): UtilityResponse[][] {
  // If 18 or fewer rooms, it all fits on a single A4 page with Header, KPIs, Table, Totals, and Signatures!
  if (utilities.length <= 18) {
    return [utilities];
  }

  const pages: UtilityResponse[][] = [];
  let remaining = [...utilities];

  // Page 1 gets up to 16 rooms to ensure Page 1 looks full and well-proportioned
  const page1Capacity = 16;
  pages.push(remaining.slice(0, page1Capacity));
  remaining = remaining.slice(page1Capacity);

  // Subsequent pages
  while (remaining.length > 0) {
    // If remaining rows can fit on the final page together with Grand Total & Signatures
    if (remaining.length <= 18) {
      pages.push(remaining);
      break;
    }
    // Intermediate page
    pages.push(remaining.slice(0, 22));
    remaining = remaining.slice(22);
  }

  return pages;
}

/**
 * Extracts a numeric value from room names like "Room-01", "Room 2", "03", "Room-01(ផ្ទះពេទ្យ)", "បន្ទប់ ០១".
 * Supports Arabic digits (0-9) and Khmer digits (០-៩).
 */
export function extractRoomNumber(roomName?: string | null): number {
  if (!roomName) return 9999;
  const khmerDigits: Record<string, string> = {
    "០": "0", "១": "1", "២": "2", "៣": "3", "៤": "4",
    "៥": "5", "៦": "6", "៧": "7", "៨": "8", "៩": "9",
  };
  const normalized = roomName.replace(/[០-៩]/g, (ch) => khmerDigits[ch] || ch);
  const match = normalized.match(/\d+/);
  return match ? parseInt(match[0], 10) : 9999;
}

/**
 * Calculates floor rank from first floor up (lowest floor / ground floor up to highest floor).
 * Ground / basement floors get lowest rank (0 or negative), followed by Floor 1 (100), Floor 2 (200), etc.
 */
export function getFloorRank(floorName?: string | null, floorNumber?: number | null): number {
  const name = (floorName || "").toLowerCase().trim();
  if (name.includes("ក្រោមដី") || name.includes("basement") || name.includes("b1")) {
    return -100;
  }
  if (
    name.includes("ជាន់ផ្ទាល់ដី") ||
    name.includes("ជាន់ក្រោម") ||
    name.includes("ក្រោម") ||
    name.includes("ground")
  ) {
    return 0;
  }
  if (name.includes("ជាន់ទី១") || name.includes("ជាន់ទី 1") || name.includes("1st") || name.includes("floor 1")) {
    return 100;
  }
  if (name.includes("ជាន់ទី២") || name.includes("ជាន់ទី 2") || name.includes("2nd") || name.includes("floor 2")) {
    return 200;
  }
  if (name.includes("ជាន់ទី៣") || name.includes("ជាន់ទី 3") || name.includes("3rd") || name.includes("floor 3")) {
    return 300;
  }
  if (name.includes("ជាន់ទី៤") || name.includes("ជាន់ទី 4") || name.includes("4th") || name.includes("floor 4")) {
    return 400;
  }
  if (name.includes("ជាន់ទី៥") || name.includes("ជាន់ទី 5") || name.includes("5th") || name.includes("floor 5")) {
    return 500;
  }
  if (name.includes("ជាន់ទី៦") || name.includes("ជាន់ទី 6") || name.includes("6th") || name.includes("floor 6")) {
    return 600;
  }
  if (name.includes("ជាន់ទី៧") || name.includes("ជាន់ទី 7") || name.includes("7th") || name.includes("floor 7")) {
    return 700;
  }
  if (name.includes("ជាន់ទី៨") || name.includes("ជាន់ទី 8") || name.includes("8th") || name.includes("floor 8")) {
    return 800;
  }
  if (name.includes("ជាន់ទី៩") || name.includes("ជាន់ទី 9") || name.includes("9th") || name.includes("floor 9")) {
    return 900;
  }
  if (name.includes("ជាន់ទី១០") || name.includes("ជាន់ទី 10") || name.includes("10th") || name.includes("floor 10")) {
    return 1000;
  }
  if (name.includes("ដំបូល") || name.includes("rooftop") || name.includes("roof")) {
    return 9000;
  }

  if (typeof floorNumber === "number") {
    return floorNumber * 100;
  }

  return 500;
}

/**
 * Sorts an array of rooms by room number ascending (Room 1 to N, e.g. Room-01, Room-02, ... Room-07).
 */
export function sortRoomsByNumber<T extends { roomName?: string | null }>(rooms: T[]): T[] {
  if (!rooms || rooms.length <= 1) return rooms || [];
  return [...rooms].sort((a, b) => {
    const numA = extractRoomNumber(a.roomName);
    const numB = extractRoomNumber(b.roomName);
    if (numA !== numB) {
      return numA - numB;
    }
    return (a.roomName || "").localeCompare(b.roomName || "", undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

/**
 * Determines floor sorting rank from lowest floor up (e.g. Ground Floor -> 1st Floor -> 2nd Floor).
 */
export function getUtilityFloorRank(
  u: UtilityResponse,
  house?: HouseDetailResponse | { houseName: string; floors?: any[] } | null
): { floorRank: number; resolvedFloorName: string } {
  const floors = (house as HouseDetailResponse)?.floors || [];

  // 1. Direct floorNumber property on utility
  if (typeof u.floorNumber === "number") {
    const fMatch = floors.find((f) => f.floorNumber === u.floorNumber);
    const resolvedName = u.floorName || fMatch?.floorName || `Floor ${u.floorNumber}`;
    return {
      floorRank: getFloorRank(resolvedName, u.floorNumber),
      resolvedFloorName: resolvedName,
    };
  }

  // 2. Match u.floorName in house.floors
  if (u.floorName && floors.length > 0) {
    const idx = floors.findIndex(
      (f) => f.floorName?.trim().toLowerCase() === u.floorName?.trim().toLowerCase()
    );
    if (idx !== -1) {
      const f = floors[idx];
      return {
        floorRank: getFloorRank(f.floorName, typeof f.floorNumber === "number" ? f.floorNumber : idx + 1),
        resolvedFloorName: f.floorName,
      };
    }
  }

  // 3. Keyword detection from floorName or roomName
  const resolvedName = u.floorName || "";
  const rank = getFloorRank(u.floorName || u.roomName, null);
  return { floorRank: rank, resolvedFloorName: resolvedName };
}

/**
 * Sorts utility records:
 * 1. From first floor up (Ground floor / 1st floor -> 2nd floor -> 3rd floor...).
 * 2. Within each floor, ordered by room number from 1 to N (Room-01, Room-02, Room-03...).
 */
export function sortUtilitiesByFloorAndRoom(
  utilities: UtilityResponse[],
  house?: HouseDetailResponse | { houseName: string; floors?: any[] } | null
): UtilityResponse[] {
  if (!utilities || utilities.length <= 1) return utilities || [];

  return [...utilities].sort((a, b) => {
    // 1. Compare Floor rank (from lowest floor up)
    const rankA = getUtilityFloorRank(a, house).floorRank;
    const rankB = getUtilityFloorRank(b, house).floorRank;
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // 2. Compare Room number from 1 up
    const numA = extractRoomNumber(a.roomName);
    const numB = extractRoomNumber(b.roomName);
    if (numA !== numB) {
      return numA - numB;
    }

    // 3. Fallback to natural alphabetical sort
    return (a.roomName || "").localeCompare(b.roomName || "", undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

export function UtilityReportDocument({
  house,
  month,
  utilities,
  lang = "en",
  isPreview = false,
}: UtilityReportDocumentProps) {
  const isKhmer = lang === "kh";

  // Sort utilities in order from first floor up, and room 1 to N
  const sortedUtilities = sortUtilitiesByFloorAndRoom(utilities, house);

  // Financial and usage calculations
  const totalAmount = sortedUtilities.reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const paidAmount = sortedUtilities.filter((u) => u.isPay).reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const unpaidAmount = sortedUtilities.filter((u) => !u.isPay).reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const totalWaterUsage = sortedUtilities.reduce((sum, u) => sum + (u.waterUsage || 0), 0);
  const totalWaterCost = sortedUtilities.reduce((sum, u) => sum + (u.waterCost || 0), 0);
  const totalRoomCost = sortedUtilities.reduce((sum, u) => sum + (u.roomCost || 0), 0);
  const paidCount = sortedUtilities.filter((u) => u.isPay).length;
  const unpaidCount = sortedUtilities.filter((u) => !u.isPay).length;
  const collectionRate = sortedUtilities.length > 0 ? Math.round((paidCount / sortedUtilities.length) * 100) : 0;

  // Format month and issue date
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

  const statementRef = `HMS-${month.replace(/[^0-9]/g, "") || "CUR"}-${(house.houseName || "H").slice(0, 3).toUpperCase()}`;

  const pages = paginateUtilities(sortedUtilities);
  const totalPages = pages.length;

  return (
    <div
      id="utility-report-print-container"
      className="w-full flex flex-col items-center select-text"
      style={{
        fontFamily:
          "var(--font-sans), 'Hanuman', 'Noto Sans Khmer', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {pages.map((pageUtilities, pageIndex) => {
        const pageNumber = pageIndex + 1;
        const isFirstPage = pageNumber === 1;
        const isLastPage = pageNumber === totalPages;
        const startIndex = pages.slice(0, pageIndex).reduce((sum, p) => sum + p.length, 0);

        return (
          <div
            key={`a4-page-${pageNumber}`}
            className="a4-print-page bg-white text-slate-900 border border-slate-200 shadow-xl print:shadow-none print:border-none print:m-0 flex flex-col justify-between"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
              padding: "13mm 15mm 12mm 15mm",
              margin: isPreview && totalPages > 1 ? "0 0 28px 0" : "0",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              position: "relative",
            }}
          >
            {/* Top Content Area */}
            <div className="w-full flex flex-col">
              {/* PAGE 1 HEADER */}
              {isFirstPage ? (
                <div className="border-b-2 border-slate-200 pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    {/* Property Brand & Info */}
                    <div className="max-w-[58%]">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-1">
                            {house.houseName || "House Property"}
                          </h1>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5 line-clamp-1">
                            📍 {house.houseAddress || "Property Address"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Statement Metadata & Badge */}
                    <div className="text-right shrink-0">
                      <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-[11px] font-bold tracking-wider border border-blue-200 mb-1.5 uppercase">
                        {isKhmer ? "របាយការណ៍បង់ប្រាក់ទឹក និងបន្ទប់" : "UTILITY & RENT STATEMENT"}
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        <span className="text-slate-500 font-normal">{isKhmer ? "ខែគិតប្រាក់" : "Billing Period"}: </span>
                        {formattedMonth}
                      </p>
                      <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400 mt-0.5 font-medium">
                        <span>{isKhmer ? "កាលបរិច្ឆេទចេញ" : "Issued"}: {formattedDate}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">{statementRef}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CONTINUATION HEADER FOR PAGES 2+ */
                <div className="border-b border-slate-200 pb-3 mb-4 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                      HMS
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{house.houseName}</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-500 text-[11px]">
                        {isKhmer ? `បន្តទំព័រ ${pageNumber} នៃ ${totalPages}` : `Continued (Page ${pageNumber} of ${totalPages})`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-medium">
                    <span>{formattedMonth}</span>
                    <span className="mx-1.5">•</span>
                    <span className="font-mono text-slate-400">{statementRef}</span>
                  </div>
                </div>
              )}

              {/* KPI SUMMARY CARDS (PAGE 1 ONLY) */}
              {isFirstPage && (
                <div className="grid grid-cols-4 gap-2.5 mb-4">
                  {/* Total Revenue */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {isKhmer ? "ចំណូលសរុប" : "Total Revenue"}
                    </span>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">
                      ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                      {utilities.length} {isKhmer ? "បន្ទប់" : "units billed"}
                    </span>
                  </div>

                  {/* Total Collected */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {isKhmer ? "បានបង់សរុប" : "Total Collected"}
                    </span>
                    <p className="text-base font-extrabold text-emerald-700 mt-0.5 tabular-nums">
                      ${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-emerald-600 font-medium block mt-0.5">
                      {paidCount} {isKhmer ? "បន្ទប់" : "paid"} ({collectionRate}%)
                    </span>
                  </div>

                  {/* Total Outstanding */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {isKhmer ? "មិនទាន់បង់" : "Outstanding Due"}
                    </span>
                    <p className="text-base font-extrabold text-amber-700 mt-0.5 tabular-nums">
                      ${unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] text-amber-600 font-medium block mt-0.5">
                      {unpaidCount} {isKhmer ? "បន្ទប់នៅជំពាក់" : "unpaid units"}
                    </span>
                  </div>

                  {/* Total Water Metrics */}
                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                      {isKhmer ? "ការប្រើប្រាស់ទឹក" : "Water Usage"}
                    </span>
                    <p className="text-base font-extrabold text-blue-700 mt-0.5 tabular-nums">
                      {totalWaterUsage} m³
                    </p>
                    <span className="text-[9px] text-blue-600 font-medium block mt-0.5">
                      ${totalWaterCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isKhmer ? "ថ្លៃទឹក" : "cost"}
                    </span>
                  </div>
                </div>
              )}

              {/* MAIN UTILITY TABLE */}
              <div className="w-full border border-slate-200 rounded-md overflow-hidden mb-3">
                <table className="w-full text-left border-collapse table-fixed text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2 px-2 text-center w-[5%] border-r border-slate-200">#</th>
                      <th className="py-2 px-2.5 text-left w-[21%] border-r border-slate-200">
                        {isKhmer ? "បន្ទប់" : "Room"}
                      </th>
                      <th className="py-2 px-2 text-center w-[16%] border-r border-slate-200">
                        {isKhmer ? "អំណាននាឡិកា" : "Reading (Old→New)"}
                      </th>
                      <th className="py-2 px-2 text-right w-[11%] border-r border-slate-200">
                        {isKhmer ? "ប្រើប្រាស់" : "Usage (m³)"}
                      </th>
                      <th className="py-2 px-2 text-right w-[12%] border-r border-slate-200">
                        {isKhmer ? "ថ្លៃទឹក" : "Water Cost"}
                      </th>
                      <th className="py-2 px-2 text-right w-[12%] border-r border-slate-200">
                        {isKhmer ? "ថ្លៃបន្ទប់" : "Room Rent"}
                      </th>
                      <th className="py-2 px-2 text-right w-[13%] border-r border-slate-200">
                        {isKhmer ? "សរុប" : "Total Due"}
                      </th>
                      <th className="py-2 px-2 text-center w-[10%]">
                        {isKhmer ? "ស្ថានភាព" : "Status"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageUtilities.map((u, rowIdx) => {
                      const absoluteIndex = startIndex + rowIdx + 1;
                      const isEven = rowIdx % 2 === 0;

                      return (
                        <tr
                          key={u.utilityId || `row-${absoluteIndex}`}
                          className={isEven ? "bg-white" : "bg-slate-50/60"}
                          style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                        >
                          <td className="py-1.5 px-2 text-center text-slate-400 font-medium border-r border-slate-100">
                            {absoluteIndex}
                          </td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-900 border-r border-slate-100 truncate">
                            <div>{u.roomName || `Room #${absoluteIndex}`}</div>
                            {u.floorName && (
                              <div className="text-[9px] text-slate-400 font-normal">
                                {u.floorName}
                              </div>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-600 text-[10px] tabular-nums border-r border-slate-100">
                            {u.oldWater} → {u.newWater}
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-blue-600 tabular-nums border-r border-slate-100">
                            {u.waterUsage}
                          </td>
                          <td className="py-1.5 px-2 text-right text-slate-700 tabular-nums border-r border-slate-100">
                            ${(u.waterCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-1.5 px-2 text-right text-slate-700 tabular-nums border-r border-slate-100">
                            ${(u.roomCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-1.5 px-2 text-right font-extrabold text-slate-900 tabular-nums border-r border-slate-100">
                            ${(u.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-1.5 px-1.5 text-center">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                                u.isPay
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                  : "bg-amber-50 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {u.isPay ? (isKhmer ? "បានបង់" : "PAID") : (isKhmer ? "មិនទាន់" : "UNPAID")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* GRAND TOTAL ROW - SHOWN ON LAST PAGE ONLY */}
                  {isLastPage && (
                    <tfoot>
                      <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900 text-[11px]">
                        <td
                          colSpan={3}
                          className="py-2.5 px-3 text-right uppercase tracking-wider font-extrabold text-slate-700 border-r border-slate-200"
                        >
                          {isKhmer ? "សរុបរួម (Grand Total):" : "Grand Total:"}
                        </td>
                        <td className="py-2.5 px-2 text-right text-blue-700 font-extrabold tabular-nums border-r border-slate-200">
                          {totalWaterUsage} m³
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-800 tabular-nums border-r border-slate-200">
                          ${totalWaterCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-800 tabular-nums border-r border-slate-200">
                          ${totalRoomCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-2 text-right text-blue-700 font-black tabular-nums border-r border-slate-200">
                          ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-1.5 text-center">
                          <span className="text-[10px] font-bold text-slate-500">
                            {collectionRate}%
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* TABLE CONTINUATION NOTICE (IF NOT LAST PAGE) */}
              {!isLastPage && (
                <div className="text-right text-[10px] text-slate-400 italic mb-2">
                  {isKhmer
                    ? `* តារាងបន្តទៅទំព័រទី ${pageNumber + 1} ...`
                    : `* Continued on Page ${pageNumber + 1} of ${totalPages} ...`}
                </div>
              )}
            </div>

            {/* Bottom Content Area */}
            <div className="w-full flex flex-col mt-auto">
              {/* NOTES & SIGNATURES (LAST PAGE ONLY) */}
              {isLastPage && (
                <div
                  className="pt-3 border-t border-dashed border-slate-300 flex justify-between items-end mb-3"
                  style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                >
                  {/* Notes & Verification Policy */}
                  <div className="w-[58%] text-[10px] text-slate-500 pr-4 leading-relaxed">
                    <p className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                      📌 {isKhmer ? "ចំណាំ និងលក្ខខណ្ឌនៃការទូទាត់:" : "Notes & Payment Terms:"}
                    </p>
                    <p className="mb-0.5">
                      • {isKhmer
                        ? "សូមពិនិត្យមើលអំណាននាឡិកាទឹក និងប្រាក់ត្រូវបង់ឱ្យបានត្រឹមត្រូវមុនពេលទូទាត់។"
                        : "Please verify meter readings and charges before final transaction settlement."}
                    </p>
                    <p className="mb-0.5">
                      • {isKhmer
                        ? "វិក្កយបត្រផ្លូវការនេះត្រូវបានបង្កើតឡើងដោយស្វ័យប្រវត្តិពីប្រព័ន្ធគ្រប់គ្រងអចលនទ្រព្យ។"
                        : "This statement is generated automatically by House Management System."}
                    </p>
                    <p>
                      • {isKhmer
                        ? "សម្រាប់ចម្ងល់ផ្សេងៗ សូមទាក់ទងមកម្ចាស់ផ្ទះ ឬអ្នកគ្រប់គ្រងអគារផ្ទាល់។"
                        : "For billing questions, please contact your property manager directly."}
                    </p>
                  </div>

                  {/* Signature Box */}
                  <div className="w-[38%] text-center">
                    <p className="text-[11px] font-bold text-slate-900 mb-8">
                      {isKhmer ? "ហត្ថលេខាម្ចាស់ផ្ទះ / អ្នកគ្រប់គ្រង" : "Authorized Property Manager"}
                    </p>
                    <div className="w-full border-b border-slate-400 mb-1"></div>
                    <p className="text-[9px] text-slate-400">
                      {isKhmer ? "កាលបរិច្ឆេទ" : "Signature & Date"}: ____ / ____ / ________
                    </p>
                  </div>
                </div>
              )}

              {/* DOCUMENT FOOTER (EVERY PAGE) */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-medium">
                <div>
                  House Management System • {house.houseName} • {formattedMonth}
                </div>
                <div className="font-mono">
                  {isKhmer
                    ? `ទំព័រ ${pageNumber} នៃ ${totalPages}`
                    : `Page ${pageNumber} of ${totalPages}`}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
