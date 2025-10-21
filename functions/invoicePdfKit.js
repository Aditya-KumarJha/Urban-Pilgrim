const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function currency(val) {
  const n = Number(val || 0);
  return isFinite(n) ? n : 0;
}

function makeDoc(invoiceData = {}) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  return doc;
}

async function generateInvoicePdfBuffer(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = makeDoc(invoiceData);
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('error', reject);
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const company = invoiceData.company || {};
      const customer = invoiceData.customer || {};
      const provider = invoiceData.provider || {};
      const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];
      const invoiceNumber = invoiceData.invoiceNumber || 'INVOICE';
      const invoiceDate = invoiceData.invoiceDate || new Date().toLocaleDateString('en-IN');
      const totalAmount = currency(invoiceData.totalAmount);

      // Header with logo and TAX INVOICE
      const startY = 50;
      
      // Try to add logo
      try {
        const logoPath = path.join(__dirname, 'urban_pilgrim_logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 40, startY, { width: 80, height: 80 });
        } else {
          doc.fontSize(16).font('Helvetica-Bold').text(company.name || 'Urban Pilgrim', 40, startY);
        }
      } catch (e) {
        doc.fontSize(16).font('Helvetica-Bold').text(company.name || 'Urban Pilgrim', 40, startY);
      }
      
      doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', 400, startY, { align: 'right' });
      
      // Company details (left side) - 10px gap after logo
      doc.fontSize(9).font('Helvetica')
        .text(company.address || '', 40, startY + 80, { width: 250 })
        .text(company.email ? `Email: ${company.email}` : '', 40)
        .text(company.phone ? `Telephone: ${company.phone}` : '', 40)
        .text(company.cin ? `CIN: ${company.cin}` : '', 40)
        .text(company.website ? `www.${company.website}` : '', 40);

      // Horizontal line
      doc.moveTo(40, 180).lineTo(555, 180).stroke();

      // Left column - Customer details
      let yPos = 200;
      doc.fontSize(10).font('Helvetica-Bold').text('Customer Name', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.name || 'Customer', 40, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Invoice no.', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(invoiceNumber, 40, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Delivery Address', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.address || '', 40, yPos + 15, { width: 220 });

      yPos += 60;
      doc.fontSize(10).font('Helvetica-Bold').text('Invoice Date', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(invoiceDate, 40, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('State Name & Code', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.state || '', 40, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Place of Supply', 40, yPos);
      doc.fontSize(9).font('Helvetica').text(customer.placeOfSupply || customer.state || '', 40, yPos + 15);

      // Right column - Delivery Service Provider
      yPos = 200;
      doc.fontSize(10).font('Helvetica-Bold').text('DELIVERY SERVICE PROVIDER', 320, yPos);

      yPos += 25;
      doc.fontSize(10).font('Helvetica-Bold').text('Business GSTIN', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.gstin || '', 320, yPos + 15);

      yPos += 40;
      doc.fontSize(10).font('Helvetica-Bold').text('Business Name', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.name || company.name || '', 320, yPos + 15, { width: 235 });

      yPos += 60;
      doc.fontSize(10).font('Helvetica-Bold').text('Address', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.address || '', 320, yPos + 15, { width: 235 });

      yPos += 60;
      doc.fontSize(10).font('Helvetica-Bold').text('State Name & Code', 320, yPos);
      doc.fontSize(9).font('Helvetica').text(provider.state || '', 320, yPos + 15);

      // Items section
      yPos = 480;
      doc.fontSize(10).font('Helvetica-Bold').text('Items', 40, yPos);
      doc.fontSize(9).font('Helvetica').text('Taxable Value', 480, yPos, { align: 'right' });

      yPos += 25;
      // Items table
      let totalGross = 0;
      let totalDiscount = 0;
      let totalTaxable = 0;
      let totalIgst = 0;
      let totalGiftCardDiscount = 0;
      for (const it of items) {
        const title = (it.title || '').toString();
        const sac = (it.sac || '').toString();
        const gross = currency(it.gross);
        const discount = currency(it.discount);
        const taxable = currency(it.taxableValue);
        const igst = currency(it.igst || 0);
        const GiftCardCoupon = currency(it?.GiftCardCoupon || 0);

        totalGross += gross;
        totalDiscount += discount;
        totalTaxable += taxable;
        totalIgst += igst;
        totalGiftCardDiscount += GiftCardCoupon;

        // Simple item display: title and price only
        doc.fontSize(9).font('Helvetica').text(title, 40, yPos, { width: 420 });
        doc.text(`Rs. ${gross.toFixed(2)}`, 500, yPos, { align: 'right' });
        yPos += 15;
        
        if (sac) {
          doc.fontSize(8).font('Helvetica').text(`SAC: ${sac}`, 40, yPos);
          yPos += 15;
        }
        
        yPos += 5; // Small gap between items
      }

      // Summary Section
      yPos += 10;
      doc.moveTo(40, yPos).lineTo(570, yPos).stroke();
      yPos += 15;
      
      const summaryX = 350;
      
      // Total Price (sum of all item prices)
      doc.fontSize(9).font('Helvetica').text('Total Price', summaryX, yPos);
      doc.text(`Rs. ${totalGross.toFixed(2)}`, 500, yPos, { align: 'right' });
      
      // Tax with percentage
      yPos += 15;
      const avgGstRate = totalTaxable > 0 ? ((totalIgst / totalTaxable) * 100).toFixed(0) : '18';
      doc.text(`Tax (${avgGstRate}%)`, summaryX, yPos);
      doc.text(`Rs. ${totalIgst.toFixed(2)}`, 500, yPos, { align: 'right' });
      
      // Discount
      if (totalDiscount > 0) {
        yPos += 15;
        const discountPercentage = totalGross > 0 ? ((totalDiscount / totalGross) * 100).toFixed(2) : '0';
        doc.text(`Discount (${discountPercentage}%)`, summaryX, yPos);
        doc.text(`- Rs. ${totalDiscount.toFixed(2)}`, 500, yPos, { align: 'right' });
      }
      
      // Gift Card Discount
      if (totalGiftCardDiscount > 0) {
        yPos += 15;
        doc.text('Gift Card Discount', summaryX, yPos);
        doc.text(`- Rs. ${totalGiftCardDiscount.toFixed(2)}`, 500, yPos, { align: 'right' });
      }
      
      yPos += 20;
      doc.moveTo(40, yPos).lineTo(570, yPos).stroke();
      yPos += 15;
      
      // Net Amount (Total Price + Tax - Discount - Gift Card Discount)
      const netAmount = totalGross + totalIgst - totalDiscount - totalGiftCardDiscount;
      doc.fontSize(11).font('Helvetica-Bold').text('Net Amount', summaryX, yPos);
      doc.text(`Rs. ${netAmount.toFixed(2)}`, 500, yPos, { align: 'right' });

      // Signature section
      const signatureY = 720;
      
      // Try to add signature image
      try {
        const signaturePath = path.join(__dirname, 'admin_signature.png');
        if (fs.existsSync(signaturePath)) {
          doc.image(signaturePath, 450, signatureY - 40, { width: 100, height: 40 });
        }
      } catch (e) {
        // Signature image not found, just show text
      }
      
      doc.fontSize(9).font('Helvetica').text('Authorized Signatory', 480, signatureY, { align: 'right' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generateInvoicePdfBuffer };
