// frontend/src/utils/invoiceGenerator.js
// Uses jsPDF — install: npm install jspdf jspdf-autotable
// 100% free, runs in browser, no backend needed

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GST_PERCENT     = 5;
const SHOP_NAME       = "Prem Mithas";
const SHOP_ADDRESS    = "Near Gandhi Chowk, Sitabuldi, Nagpur, Maharashtra – 440012";
const SHOP_GSTIN      = "27XXXXX0000X1ZX";   // ← Replace with your GSTIN
const SHOP_PHONE      = "+91 XXXXXXXXXX";
const SHOP_EMAIL      = "hello@premmithas.in";
const SHOP_PAN        = "XXXXX0000X";         // ← Replace with your PAN

export const generateInvoicePDF = (order) => {
  const doc      = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW    = doc.internal.pageSize.getWidth();
  const addr     = order.address || {};
  const currency = "₹";

  // ── Colours ──
  const AMBER  = [217, 119, 6];
  const DARK   = [28, 25, 23];
  const LIGHT  = [245, 241, 235];
  const GRAY   = [120, 113, 108];
  const GREEN  = [22, 163, 74];

  // ════════════════════════════════
  // HEADER — shop info
  // ════════════════════════════════
  // Amber header bar
  doc.setFillColor(...AMBER);
  doc.rect(0, 0, pageW, 38, "F");

  // Shop name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(SHOP_NAME, 14, 16);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 240, 200);
  doc.text("Artisan Indian Sweets — Handcrafted with Love", 14, 22);

  // Shop contact (right side)
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(SHOP_ADDRESS,  pageW - 14, 10, { align: "right" });
  doc.text(`📞 ${SHOP_PHONE}`,        pageW - 14, 16, { align: "right" });
  doc.text(`✉  ${SHOP_EMAIL}`,        pageW - 14, 22, { align: "right" });
  doc.text(`GSTIN: ${SHOP_GSTIN}`,    pageW - 14, 28, { align: "right" });
  doc.text(`PAN:   ${SHOP_PAN}`,      pageW - 14, 34, { align: "right" });

  // ── TAX INVOICE label ──
  doc.setFillColor(...LIGHT);
  doc.rect(0, 38, pageW, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("TAX INVOICE", pageW / 2, 47, { align: "center" });

  // ════════════════════════════════
  // INVOICE META
  // ════════════════════════════════
  let y = 58;

  // Left — Invoice details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text("INVOICE DETAILS", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const invNo   = `INV-${String(order._id).slice(-8).toUpperCase()}`;
  const invDate = new Date(order.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  doc.text(`Invoice No : ${invNo}`,  14, y + 6);
  doc.text(`Date       : ${invDate}`, 14, y + 12);
  doc.text(`Order ID   : ${String(order._id).slice(-10).toUpperCase()}`, 14, y + 18);
  doc.text(`Payment    : ${order.paymentMethod}`, 14, y + 24);

  // Payment status badge
  const paid = order.payment;
  doc.setFillColor(...(paid ? GREEN : [234, 88, 12]));
  doc.roundedRect(14, y + 28, 30, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(paid ? "PAID ✓" : "PENDING", 29, y + 33, { align: "center" });

  // Right — Bill to
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text("BILL TO", pageW - 80, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const billLines = [
    `${addr.firstName || ""} ${addr.lastName || ""}`.trim(),
    addr.street || "",
    `${addr.city || ""}${addr.state ? ", " + addr.state : ""} – ${addr.zipcode || ""}`,
    addr.country || "India",
    `📞 ${addr.phone || ""}`,
  ].filter(Boolean);
  billLines.forEach((line, i) => doc.text(line, pageW - 14, y + 6 + i * 6, { align: "right" }));

  // ════════════════════════════════
  // ITEMS TABLE
  // ════════════════════════════════
  y += 44;

  const rows = (order.items || []).map((item, idx) => {
    const unitPrice = item.price;
    const qty       = item.quantity;
    const taxable   = unitPrice * qty;
    const gst       = Math.round(taxable * GST_PERCENT / 100);
    const total     = taxable + gst;
    return [
      idx + 1,
      item.name,
      `${currency}${unitPrice}`,
      qty,
      `${currency}${taxable}`,
      `${GST_PERCENT}%`,
      `${currency}${gst}`,
      `${currency}${total}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["#", "Item Name", "Unit Price", "Qty", "Taxable Amt", "GST%", "GST Amt", "Total"]],
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: AMBER,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: { fontSize: 8, textColor: DARK, halign: "center" },
    columnStyles: {
      1: { halign: "left" },
      0: { cellWidth: 8  },
      2: { cellWidth: 22 },
      3: { cellWidth: 10 },
      4: { cellWidth: 26 },
      5: { cellWidth: 14 },
      6: { cellWidth: 22 },
      7: { cellWidth: 26 },
    },
    alternateRowStyles: { fillColor: [253, 250, 244] },
    margin: { left: 14, right: 14 },
  });

  // ════════════════════════════════
  // TOTALS BOX
  // ════════════════════════════════
  const finalY = doc.lastAutoTable.finalY + 8;

  const subtotalAmt  = (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmt       = Math.round(subtotalAmt * GST_PERCENT / 100);
  const deliveryFee  = 10;
  const discount     = order.discountAmount || 0;
  const grandTotal   = order.amount;

  const totalsX = pageW - 80;
  doc.setFillColor(...LIGHT);
  doc.rect(totalsX - 4, finalY - 4, 80, 46, "F");

  const totals = [
    ["Subtotal",        `${currency}${subtotalAmt}`],
    [`GST (${GST_PERCENT}%)`, `${currency}${gstAmt}`],
    ["Delivery Fee",    `${currency}${deliveryFee}`],
    discount > 0 ? ["Coupon Discount", `− ${currency}${discount}`] : null,
    ["GRAND TOTAL",     `${currency}${grandTotal}`],
  ].filter(Boolean);

  totals.forEach((row, i) => {
    const isLast = i === totals.length - 1;
    doc.setFont("helvetica", isLast ? "bold" : "normal");
    doc.setFontSize(isLast ? 10 : 8.5);
   doc.setTextColor(...(isLast ? DARK : GRAY));
    doc.text(row[0], totalsX, finalY + i * 8);
    
    doc.text(row[1], pageW - 14, finalY + i * 8, { align: "right" });
  });

  // Coupon code
  if (order.couponCode) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(`Coupon applied: ${order.couponCode}`, 14, finalY + 4);
  }

  // ════════════════════════════════
  // FOOTER
  // ════════════════════════════════
  const footY = finalY + 56;

  // Divider
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(0.5);
  doc.line(14, footY, pageW - 14, footY);

  // Notes
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text("This is a computer-generated invoice. No signature required.", 14, footY + 6);
  doc.text("Goods once sold will not be taken back. For queries: " + SHOP_EMAIL, 14, footY + 12);
  doc.text(`GSTIN: ${SHOP_GSTIN} | Subject to Nagpur jurisdiction`, 14, footY + 18);

  // Thank you
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...AMBER);
  doc.text("Thank you for choosing Prem Mithas! 🍬", pageW / 2, footY + 26, { align: "center" });

  // ── Save ──
  doc.save(`PremMithas-Invoice-${invNo}.pdf`);
};