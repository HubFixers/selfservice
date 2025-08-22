const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceipt = async (booking, settings) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filename = `receipt-${booking._id}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../receipts', filename);

      // Ensure receipts directory exists
      const receiptsDir = path.join(__dirname, '../receipts');
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(settings.businessInfo.name, 50, 50);
      doc.fontSize(12).text(settings.businessInfo.address, 50, 80);
      doc.text(settings.businessInfo.phone, 50, 95);
      doc.text(settings.businessInfo.email, 50, 110);

      // Title
      doc.fontSize(18).text('PAYMENT RECEIPT', 50, 150);
      
      // Receipt details
      doc.fontSize(12);
      doc.text(`Receipt #: ${booking._id}`, 50, 180);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 195);
      doc.text(`Payment Status: PAID`, 50, 210);

      // Customer details
      doc.text('CUSTOMER INFORMATION:', 50, 240);
      doc.text(`Name: ${booking.customerName}`, 50, 260);
      doc.text(`Email: ${booking.customerEmail}`, 50, 275);
      doc.text(`Phone: ${booking.customerPhone}`, 50, 290);

      // Service details
      doc.text('SERVICE DETAILS:', 50, 320);
      doc.text(`Service: ${booking.service.name}`, 50, 340);
      doc.text(`Date: ${new Date(booking.bookingDate).toLocaleDateString()}`, 50, 355);
      doc.text(`Time: ${booking.bookingTime}`, 50, 370);

      // Payment details
      doc.text('PAYMENT DETAILS:', 50, 400);
      doc.text(`Retainer Amount: $${booking.retainerAmount.toFixed(2)}`, 50, 420);
      doc.text(`Payment Method: As per instructions`, 50, 435);

      // Footer
      doc.text('Thank you for your business!', 50, 480);
      doc.text('This receipt confirms your payment has been received.', 50, 500);

      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filepath });
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateReceipt };