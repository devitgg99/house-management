import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { HouseDetailResponse, UtilityResponse } from "@/types/property";

interface ExportPdfOptions {
  house: HouseDetailResponse | { houseName: string; houseAddress?: string; totalRooms?: number };
  month: string;
  utilities: UtilityResponse[];
  lang?: "en" | "kh";
}

export async function exportUtilityReportToPdfFrontend({
  house,
  month,
  utilities,
  lang = "en",
}: ExportPdfOptions): Promise<void> {
  const isKhmer = lang === "kh";

  // Calculate totals
  const totalAmount = utilities.reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const paidAmount = utilities.filter((u) => u.isPay).reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const unpaidAmount = utilities.filter((u) => !u.isPay).reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const totalWaterUsage = utilities.reduce((sum, u) => sum + (u.waterUsage || 0), 0);
  const totalWaterCost = utilities.reduce((sum, u) => sum + (u.waterCost || 0), 0);
  const totalRoomCost = utilities.reduce((sum, u) => sum + (u.roomCost || 0), 0);

  // Format month (e.g. 2026-10 -> Oct 2026)
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

  // Create temporary container for printable template
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px"; // Standard A4 width in pixels at 96 DPI
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#1e293b";
  container.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hanuman', 'Noto Sans Khmer', sans-serif";
  container.style.padding = "32px";
  container.style.boxSizing = "border-box";

  container.innerHTML = `
    <div style="width: 100%; box-sizing: border-box;">
      <!-- Header Banner -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
              🏠
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
              ${house.houseName || "House Property"}
            </h1>
          </div>
          <p style="margin: 0; font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 4px;">
            📍 ${house.houseAddress || "Property Address"}
          </p>
        </div>

        <div style="text-align: right;">
          <div style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 6px; border: 1px solid #bfdbfe;">
            ${isKhmer ? "របាយការណ៍បង់ប្រាក់ទឹក និងបន្ទប់" : "UTILITY & RENT REPORT"}
          </div>
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">
            ${isKhmer ? "ខែ" : "Month"}: ${formattedMonth}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;">
            ${isKhmer ? "ថ្ងៃចេញរបាយការណ៍" : "Generated"}: ${formattedDate}
          </p>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; text-align: center;">
          <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
            ${isKhmer ? "សរុបរួម" : "Total Revenue"}
          </span>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">
            $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; text-align: center;">
          <span style="font-size: 11px; color: #166534; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
            ${isKhmer ? "បានបង់" : "Total Paid"}
          </span>
          <div style="font-size: 18px; font-weight: 800; color: #15803d; margin-top: 4px;">
            $${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; text-align: center;">
          <span style="font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
            ${isKhmer ? "មិនទាន់បង់" : "Total Unpaid"}
          </span>
          <div style="font-size: 18px; font-weight: 800; color: #b45309; margin-top: 4px;">
            $${unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; text-align: center;">
          <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
            ${isKhmer ? "បន្ទប់សរុប" : "Total Rooms"}
          </span>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">
            ${utilities.length}
          </div>
        </div>
      </div>

      <!-- Main Utility Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 10px 8px; text-align: left; font-weight: 700; color: #334155; width: 5%;">#</th>
            <th style="padding: 10px 8px; text-align: left; font-weight: 700; color: #334155; width: 22%;">${isKhmer ? "បន្ទប់" : "Room"}</th>
            <th style="padding: 10px 8px; text-align: center; font-weight: 700; color: #334155; width: 14%;">${isKhmer ? "អំណាន (ចាស់→ថ្មី)" : "Reading (Old→New)"}</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: 700; color: #334155; width: 11%;">${isKhmer ? "ប្រើប្រាស់" : "Usage (m³)"}</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: 700; color: #334155; width: 12%;">${isKhmer ? "ថ្លៃទឹក" : "Water Cost"}</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: 700; color: #334155; width: 12%;">${isKhmer ? "ថ្លៃបន្ទប់" : "Room Rent"}</th>
            <th style="padding: 10px 8px; text-align: right; font-weight: 700; color: #334155; width: 12%;">${isKhmer ? "សរុប" : "Total"}</th>
            <th style="padding: 10px 8px; text-align: center; font-weight: 700; color: #334155; width: 12%;">${isKhmer ? "ស្ថានភាព" : "Status"}</th>
          </tr>
        </thead>
        <tbody>
          ${utilities
            .map(
              (u, index) => `
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${index % 2 === 0 ? "#ffffff" : "#f8fafc"};">
              <td style="padding: 8px; text-align: left; color: #64748b;">${index + 1}</td>
              <td style="padding: 8px; text-align: left; font-weight: 600; color: #0f172a;">
                ${u.roomName || `Room #${index + 1}`}
              </td>
              <td style="padding: 8px; text-align: center; color: #475569; font-family: monospace;">
                ${u.oldWater} → ${u.newWater}
              </td>
              <td style="padding: 8px; text-align: right; font-weight: 600; color: #2563eb;">
                ${u.waterUsage} m³
              </td>
              <td style="padding: 8px; text-align: right; color: #334155;">
                $${(u.waterCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style="padding: 8px; text-align: right; color: #334155;">
                $${(u.roomCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style="padding: 8px; text-align: right; font-weight: 700; color: #0f172a;">
                $${(u.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style="padding: 8px; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; ${
                  u.isPay
                    ? "background-color: #dcfce7; color: #15803d; border: 1px solid #86efac;"
                    : "background-color: #fef3c7; color: #b45309; border: 1px solid #fde047;"
                }">
                  ${u.isPay ? (isKhmer ? "បានបង់" : "PAID") : (isKhmer ? "មិនទាន់បង់" : "UNPAID")}
                </span>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr style="background-color: #e2e8f0; border-top: 2px solid #cbd5e1; font-weight: 700; color: #0f172a;">
            <td colspan="3" style="padding: 10px 8px; text-align: right; text-transform: uppercase; font-size: 11px;">
              ${isKhmer ? "សរុបសរុប (Grand Total)" : "Grand Total"}
            </td>
            <td style="padding: 10px 8px; text-align: right; color: #1d4ed8;">
              ${totalWaterUsage} m³
            </td>
            <td style="padding: 10px 8px; text-align: right;">
              $${totalWaterCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td style="padding: 10px 8px; text-align: right;">
              $${totalRoomCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td style="padding: 10px 8px; text-align: right; font-size: 13px; color: #1d4ed8;">
              $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td style="padding: 10px 8px;"></td>
          </tr>
        </tfoot>
      </table>

      <!-- Signatures & Notes Footer -->
      <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
        <div style="font-size: 11px; color: #64748b; width: 50%;">
          <p style="margin: 0 0 4px 0; font-weight: 700; color: #334155;">${isKhmer ? "ចំណាំ:" : "Note:"}</p>
          <p style="margin: 0 0 2px 0;">• ${isKhmer ? "សូមពិនិត្យមើលអំណាននាឡិកាទឹក និងប្រាក់ត្រូវបង់ឱ្យបានត្រឹមត្រូវ" : "Please verify meter readings and payment details before completing transaction."}</p>
          <p style="margin: 0;">• ${isKhmer ? "របាយការណ៍នេះបង្កើតឡើងដោយស្វ័យប្រវត្តិដោយប្រព័ន្ធគ្រប់គ្រងអចលនទ្រព្យ" : "This document was generated automatically by House Management System."}</p>
        </div>

        <div style="text-align: center; width: 35%;">
          <div style="height: 45px; border-bottom: 1px solid #94a3b8; margin-bottom: 6px;"></div>
          <p style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a;">
            ${isKhmer ? "ហត្ថលេខាម្ចាស់ផ្ទះ / ហត្ថលេខាអ្នកគ្រប់គ្រង" : "Property Manager Signature"}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #94a3b8;">
            ${isKhmer ? "កាលបរិច្ឆេទ" : "Date"}: ____ / ____ / ________
          </p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Generate Canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    } as Parameters<typeof html2canvas>[1]);

    const imgData = canvas.toDataURL("image/png");

    // Dimensions for A4 in PDF (mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multi-page if table is very long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF file
    const cleanHouseName = (house.houseName || "house").toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filename = `utility-report-${cleanHouseName}-${month}-${lang}.pdf`;
    pdf.save(filename);
  } finally {
    // Clean up container element
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
