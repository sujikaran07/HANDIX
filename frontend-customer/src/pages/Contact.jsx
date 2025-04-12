
import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState({
    submitted: false,
    success: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus({
      submitted: true,
      success: true
    });

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });

    setTimeout(() => {
      setSubmitStatus({
        submitted: false,
        success: false
      });
    }, 5000);
  };

  return (
    <div className="contact-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Contact Us</h1>
          <p className="page-description">
            Have questions about our products or want to learn more about our artisans?
            We'd love to hear from you! Get in touch with our team.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h2 className="contact-info-title">Get In Touch</h2>
            <div className="contact-item">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="contact-content">
                <h3>Our Location</h3>
                <address>
                  123 Handcraft Street<br />
                  Artisan City, AC 12345<br />
                  United States
                </address>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <div className="contact-content">
                <h3>Email Us</h3>
                <p>
                  <a href="mailto:info@handix.com">info@handix.com</a>
                </p>
                <p>
                  <a href="mailto:support@handix.com">support@handix.com</a>
                </p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <FaPhone />
              </div>
              <div className="contact-content">
                <h3>Call Us</h3>
                <p>
                  <a href="tel:+1234567890">(123) 456-7890</a>
                </p>
                <p>Monday - Friday: 9am - 5pm EST</p>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h2 className="form-title">Send Us a Message</h2>

            {submitStatus.submitted && submitStatus.success && (
              <div className="success-message">
                Your message has been sent successfully! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="social-media">
          <h2 className="social-title">Follow Us</h2>
          <p className="social-text">
            Stay updated with our latest products, artisan stories, and special offers by following us on social media.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram />
            </a>
          </div>
        </div>

        <div className="map-section">
          <h2 className="map-title">Find Us</h2>
          <div className="map-container">
            <p>[Map would be embedded here using Google Maps or similar service]</p>
          </div>
        </div>

        <div className="faq-section">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="faq-item">
            <h3 className="faq-question">What payment methods do you accept?</h3>
            <p className="faq-answer">
              We accept all major credit cards, PayPal, and Apple Pay. All transactions are secure and encrypted.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">How long does shipping take?</h3>
            <p className="faq-answer">
              Domestic orders typically arrive within 3-5 business days. International shipping may take 7-14 business days depending on the destination.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">What is your return policy?</h3>
            <p className="faq-answer">
              We accept returns within 30 days of delivery. Items must be in original condition with tags attached. Please note that custom orders are non-returnable.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">How can I track my order?</h3>
            <p className="faq-answer">
              Once your order ships, you will receive a confirmation email with tracking information. You can also check your order status in your account dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;