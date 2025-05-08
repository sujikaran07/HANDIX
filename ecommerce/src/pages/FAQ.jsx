import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQPage = () => {
  // FAQ data
  const faqCategories = [
    {
      id: 'ordering',
      title: 'Ordering & Payment',
      faqs: [
        {
          id: 'order-process',
          question: 'How do I place an order?',
          answer: 'You can place an order by browsing our product catalog, selecting the items you want to purchase, adding them to your cart, and proceeding to checkout. You\'ll need to provide shipping and payment information to complete your purchase.'
        },
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer: 'We accept Visa, Mastercard, American Express credit/debit cards, PayPal, and bank transfers for international customers. All payments are processed securely.'
        },
        {
          id: 'order-confirmation',
          question: 'How will I know if my order was successful?',
          answer: 'Once your order is successfully placed, you will receive an order confirmation email with your order number and details. If you don\'t receive this email within 24 hours, please contact our customer support.'
        },
        {
          id: 'cancel-order',
          question: 'Can I cancel or modify my order?',
          answer: 'You can modify or cancel your order within 24 hours of placing it by contacting our customer service. After this period, orders enter the processing stage and cannot be modified or canceled.'
        }
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      faqs: [
        {
          id: 'shipping-time',
          question: 'How long will it take to receive my order?',
          answer: 'Shipping times vary depending on your location. For domestic orders within Sri Lanka, delivery typically takes 3-5 business days. International shipping usually takes 7-14 business days, depending on the destination country and local customs processes.'
        },
        {
          id: 'shipping-cost',
          question: 'How much is shipping?',
          answer: 'Shipping costs are calculated based on the weight of your order and your delivery location. You can see the exact shipping cost during checkout before completing your payment. We offer free shipping on orders over $100 within Sri Lanka.'
        },
        {
          id: 'shipping-tracking',
          question: 'Can I track my order?',
          answer: 'Yes, once your order ships, you will receive a shipping confirmation email with tracking information. You can use this tracking number to monitor the status and location of your package.'
        },
        {
          id: 'international-shipping',
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. Please note that international orders may be subject to customs duties and import taxes, which are the responsibility of the recipient.'
        }
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Exchanges',
      faqs: [
        {
          id: 'return-policy',
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of delivery if the product is in its original condition. Custom or personalized items cannot be returned unless there is a manufacturing defect. To initiate a return, please contact our customer service team.'
        },
        {
          id: 'return-process',
          question: 'How do I return an item?',
          answer: 'To return an item, please contact our customer service with your order number and reason for return. We\'ll provide you with return instructions and a return shipping label (for domestic returns). Once we receive and inspect the returned item, we\'ll process your refund or exchange.'
        },
        {
          id: 'refund-time',
          question: 'When will I receive my refund?',
          answer: 'Once we receive and inspect your return, we\'ll process your refund within 3-5 business days. Depending on your payment method and financial institution, it may take an additional 5-10 business days for the refund to appear in your account.'
        },
        {
          id: 'damaged-items',
          question: 'What if my item arrives damaged?',
          answer: 'If your item arrives damaged, please contact us within 48 hours of receiving it. We\'ll need photos of the damaged product and packaging to process your claim. We\'ll either send a replacement or issue a refund, depending on product availability.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Products & Craftsmanship',
      faqs: [
        {
          id: 'product-care',
          question: 'How should I care for handcrafted items?',
          answer: 'Each product comes with specific care instructions. In general, handcrafted items should be handled with care, kept away from direct sunlight for extended periods, and cleaned according to the material type. For textile products, gentle hand washing is usually recommended.'
        },
        {
          id: 'product-variations',
          question: 'Why do the products look slightly different from the photos?',
          answer: 'Since our products are handcrafted, each item is unique and may have slight variations in color, texture, or pattern compared to the photos. These differences are not defects but rather a testament to the authentic handmade nature of our products.'
        },
        {
          id: 'artisans',
          question: 'Who makes your products?',
          answer: 'Our products are made by skilled local artisans from various regions of Sri Lanka. We work directly with individual craftspeople and small workshops to ensure fair compensation and sustainable working conditions.'
        },
        {
          id: 'materials',
          question: 'What materials do you use?',
          answer: 'We use a variety of locally-sourced, sustainable materials including natural fibers, responsibly harvested wood, recycled brass and copper, natural clay, and eco-friendly dyes. We prioritize materials that have minimal environmental impact.'
        }
      ]
    }
  ];

  // State to track which FAQ is expanded
  const [expandedFaqs, setExpandedFaqs] = useState({});

  // Toggle FAQ expansion
  const toggleFaq = (categoryId, faqId) => {
    setExpandedFaqs(prev => {
      const key = `${categoryId}-${faqId}`;
      return {
        ...prev,
        [key]: !prev[key]
      };
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
            
            <p className="text-gray-700 mb-8">
              Find answers to the most common questions about our products, ordering process, shipping, and more.
              If you can't find what you're looking for, please don't hesitate to <a href="/contact" className="text-primary hover:underline">contact us</a>.
            </p>
            
            <div className="space-y-8">
              {faqCategories.map(category => (
                <div key={category.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">{category.title}</h2>
                  
                  <div className="space-y-4">
                    {category.faqs.map(faq => {
                      const isExpanded = expandedFaqs[`${category.id}-${faq.id}`];
                      
                      return (
                        <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <button 
                            className="w-full text-left flex justify-between items-center py-2"
                            onClick={() => toggleFaq(category.id, faq.id)}
                          >
                            <h3 className="font-semibold text-lg">{faq.question}</h3>
                            {isExpanded ? 
                              <ChevronUp className="text-primary" size={20} /> : 
                              <ChevronDown className="text-primary" size={20} />
                            }
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-2 pl-2 text-gray-600">
                              <p>{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 bg-gray-100 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Still have questions?</h2>
              <p className="mb-4">
                If you couldn't find the answer to your question, please reach out to our customer service team.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-hover transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQPage;
