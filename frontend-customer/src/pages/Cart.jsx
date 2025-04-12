
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import '../styles/Cart.css';

const Cart = ({ cart, removeFromCart, updateQuantity }) => {
  const [checkoutStep, setCheckoutStep] = useState('cart'); 
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value
    });
  };

  const handleSubmitShipping = (e) => {
    e.preventDefault();
    setCheckoutStep('payment');
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    alert('Thank you for your order! This is a demo, so no actual order has been placed.');
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    return cart.length > 0 ? 5.99 : 0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.07;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

 
  const renderCartItems = () => {
    if (cart.length === 0) {
      return (
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <FaShoppingCart />
          </div>
          <h2 className="empty-cart-title">Your cart is empty</h2>
          <p className="empty-cart-text">Looks like you haven't added any products to your cart yet.</p>
          <Link
            to="/products"
            className="checkout-button"
          >
            Continue Shopping
          </Link>
        </div>
      );
    }

    return (
      <div>
        <div className="cart-items">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-name">{item.name}</div>
                  </td>
                  <td className="cart-price">${item.price.toFixed(2)}</td>
                  <td className="quantity-control">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-button"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="quantity-input"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-button"
                    >
                      +
                    </button>
                  </td>
                  <td className="cart-total">${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="remove-button"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {}
        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-item">
            <span className="summary-label">Subtotal</span>
            <span className="summary-value">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Shipping</span>
            <span className="summary-value">${calculateShipping().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tax</span>
            <span className="summary-value">${calculateTax().toFixed(2)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">Total</span>
            <span className="summary-total-value">${calculateTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={() => setCheckoutStep('shipping')}
            className="checkout-button"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    );
  };


  const renderShippingForm = () => {
    return (
      <div>
        <button
          onClick={() => setCheckoutStep('cart')}
          className="back-button"
        >
          <FaArrowLeft className="back-icon" />
          Back to Cart
        </button>

        <div className="shipping-form">
          <h2 className="form-title">Shipping Information</h2>
          <form onSubmit={handleSubmitShipping}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city" className="form-label">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="state" className="form-label">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="zipCode" className="form-label">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={shippingInfo.zipCode}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="country" className="form-label">Country</label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="checkout-button"
            >
              Continue to Payment
            </button>
          </form>
        </div>

        {}
        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-item">
            <span className="summary-label">Items ({cart.length})</span>
            <span className="summary-value">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Shipping</span>
            <span className="summary-value">${calculateShipping().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tax</span>
            <span className="summary-value">${calculateTax().toFixed(2)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">Total</span>
            <span className="summary-total-value">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

 
  const renderPaymentForm = () => {
    return (
      <div>
        <button
          onClick={() => setCheckoutStep('shipping')}
          className="back-button"
        >
          <FaArrowLeft className="back-icon" />
          Back to Shipping
        </button>

        <div className="payment-form">
          <h2 className="form-title">Payment Information</h2>
          <form onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label htmlFor="cardNumber" className="form-label">Card Number</label>
              <div className="card-input">
                <div className="card-icon">
                  <FaCreditCard />
                </div>
                <input
                  type="text"
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="card-number form-input"
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                <input
                  type="text"
                  id="expiryDate"
                  placeholder="MM/YY"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvv" className="form-label">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  placeholder="123"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nameOnCard" className="form-label">Name on Card</label>
              <input
                type="text"
                id="nameOnCard"
                placeholder="John Doe"
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              className="checkout-button"
            >
              Place Order
            </button>
          </form>
        </div>

        {}
        <div className="shipping-review">
          <div className="review-header">
            <h3 className="review-title">Shipping Information</h3>
            <button
              onClick={() => setCheckoutStep('shipping')}
              className="edit-button"
            >
              Edit
            </button>
          </div>
          <div className="review-content">
            <p>{shippingInfo.fullName}</p>
            <p>{shippingInfo.email}</p>
            <p>{shippingInfo.address}</p>
            <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
            <p>{shippingInfo.country}</p>
          </div>
        </div>

        {}
        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>
          {cart.map(item => (
            <div key={item.id} className="order-item">
              <span className="order-item-name">{item.name} <span className="order-item-quantity">x{item.quantity}</span></span>
              <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">Subtotal</span>
            <span className="summary-value">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Shipping</span>
            <span className="summary-value">${calculateShipping().toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tax</span>
            <span className="summary-value">${calculateTax().toFixed(2)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item">
            <span className="summary-label">Total</span>
            <span className="summary-total-value">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cart-container">
      <div className="container">
        <h1 className="cart-title">
          {checkoutStep === 'cart' ? 'Shopping Cart' :
           checkoutStep === 'shipping' ? 'Checkout - Shipping' : 'Checkout - Payment'}
        </h1>

        {}
        {cart.length > 0 && (
          <div className="progress-bar">
            <div className="progress-steps">
              <div className={`progress-step ${checkoutStep === 'cart' ? 'active' : checkoutStep === 'shipping' || checkoutStep === 'payment' ? 'completed' : 'inactive'}`}>1</div>
              <div className="progress-line"></div>
              <div className={`progress-step ${checkoutStep === 'shipping' ? 'active' : checkoutStep === 'payment' ? 'completed' : 'inactive'}`}>2</div>
              <div className="progress-line"></div>
              <div className={`progress-step ${checkoutStep === 'payment' ? 'active' : 'inactive'}`}>3</div>
            </div>
            <div className="progress-labels">
              <span className={checkoutStep === 'cart' ? 'active' : ''}>Cart</span>
              <span className={checkoutStep === 'shipping' ? 'active' : ''}>Shipping</span>
              <span className={checkoutStep === 'payment' ? 'active' : ''}>Payment</span>
            </div>
          </div>
        )}

        {}
        {checkoutStep === 'cart' && renderCartItems()}
        {checkoutStep === 'shipping' && renderShippingForm()}
        {checkoutStep === 'payment' && renderPaymentForm()}
      </div>
    </div>
  );
};

export default Cart;