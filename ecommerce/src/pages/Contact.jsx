import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  // Form state for contact form
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
            <p className="text-gray-600 mb-12">
              Have questions, feedback, or inquiries about our handcrafted products? 
              We'd love to hear from you! Fill out the form below or reach out through our contact information.
            </p>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form Section */}
              <div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">Send us a message</h2>
                  {/* Success message after submit */}
                  {submitted ? (
                    <div className="bg-green-50 p-6 rounded-md flex flex-col items-center text-center">
                      <CheckCircle className="text-green-500 mb-3" size={48} />
                      <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                      <p className="text-gray-600 mb-4">
                        Thank you for reaching out. We'll get back to you within 1-2 business days.
                      </p>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {/* Name input */}
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 mb-1">Your Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      {/* Email input */}
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      {/* Subject input */}
                      <div className="mb-4">
                        <label htmlFor="subject" className="block text-gray-700 mb-1">Subject</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formState.subject}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      {/* Message textarea */}
                      <div className="mb-6">
                        <label htmlFor="message" className="block text-gray-700 mb-1">Your Message</label>
                        <textarea
                          id="message"
                          name="message"
                          value={formState.message}
                          onChange={handleChange}
                          rows={5}
                          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      {/* Error message */}
                      {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                          {error}
                        </div>
                      )}
                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-3 px-6 rounded-md bg-primary text-white 
                          ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-hover'}`}
                      >
                        {submitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
              {/* Contact Information Section */}
              <div>
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                  <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                  <div className="space-y-6">
                    {/* Mullaitivu Branch */}
                    <div className="flex items-start">
                      <MapPin className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Mullaitivu Branch</p>
                        <p className="text-gray-600">15 Main Street</p>
                        <p className="text-gray-600">Mullaitivu, Sri Lanka</p>
                      </div>
                    </div>
                    {/* Kilinochchi Branch */}
                    <div className="flex items-start">
                      <MapPin className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Kilinochchi Branch</p>
                        <p className="text-gray-600">27 KKS Road</p>
                        <p className="text-gray-600">Kilinochchi, Sri Lanka</p>
                      </div>
                    </div>
                    {/* Phone */}
                    <div className="flex items-start">
                      <Phone className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">+94 77 636 0319</p>
                        <p className="text-gray-600">024 2223344</p>
                        <p className="text-gray-600">Monday - Friday: 9am to 6pm</p>
                        <p className="text-gray-600">Saturday: 10am to 4pm</p>
                      </div>
                    </div>
                    {/* Email */}
                    <div className="flex items-start">
                      <Mail className="text-primary mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">handixecommerce@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Business Hours Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-3">Business Hours</h3>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Monday - Friday</td>
                        <td className="py-2 text-right">9:00 AM - 6:00 PM</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Saturday</td>
                        <td className="py-2 text-right">10:00 AM - 4:00 PM</td>
                      </tr>
                      <tr>
                        <td className="py-2">Sunday</td>
                        <td className="py-2 text-right">Closed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Map Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Find Us</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Mullaitivu Branch Map */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mullaitivu Branch</h3>
                  <div className="h-80 rounded-lg overflow-hidden">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d245.94169374844828!2d80.61957771157746!3d9.35177424057748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afeb9c76e7c0ccb%3A0xf2688182a924b229!2sStyle%20Tailor!5e0!3m2!1sen!2slk!4v1683557689012!5m2!1sen!2slk" 
                      width="100%" 
                      height="100%" 
                      style={{border:0}}
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mullaitivu Branch Location"
                      aria-label="Map showing location of our Mullaitivu branch"
                    ></iframe>
                  </div>
                  <p className="mt-2 text-gray-600">15 Main Street, Mullaitivu</p>
                </div>
                {/* Kilinochchi Branch Map */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Kilinochchi Branch</h3>
                  <div className="h-80 rounded-lg overflow-hidden">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3934.744731181923!2d80.40613431479272!3d9.400763193258407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afe956330d21fe3%3A0xa2062b08ec710ffe!2sSingha%20Suppliers%20%26%20Tailors!5e0!3m2!1sen!2slk!4v1683557777038!5m2!1sen!2slk"
                      width="100%" 
                      height="100%" 
                      style={{border:0}}
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Kilinochchi Branch Location"
                      aria-label="Map showing location of our Kilinochchi branch"
                    ></iframe>
                  </div>
                  <p className="mt-2 text-gray-600">27 KKS Road, Kilinochchi</p>
                </div>
              </div>
              {/* Directions Info */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">
                  Need directions? <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Open Google Maps</a> or give us a call at +94 77 636 0319.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
      
  