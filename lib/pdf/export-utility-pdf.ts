import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { HouseDetailResponse, UtilityResponse } from "@/types/property";
import { paginateUtilities } from "@/components/utilities/utility-report-document";

export interface ExportPdfOptions {
  house: HouseDetailResponse | { houseName: string; houseAddress?: string; totalRooms?: number };
  month: string;
  utilities: UtilityResponse[];
  lang?: "en" | "kh";
  containerElement?: HTMLElement | null;
}

/**
 * Generates standalone HTML for headless export when dialog DOM is not present
 */
export function generateUtilityReportHtml({
  house,
  month,
  utilities,
  lang = "en",
}: Omit<ExportPdfOptions, "containerElement">): string {
  const isKhmer = lang === "kh";

  const totalAmount = utilities.reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const paidAmount = utilities.filter((u) => u.isPay).reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const unpaidAmount = utilities.filter((u) => !u.isPay).reduce((sum, u) => sum + (u.totalCost || 0), 0);
  const totalWaterUsage = utilities.reduce((sum, u) => sum + (u.waterUsage || 0), 0);
  const totalWaterCost = utilities.reduce((sum, u) => sum + (u.waterCost || 0), 0);
  const totalRoomCost = utilities.reduce((sum, u) => sum + (u.roomCost || 0), 0);
  const paidCount = utilities.filter((u) => u.isPay).length;
  const unpaidCount = utilities.filter((u) => !u.isPay).length;
  const collectionRate = utilities.length > 0 ? Math.round((paidCount / utilities.length) * 100) : 0;

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

  const pages = paginateUtilities(utilities);
  const totalPages = pages.length;

  return pages
    .map((pageUtilities, pageIndex) => {
      const pageNumber = pageIndex + 1;
      const isFirstPage = pageNumber === 1;
      const isLastPage = pageNumber === totalPages;
      const startIndex = pages.slice(0, pageIndex).reduce((sum, p) => sum + p.length, 0);

      return `
        <div class="a4-print-page" style="width: 210mm; min-height: 297mm; box-sizing: border-box; padding: 13mm 15mm 12mm 15mm; background-color: #ffffff; color: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Hanuman', 'Noto Sans Khmer', sans-serif; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
          <!-- Top Area -->
          <div style="width: 100%; display: flex; flex-direction: column;">
            ${
              isFirstPage
                ? `
              <!-- Header Page 1 -->
              <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="max-width: 58%;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                    <div style="width: 36px; height: 36px; background-color: #2563eb; color: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">
                      🏠
                    </div>
                    <div>
                      <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.2;">
                        ${house.houseName || "House Property"}
                      </h1>
                      <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">
                        📍 ${house.houseAddress || "Property Address"}
                      </p>
                    </div>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; border: 1px solid #bfdbfe; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${isKhmer ? "របាយការណ៍បង់ប្រាក់ទឹក និងបន្ទប់" : "UTILITY & RENT STATEMENT"}
                  </div>
                  <div style="font-size: 12px; font-weight: 700; color: #0f172a;">
                    <span style="color: #64748b; font-weight: 500;">${isKhmer ? "ខែគិតប្រាក់" : "Billing Period"}: </span>${formattedMonth}
                  </div>
                  <div style="font-size: 10px; color: #94a3b8; margin-top: 3px; font-weight: 500;">
                    ${isKhmer ? "កាលបរិច្ឆេទចេញ" : "Issued"}: ${formattedDate} • <span style="font-family: monospace; color: #64748b;">${statementRef}</span>
                  </div>
                </div>
              </div>

              <!-- KPI Cards -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block;">
                    ${isKhmer ? "ចំណូលសរុប" : "Total Revenue"}
                  </span>
                  <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px; font-variant-numeric: tabular-nums;">
                    $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span style="font-size: 9px; color: #94a3b8; margin-top: 2px; display: block;">
                    ${utilities.length} ${isKhmer ? "បន្ទប់" : "units billed"}
                  </span>
                </div>

                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; display: block;">
                    ${isKhmer ? "បានបង់សរុប" : "Total Collected"}
                  </span>
                  <div style="font-size: 16px; font-weight: 900; color: #15803d; margin-top: 2px; font-variant-numeric: tabular-nums;">
                    $${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span style="font-size: 9px; color: #16a34a; margin-top: 2px; display: block;">
                    ${paidCount} ${isKhmer ? "បន្ទប់" : "paid"} (${collectionRate}%)
                  </span>
                </div>

                <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; display: block;">
                    ${isKhmer ? "មិនទាន់បង់" : "Outstanding Due"}
                  </span>
                  <div style="font-size: 16px; font-weight: 900; color: #b45309; margin-top: 2px; font-variant-numeric: tabular-nums;">
                    $${unpaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span style="font-size: 9px; color: #d97706; margin-top: 2px; display: block;">
                    ${unpaidCount} ${isKhmer ? "បន្ទប់នៅជំពាក់" : "unpaid units"}
                  </span>
                </div>

                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; display: block;">
                    ${isKhmer ? "ការប្រើប្រាស់ទឹក" : "Water Usage"}
                  </span>
                  <div style="font-size: 16px; font-weight: 900; color: #1d4ed8; margin-top: 2px; font-variant-numeric: tabular-nums;">
                    ${totalWaterUsage} m³
                  </div>
                  <span style="font-size: 9px; color: #2563eb; margin-top: 2px; display: block;">
                    $${totalWaterCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${isKhmer ? "ថ្លៃទឹក" : "cost"}
                  </span>
                </div>
              </div>
            `
                : `
              <!-- Continuation Header -->
              <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 800; color: #0f172a;">${house.houseName}</span>
                  <span style="color: #cbd5e1;">•</span>
                  <span style="color: #64748b;">${isKhmer ? `បន្តទំព័រ ${pageNumber} នៃ ${totalPages}` : `Continued (Page ${pageNumber} of ${totalPages})`}</span>
                </div>
                <div style="color: #64748b; font-weight: 500;">
                  <span>${formattedMonth}</span> • <span style="font-family: monospace; color: #94a3b8;">${statementRef}</span>
                </div>
              </div>
            `
            }

            <!-- Utility Table -->
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 10px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed;">
                <thead>
                  <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #334155; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                    <th style="padding: 8px 6px; text-align: center; width: 5%; border-right: 1px solid #e2e8f0;">#</th>
                    <th style="padding: 8px 8px; text-align: left; width: 21%; border-right: 1px solid #e2e8f0;">${isKhmer ? "បន្ទប់" : "Room"}</th>
                    <th style="padding: 8px 6px; text-align: center; width: 16%; border-right: 1px solid #e2e8f0;">${isKhmer ? "អំណាននាឡិកា" : "Reading (Old→New)"}</th>
                    <th style="padding: 8px 6px; text-align: right; width: 11%; border-right: 1px solid #e2e8f0;">${isKhmer ? "ប្រើប្រាស់" : "Usage (m³)"}</th>
                    <th style="padding: 8px 6px; text-align: right; width: 12%; border-right: 1px solid #e2e8f0;">${isKhmer ? "ថ្លៃទឹក" : "Water Cost"}</th>
                    <th style="padding: 8px 6px; text-align: right; width: 12%; border-right: 1px solid #e2e8f0;">${isKhmer ? "ថ្លៃបន្ទប់" : "Room Rent"}</th>
                    <th style="padding: 8px 6px; text-align: right; width: 13%; border-right: 1px solid #e2e8f0;">${isKhmer ? "សរុប" : "Total Due"}</th>
                    <th style="padding: 8px 6px; text-align: center; width: 10%;">${isKhmer ? "ស្ថានភាព" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageUtilities
                    .map((u, rIdx) => {
                      const absIdx = startIndex + rIdx + 1;
                      const bg = rIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
                      return `
                      <tr style="background-color: ${bg}; border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 7px 6px; text-align: center; color: #94a3b8; border-right: 1px solid #f1f5f9;">${absIdx}</td>
                        <td style="padding: 7px 8px; text-align: left; font-weight: 700; color: #0f172a; border-right: 1px solid #f1f5f9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          ${u.roomName || `Room #${absIdx}`}
                        </td>
                        <td style="padding: 7px 6px; text-align: center; font-family: monospace; font-size: 10px; color: #475569; border-right: 1px solid #f1f5f9; font-variant-numeric: tabular-nums;">
                          ${u.oldWater} → ${u.newWater}
                        </td>
                        <td style="padding: 7px 6px; text-align: right; font-weight: 700; color: #2563eb; border-right: 1px solid #f1f5f9; font-variant-numeric: tabular-nums;">
                          ${u.waterUsage}
                        </td>
                        <td style="padding: 7px 6px; text-align: right; color: #334155; border-right: 1px solid #f1f5f9; font-variant-numeric: tabular-nums;">
                          $${(u.waterCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 7px 6px; text-align: right; color: #334155; border-right: 1px solid #f1f5f9; font-variant-numeric: tabular-nums;">
                          $${(u.roomCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 7px 6px; text-align: right; font-weight: 800; color: #0f172a; border-right: 1px solid #f1f5f9; font-variant-numeric: tabular-nums;">
                          $${(u.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style="padding: 7px 4px; text-align: center;">
                          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; ${
                            u.isPay
                              ? "background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;"
                              : "background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a;"
                          }">
                            ${u.isPay ? (isKhmer ? "បានបង់" : "PAID") : (isKhmer ? "មិនទាន់" : "UNPAID")}
                          </span>
                        </td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
                ${
                  isLastPage
                    ? `
                  <tfoot>
                    <tr style="background-color: #f1f5f9; border-top: 2px solid #cbd5e1; font-weight: 700; color: #0f172a; font-size: 11px;">
                      <td colspan="3" style="padding: 9px 8px; text-align: right; text-transform: uppercase; font-size: 10px; font-weight: 800; color: #334155; border-right: 1px solid #e2e8f0;">
                        ${isKhmer ? "សរុបរួម (Grand Total):" : "Grand Total:"}
                      </td>
                      <td style="padding: 9px 6px; text-align: right; color: #1d4ed8; font-weight: 800; border-right: 1px solid #e2e8f0; font-variant-numeric: tabular-nums;">
                        ${totalWaterUsage} m³
                      </td>
                      <td style="padding: 9px 6px; text-align: right; color: #1e293b; border-right: 1px solid #e2e8f0; font-variant-numeric: tabular-nums;">
                        $${totalWaterCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style="padding: 9px 6px; text-align: right; color: #1e293b; border-right: 1px solid #e2e8f0; font-variant-numeric: tabular-nums;">
                        $${totalRoomCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style="padding: 9px 6px; text-align: right; font-size: 12px; color: #1d4ed8; font-weight: 900; border-right: 1px solid #e2e8f0; font-variant-numeric: tabular-nums;">
                        $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style="padding: 9px 4px; text-align: center; font-size: 10px; color: #64748b;">
                        ${collectionRate}%
                      </td>
                    </tr>
                  </tfoot>
                `
                    : ""
                }
              </table>
            </div>

            ${
              !isLastPage
                ? `
              <div style="text-align: right; font-size: 10px; color: #94a3b8; font-style: italic; margin-bottom: 8px;">
                ${isKhmer ? `* តារាងបន្តទៅទំព័រទី ${pageNumber + 1} ...` : `* Continued on Page ${pageNumber + 1} of ${totalPages} ...`}
              </div>
            `
                : ""
            }
          </div>

          <!-- Bottom Area -->
          <div style="width: 100%; display: flex; flex-direction: column; margin-top: auto;">
            ${
              isLastPage
                ? `
              <!-- Notes & Signature -->
              <div style="padding-top: 10px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px;">
                <div style="width: 58%; font-size: 10px; color: #64748b; line-height: 1.5;">
                  <p style="margin: 0 0 3px 0; font-weight: 700; color: #1e293b;">
                    📌 ${isKhmer ? "ចំណាំ និងលក្ខខណ្ឌនៃការទូទាត់:" : "Notes & Payment Terms:"}
                  </p>
                  <p style="margin: 0 0 2px 0;">
                    • ${isKhmer ? "សូមពិនិត្យមើលអំណាននាឡិកាទឹក និងប្រាក់ត្រូវបង់ឱ្យបានត្រឹមត្រូវមុនពេលទូទាត់។" : "Please verify meter readings and charges before final transaction settlement."}
                  </p>
                  <p style="margin: 0 0 2px 0;">
                    • ${isKhmer ? "វិក្កយបត្រផ្លូវការនេះត្រូវបានបង្កើតឡើងដោយស្វ័យប្រវត្តិពីប្រព័ន្ធគ្រប់គ្រងអចលនទ្រព្យ។" : "This statement is generated automatically by House Management System."}
                  </p>
                  <p style="margin: 0;">
                    • ${isKhmer ? "សម្រាប់ចម្ងល់ផ្សេងៗ សូមទាក់ទងមកម្ចាស់ផ្ទះ ឬអ្នកគ្រប់គ្រងអគារផ្ទាល់។" : "For billing questions, please contact your property manager directly."}
                  </p>
                </div>

                <div style="width: 38%; text-align: center;">
                  <p style="margin: 0 0 28px 0; font-size: 11px; font-weight: 700; color: #0f172a;">
                    ${isKhmer ? "ហត្ថលេខាម្ចាស់ផ្ទះ / អ្នកគ្រប់គ្រង" : "Authorized Property Manager"}
                  </p>
                  <div style="width: 100%; border-bottom: 1px solid #94a3b8; margin-bottom: 4px;"></div>
                  <p style="margin: 0; font-size: 9px; color: #94a3b8;">
                    ${isKhmer ? "កាលបរិច្ឆេទ" : "Signature & Date"}: ____ / ____ / ________
                  </p>
                </div>
              </div>
            `
                : ""
            }

            <!-- Document Footer -->
            <div style="padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94a3b8;">
              <div>
                House Management System • ${house.houseName} • ${formattedMonth}
              </div>
              <div style="font-family: monospace;">
                ${isKhmer ? `ទំព័រ ${pageNumber} នៃ ${totalPages}` : `Page ${pageNumber} of ${totalPages}`}
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * High-fidelity client-side PDF export for utility reports.
 * Employs clean page-by-page rendering matching standard A4 dimensions (210mm x 297mm).
 */
export async function exportUtilityReportToPdfFrontend({
  house,
  month,
  utilities,
  lang = "en",
  containerElement,
}: ExportPdfOptions): Promise<void> {
  let createdTempContainer: HTMLElement | null = null;
  let targetPages: HTMLElement[] = [];

  // 1. If live container from UtilityPdfDialog is passed and has pages
  if (containerElement) {
    const pages = Array.from(containerElement.querySelectorAll<HTMLElement>(".a4-print-page"));
    if (pages.length > 0) {
      targetPages = pages;
    }
  }

  // 2. If no container passed or empty, mount temporary off-screen container
  if (targetPages.length === 0) {
    createdTempContainer = document.createElement("div");
    createdTempContainer.style.position = "fixed";
    createdTempContainer.style.left = "-9999px";
    createdTempContainer.style.top = "0";
    createdTempContainer.style.width = "210mm";
    createdTempContainer.style.zIndex = "-9999";
    createdTempContainer.style.backgroundColor = "#ffffff";
    createdTempContainer.innerHTML = generateUtilityReportHtml({ house, month, utilities, lang });

    document.body.appendChild(createdTempContainer);
    targetPages = Array.from(createdTempContainer.querySelectorAll<HTMLElement>(".a4-print-page"));
  }

  if (targetPages.length === 0) {
    throw new Error("Unable to locate document pages to generate PDF");
  }

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let i = 0; i < targetPages.length; i++) {
      const pageEl = targetPages[i];

      // Capture page with html2canvas at scale 2 (192 DPI) for crisp vector-like text
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
      } as any);

      const imgData = canvas.toDataURL("image/png");

      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      // Add page scaled exactly to A4 boundaries (210mm x 297mm)
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
    }

    const cleanHouseName = (house.houseName || "house")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
    const filename = `utility-report-${cleanHouseName}-${month}-${lang}.pdf`;

    pdf.save(filename);
  } finally {
    if (createdTempContainer && document.body.contains(createdTempContainer)) {
      document.body.removeChild(createdTempContainer);
    }
  }
}
