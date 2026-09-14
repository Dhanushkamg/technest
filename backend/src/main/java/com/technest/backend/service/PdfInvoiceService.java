package com.technest.backend.service;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.technest.backend.entity.Order;
import com.technest.backend.entity.OrderItem;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfInvoiceService {

    public byte[] generateInvoice(Order order) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.BLACK);
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);

            // Header
            Paragraph title = new Paragraph("TechNest Invoice", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // Order Info
            document.add(new Paragraph("Order ID: #" + order.getId(), headFont));
            document.add(new Paragraph("Date: " + order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")), normalFont));
            document.add(new Paragraph("Status: " + order.getStatus(), normalFont));
            document.add(new Paragraph(" "));

            // Customer Info
            document.add(new Paragraph("Bill To:", headFont));
            document.add(new Paragraph(order.getDeliveryAddress().getFullName(), normalFont));
            document.add(new Paragraph(order.getUser().getEmail(), normalFont));
            document.add(new Paragraph(order.getDeliveryAddress().getAddressLine1(), normalFont));
            if (order.getDeliveryAddress().getAddressLine2() != null) {
                document.add(new Paragraph(order.getDeliveryAddress().getAddressLine2(), normalFont));
            }
            document.add(new Paragraph(order.getDeliveryAddress().getCity() + ", " + order.getDeliveryAddress().getCountry(), normalFont));
            document.add(new Paragraph(" "));

            // Items Table
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{4, 2, 2, 2});

            PdfPCell hcell;
            hcell = new PdfPCell(new Phrase("Product", headFont));
            hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(hcell);

            hcell = new PdfPCell(new Phrase("Quantity", headFont));
            hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(hcell);

            hcell = new PdfPCell(new Phrase("Unit Price", headFont));
            hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(hcell);

            hcell = new PdfPCell(new Phrase("Total", headFont));
            hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(hcell);

            for (OrderItem item : order.getItems()) {
                PdfPCell cell;
                
                cell = new PdfPCell(new Phrase(item.getProductName(), normalFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase("$" + item.getPrice().toString(), normalFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase("$" + item.getSubtotal().toString(), normalFont));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(cell);
            }

            document.add(table);
            document.add(new Paragraph(" "));

            // Totals
            Paragraph totals = new Paragraph();
            totals.setAlignment(Element.ALIGN_RIGHT);
            totals.add(new Phrase("Subtotal: $" + order.getSubtotal() + "\n", normalFont));
            if (order.getDiscountAmount() != null && order.getDiscountAmount().doubleValue() > 0) {
                totals.add(new Phrase("Discount: -$" + order.getDiscountAmount() + "\n", normalFont));
            }
            totals.add(new Phrase("Total Amount: $" + order.getTotalAmount(), headFont));
            document.add(totals);

            document.close();
        } catch (DocumentException ex) {
            throw new RuntimeException("Error generating PDF invoice", ex);
        }

        return out.toByteArray();
    }
}
