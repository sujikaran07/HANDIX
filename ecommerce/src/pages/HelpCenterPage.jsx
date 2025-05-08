import React, { useState } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronRight, Mail, Phone } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [activeCategory, setActiveCategory] = useState('ordering');
  
  const faqCategories = [
    {
      name: 'ordering',
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'To place an order, browse our collection, select the items you want, and add them to your cart. When you\'re ready to checkout, click on the cart icon, review your items, and follow the checkout process.'
        },
        {
          question: 'Can I modify my order after it\'s been placed?',
          answer: 'Yes, you can modify your order within 1 hour of placing it. After that, please contact our customer service team for assistance.'
        },
        {
          question: 'How can I check the status of my order?',
          answer: 'You can check your order status by logging into your account and visiting the "Purchases and Reviews" section. There, you\'ll see all your orders and their current status.'
        }
      ]
    },
    {
      name: 'shipping',
      faqs: [
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping typically takes 3-7 business days within Sri Lanka. International shipping can take 7-14 business days depending on the destination country.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination.'
        },
        {
          question: 'How can I track my shipment?',
          answer: 'Once your order ships, you\'ll receive a tracking number via email. You can use this number to track your package on our website or through the carrier\'s website.'
        }
      ]
    },
    {
      name: 'returns',
      faqs: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of delivery for most items. The products must be unused and in their original packaging.'
        },
        {
          question: 'How do I initiate a return?',
          answer: 'To initiate a return, log into your account, go to your order history, select the order containing the item you wish to return, and follow the return instructions.'
        },
        {
          question: 'How long does it take to process a refund?',
          answer: 'Once we receive your returned item, it typically takes 5-7 business days to process your refund. The time it takes for the refund to appear in your account depends on your payment method and financial institution.'
        }
      ]
    },
    {
      name: 'account',
      faqs: [
        {
          question: 'How do I reset my password?',
          answer: 'To reset your password, click on the "Sign In" button, then select "Forgot Password." Enter your email address, and we\'ll send you instructions to reset your password.'
        },
        {
          question: 'How can I update my account information?',
          answer: 'You can update your account information by logging in and going to "Account Settings." There, you can edit your personal details, change your password, and manage your saved addresses.'
        },
        {
          question: 'Can I have multiple addresses saved in my account?',
          answer: 'Yes, you can save multiple shipping addresses in your account for convenient checkout. Add or manage addresses in the "Account Settings" section.'
        }
      ]
    }
  ];
  
  const handleToggleFaq = (questionId) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };
  
  // Filter FAQs based on search query
  const getFilteredFaqs = () => {
    if (!searchQuery.trim()) {
      return [];
    }
    
    const query = searchQuery.toLowerCase();
    const results = [];
    
    faqCategories.forEach(category => {
      category.faqs.forEach(faq => {
        if (
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
        ) {
          results.push({
            category: category.name,
            question: faq.question,
            answer: faq.answer
          });
        }
      });
    });
    
    return results;
  };
  
  // Generate a unique ID for each FAQ
  const getFaqId = (categoryName, questionIndex) => {
    return `faq-${categoryName}-${questionIndex}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-600 mb-8">Find answers to common questions about our products and services.</p>
          
          {/* Search Section */}
          <div className="bg-white shadow-sm rounded-lg p-8 mb-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-center">How can we help you?</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for answers..."
                  className="w-full py-3 px-4 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              </div>
              
              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Search Results:</h3>
                  {getFilteredFaqs().length === 0 ? (
                    <p className="text-gray-500">No results found. Please try a different search term.</p>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredFaqs().map((result, index) => (
                        <div key={index} className="border rounded-md overflow-hidden">
                          <div 
                            className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
                            onClick={() => handleToggleFaq(`search-${index}`)}
                          >
                            <h4 className="font-medium">{result.question}</h4>
                            {expandedFaqs[`search-${index}`] ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </div>
                          {expandedFaqs[`search-${index}`] && (
                            <div className="p-4 bg-white">
                              <p className="text-gray-600">{result.answer}</p>
                              <p className="mt-2 text-sm text-gray-500">
                                Category: <span className="capitalize">{result.category}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="grid md:grid-cols-4">
              {/* Categories */}
              <div className="md:col-span-1 border-r">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Categories</h3>
                </div>
                <nav>
                  {faqCategories.map((category) => (
                    <button
                      key={category.name}
                      className={`w-full text-left p-4 border-b hover:bg-gray-50 ${
                        activeCategory === category.name ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => setActiveCategory(category.name)}
                    >
                      <span className="capitalize">{category.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* FAQ Content */}
              <div className="md:col-span-3 p-6">
                {activeCategory ? (
                  <>
                    <h2 className="text-xl font-semibold mb-4 capitalize">{activeCategory} FAQs</h2>
                    <div className="space-y-4">
                      {faqCategories
                        .find(cat => cat.name === activeCategory)
                        ?.faqs.map((faq, index) => {
                          const faqId = getFaqId(activeCategory, index);
                          return (
                            <div key={faqId} className="border rounded-md overflow-hidden">
                              <div 
                                className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
                                onClick={() => handleToggleFaq(faqId)}
                              >
                                <h4 className="font-medium">{faq.question}</h4>
                                {expandedFaqs[faqId] ? (
                                  <ChevronDown size={18} />
                                ) : (
                                  <ChevronRight size={18} />
                                )}
                              </div>
                              {expandedFaqs[faqId] && (
                                <div className="p-4">
                                  <p className="text-gray-600">{faq.answer}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a Category</h3>
                    <p className="text-gray-500">
                      Choose a category from the sidebar to view frequently asked questions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Contact Us */}
          <div className="bg-white shadow-sm rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Still Need Help?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-md p-5 flex items-start">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Mail size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Email Support</h3>
                  <p className="text-gray-600 mb-3">
                    Send us an email and we'll get back to you within 24 hours.
                  </p>
                  <a href="mailto:handixecommerce@gmail.com" className="text-primary hover:underline">
                    handixecommerce@gmail.com
                  </a>
                </div>
              </div>
              <div className="border rounded-md p-5 flex items-start">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Phone size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Phone Support</h3>
                  <p className="text-gray-600 mb-3">
                    Available Monday to Friday, 9AM - 6PM (Sri Lanka time).
                  </p>
                  <div>
                    <a href="tel:+94776360319" className="text-primary hover:underline block">
                      +94 77 636 0319
                    </a>
                    <a href="tel:0242223344" className="text-primary hover:underline block">
                      024 2223344
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HelpCenterPage;