const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create transporter with your existing email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Helps with some SMTP servers
  }
});

// Function to send invoice email
const sendInvoiceEmail = async (orderData) => {
  try {
    console.log(`Attempting to send invoice to ${orderData.customerEmail}`);
    
    // Generate HTML invoice
    const html = generateInvoiceHTML(orderData);
    
    // Try multiple possible logo paths
    const logoPaths = [
      path.join(__dirname, '../public/images/handix-logo1.png'),                     // Within backend folder
      path.join(__dirname, '../../../ecommerce/public/images/handix-logo1.png'),     // From ecommerce folder
      path.join(__dirname, '../../../frontend/public/images/handix-logo1.png'),      // From frontend folder
      path.join(__dirname, '../../../public/images/handix-logo1.png')                // From root directory
    ];
    
    // Find the first path that exists
    let logoPath = null;
    for (const potentialPath of logoPaths) {
      if (fs.existsSync(potentialPath)) {
        logoPath = potentialPath;
        console.log(`Found logo at: ${logoPath}`);
        break;
      }
    }
    
    // Prepare attachments
    const attachments = [];
    if (logoPath) {
      attachments.push({
        filename: 'handix-logo.png',
        path: logoPath,
        cid: 'companyLogo'
      });
    } else {
      console.log("Logo file not found, using text-only header");
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
      to: orderData.customerEmail,
      subject: `Your Handix Crafts Order Invoice #${orderData.order_id}`,
      html,
      attachments
    });
    
    console.log(`Invoice email sent to ${orderData.customerEmail} with ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return false;
  }
};

function generateInvoiceHTML(orderData) {
  const currentYear = new Date().getFullYear();
  
  const orderDate = new Date(orderData.orderDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  const subtotal = parseFloat(orderData.totalAmount || 0) - parseFloat(orderData.shippingFee || 0);
  const shippingFee = parseFloat(orderData.shippingFee || 0);
  const totalAmount = parseFloat(orderData.totalAmount || 0);
  
  let itemsHTML = '';
  if (Array.isArray(orderData.orderDetails)) {
    orderData.orderDetails.forEach(item => {
      const price = parseFloat(item.priceAtPurchase || item.price_at_purchase || 0);
      const quantity = item.quantity || 1;
      const customizationFee = parseFloat(item.customization_fee || 0);
      const total = (price * quantity) + customizationFee;
      
      let customizationText = '';
      if (item.customization) {
        customizationText = `
          <div style="font-style: italic; color: #666; font-size: 0.9em; margin-top: 4px;">
            Customization: ${item.customization}
            ${customizationFee > 0 ? `(+LKR ${formatCurrency(customizationFee)})` : ''}
          </div>
        `;
      }
      
      itemsHTML += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">
            Product #${item.product_id}
            ${customizationText}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">LKR ${formatCurrency(price)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">LKR ${formatCurrency(total)}</td>
        </tr>
      `;
    });
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Handix Crafts - Invoice</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: #f9f9f9;
          line-height: 1.6;
        }
        .invoice-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .invoice-header {
          background-color: #0c4a6e; /* Updated to match the darker blue in reference image */
          color: white;
          padding: 25px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .invoice-logo {
          width: 50%;
          text-align: left;
        }
        .invoice-logo img {
          height: 60px;
          display: block;
        }
        .invoice-title {
          width: 50%;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 1px;
          text-align: right;
        }
        .invoice-body {
          padding: 30px;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }
        .invoice-details-col {
          width: 48%;
        }
        .invoice-section-title {
          color: #333;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: bold;
        }
        .invoice-details-col p {
          margin: 0 0 5px 0;
          line-height: 1.5;
        }
        .item-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .item-table th {
          background-color: #065986;
          color: white;
          text-align: left;
          padding: 10px;
          font-weight: normal;
        }
        .item-table th:nth-child(2) {
          text-align: center;
        }
        .item-table th:nth-child(3),
        .item-table th:nth-child(4) {
          text-align: right;
        }
        .item-table td {
          padding: 10px;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }
        .item-table td:nth-child(2) {
          text-align: center;
        }
        .item-table td:nth-child(3),
        .item-table td:nth-child(4) {
          text-align: right;
        }
        .totals-section {
          width: 100%;
          margin-top: 20px;
        }
        .totals-table {
          width: 350px;
          margin-left: auto;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 8px 10px;
          border: none;
        }
        .totals-table td:last-child {
          text-align: right;
        }
        .totals-table tr.total-row {
          font-weight: bold;
          font-size: 1.1em;
          color: #065986;
          border-top: 1px solid #ddd;
        }
        .totals-table tr.total-row td {
          padding-top: 12px;
        }
        .invoice-footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .thank-you {
          background-color: #f0f9ff;
          padding: 15px;
          text-align: center;
          font-size: 18px;
          margin: 25px 0;
          color: #065986;
          font-weight: bold;
        }
        .contact-info {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin: 20px 0;
          line-height: 1.5;
        }
        .contact-info strong {
          color: #065986;
        }
        
        ${generateMobileResponsiveStyles()}
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="invoice-logo">
            <img src="cid:companyLogo" alt="Handix Crafts">
          </div>
          <div class="invoice-title">INVOICE</div>
        </div>
        
        <div class="invoice-body">
          <div class="invoice-details">
            <div class="invoice-details-col">
              <div class="invoice-section-title">Billed To:</div>
              <p><strong>${orderData.customerName || 'Valued Customer'}</strong></p>
              
              <div class="invoice-section-title" style="margin-top: 20px;">Invoice Details:</div>
              <p><strong>Invoice #:</strong> ${orderData.order_id}</p>
              <p><strong>Date:</strong> ${orderDate}</p>
              <p><strong>Payment Method:</strong> ${orderData.paymentMethod || 'Online Payment'}</p>
            </div>
            <div class="invoice-details-col" style="text-align: right;">
              <div class="invoice-section-title">Handix Crafts</div>
              <p>No 123, Kandy Rd, Mullaitivu, Sri Lanka</p>
              <p>Phone: +94 77-63 60319</p>
              <p>Email: ${process.env.EMAIL_USER}</p>
              <p>Website: www.handix.lk</p>
            </div>
          </div>
          
          <table class="item-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td>Subtotal:</td>
                <td>LKR ${formatCurrency(subtotal)}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td>LKR ${formatCurrency(shippingFee)}</td>
              </tr>
              <tr class="total-row">
                <td>Total:</td>
                <td>LKR ${formatCurrency(totalAmount)}</td>
              </tr>
            </table>
          </div>
          
          <div class="thank-you">
            Thank you for shopping with Handix Crafts!
          </div>
          
          <div class="contact-info">
            If you have any questions about this invoice, please contact our customer support at<br>
            <strong>+94 77-63 60319</strong> or <strong>${process.env.EMAIL_USER}</strong>
          </div>
        </div>
        
        <div class="invoice-footer">
          &copy; ${currentYear} Handix Crafts. All rights reserved. | Mullaitivu, Sri Lanka
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateMobileResponsiveStyles() {
  return `
    @media screen and (max-width: 600px) {
      .invoice-header {
        padding: 15px;
        flex-direction: column;
        text-align: center;
      }
      .invoice-logo, .invoice-title {
        width: 100%;
        text-align: center;
        margin-bottom: 10px;
      }
      .invoice-logo img {
        margin: 0 auto;
      }
      .invoice-body {
        padding: 15px;
      }
      .invoice-details {
        flex-direction: column;
      }
      .invoice-details-col {
        width: 100%;
        margin-bottom: 20px;
      }
      .invoice-details-col:last-child {
        text-align: left;
      }
      .item-table {
        font-size: 14px;
      }
      .item-table th, .item-table td {
        padding: 8px 5px;
      }
      .totals-table {
        width: 100%;
      }
    }
  `;
}

module.exports = {
  sendInvoiceEmail
};
