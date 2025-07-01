import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const PoliciesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-12">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms & Conditions / Policies</h1>
            
            {/* Shipping Policy Sections */}
            <div className="mb-10 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-primary">Shipping Policy</h2>
              
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Business Customers:</h3>
                <p className="text-gray-700 mb-4">
                  Shipping fees for business accounts are based on the customer's delivery district (e.g., Colombo, Kandy, Jaffna). 
                  These district-specific rates are fixed and managed by our administration team. Shipping charges will be applied 
                  during checkout accordingly.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Personal Customers:</h3>
                <p className="text-gray-700 mb-4">
                  Personal customers will not see shipping fees during checkout. However, additional shipping charges may apply 
                  after delivery based on the actual weight of the package, following Sri Lankan courier service rates. 
                  We will notify you via email or SMS if any additional fees are incurred.
                </p>
              </div>

              <div className="mb-2">
                <h3 className="font-bold text-lg mb-2">Pick-Up Option:</h3>
                <p className="text-gray-700 mb-4">
                  Customers may choose to pick up their orders directly from our store free of shipping charges.
                </p>
              </div>
            </div>
            
            {/* Payment Policy Section */}
            <div className="mb-10 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-primary">Payment Policy</h2>
              
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Business Accounts:</h3>
                <p className="text-gray-700 mb-4">
                  Business customers may use Cash on Delivery (COD) with extended payment terms. Payment must be settled 
                  within the timeframe agreed upon by our administration.
                </p>
              </div>

              <div className="mb-2">
                <h3 className="font-bold text-lg mb-2">Personal Accounts:</h3>
                <p className="text-gray-700 mb-4">
                  Cash on Delivery is subject to availability and restrictions set by the administration. 
                  Please verify at checkout.
                </p>
              </div>
            </div>
            
            {/* Purchase Limits Section */}
            <div className="mb-10 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-primary">Purchase Limits</h2>
              <p className="text-gray-700 mb-4">
                Personal customers may be subject to purchase quantity restrictions on certain products, as enforced by the 
                administration to ensure fair access.
              </p>
            </div>
            
            {/* Refund and Cancellation Policy Section */}
            <div className="mb-10 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-primary">Refund and Cancellation Policy</h2>
              
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">No Refunds After Order Confirm:</h3>
                <p className="text-gray-700 mb-4">
                  Once an order is marked as completed and delivered, no refunds will be issued.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Order Cancellation by Administration:</h3>
                <p className="text-gray-700 mb-4">
                  If your order is canceled by our administration for any reason, you will be eligible for a full refund.
                </p>
              </div>

              <div className="mb-2">
                <h3 className="font-bold text-lg mb-2">Customer Responsibility:</h3>
                <p className="text-gray-700 mb-4">
                  Please review your order carefully before confirming, as cancellations or refunds requested by customers 
                  after order completion cannot be accommodated.
                </p>
              </div>
            </div>
            
            {/* Additional Charges Section */}
            <div className="mb-10 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-primary">Additional Charges and Notifications</h2>
              <p className="text-gray-700 mb-4">
                If additional shipping charges apply after delivery due to package weight or packaging, customers will 
                receive notification via email or SMS with full details.
              </p>
            </div>
            
            {/* Changes to Policies Section */}
            <div className="mb-10 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-primary">Changes to Policies</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to update or modify our shipping, payment, purchase limit, and refund policies 
                at any time without prior notice. Customers are encouraged to review our policies regularly.
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-gray-700 font-medium">
                Please read and understand these policies carefully before placing your order.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PoliciesPage;
