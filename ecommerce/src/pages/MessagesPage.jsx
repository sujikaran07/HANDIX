import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const BACKEND_URL = 'http://localhost:5000';

const MessagesPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  let customerId = localStorage.getItem('customerId');
  let token = localStorage.getItem('customerToken') || localStorage.getItem('token');

  // Fallback: try to get from user object if not found
  if (!customerId || !token) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!customerId && user.c_id) customerId = user.c_id;
        if (!token && user.token) token = user.token;
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }
  console.log('customerId:', customerId, 'token:', token); // Debug log

  // Fetch customer's orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      setError(null);
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/orders/simple-customer?customerId=${customerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('API response:', res.data); // Debug log
        if (Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setError('Failed to load orders.');
        console.error('Failed to load orders:', err); // Debug log
      } finally {
        setLoadingOrders(false);
      }
    };
    if (customerId && token) fetchOrders();
  }, [customerId, token]);

  // When an order is selected, fetch or create the conversation, then fetch messages
  useEffect(() => {
    const fetchOrCreateConversation = async () => {
      if (!selectedOrder) return;
      setConversation(null);
      setMessages([]);
      setLoadingMessages(true);
      setError(null);
      try {
        // Try to get the conversation for this order
        let convRes;
        try {
          convRes = await axios.get(
            `${BACKEND_URL}/api/conversations/order/${selectedOrder.order_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          // If not found, create it
          if (err.response && err.response.status === 404) {
            convRes = await axios.post(
              `${BACKEND_URL}/api/conversations/`,
              {
                order_id: selectedOrder.order_id,
                customer_id: customerId,
                artisan_id: selectedOrder.assignedArtisanId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } else {
            throw err;
          }
        }
        setConversation(convRes.data);
        // Fetch messages for this conversation
        const msgRes = await axios.get(
          `${BACKEND_URL}/api/messages/conversation/${convRes.data.conversations_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(msgRes.data || []);
      } catch (err) {
        setError('Failed to load conversation or messages.');
      } finally {
        setLoadingMessages(false);
      }
    };
    if (selectedOrder && token) fetchOrCreateConversation();
  }, [selectedOrder, customerId, token]);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;
    setSending(true);
    setError(null);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/messages/`,
        {
          conversation_id: conversation.conversations_id,
          sender_id: customerId,
          sender_role: 'customer',
          message_text: newMessage.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <h1 className="text-3xl font-bold mb-8">Order Messages</h1>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="grid md:grid-cols-3 h-[600px]">
              {/* Orders List */}
              <div className="md:col-span-1 border-r overflow-y-auto">
                <div className="p-4 border-b">
                  <h2 className="font-semibold">Your Orders</h2>
                </div>
                <div
                  style={{
                    maxHeight: '480px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                  }}
                  className="hide-scrollbar"
                >
                  {loadingOrders ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                  ) : orders.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No orders found.</div>
                  ) : (
                    orders.map(order => (
                      <div
                        key={order.order_id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedOrder?.order_id === order.order_id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleOrderSelect(order)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">Order #{order.order_id}</h3>
                          <span className="text-xs text-gray-500">
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          Artisan: {order.assignedArtisanName || order.assignedArtisan || 'N/A'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Message Content */}
              <div className="md:col-span-2 flex flex-col">
                {selectedOrder ? (
                  <>
                    <div className="p-4 border-b">
                      <h2 className="font-semibold">
                        Order #{selectedOrder.order_id} - Artisan: {selectedOrder.assignedArtisanName || selectedOrder.assignedArtisan || 'N/A'}
                      </h2>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto">
                      {loadingMessages ? (
                        <div className="text-center text-gray-500">Loading messages...</div>
                      ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500">No messages yet.</div>
                      ) : (
                        messages.map(message => (
                          <div
                            key={message.message_id}
                            className={`message-row ${message.sender_role === 'customer' ? 'customer' : 'artisan'}`}
                          >
                            <div
                              style={{
                                background: message.sender_role === 'customer' ? '#3e87c3' : '#fff',
                                color: message.sender_role === 'customer' ? '#fff' : '#222',
                                borderRadius: '16px',
                                padding: '12px 18px',
                                marginBottom: '12px',
                                maxWidth: '70%',
                                marginLeft: message.sender_role === 'customer' ? 'auto' : undefined,
                                marginRight: message.sender_role === 'customer' ? undefined : 'auto',
                                boxShadow: '0 2px 8px rgba(44,62,80,0.04)',
                                border: message.sender_role === 'customer' ? 'none' : '1px solid #ececec',
                                textAlign: 'left',
                              }}
                            >
                              <div className="flex items-center mb-1">
                                <span className="text-xs font-medium">
                                  {message.sender_role === 'customer' ? 'You' : 'Artisan'}
                                </span>
                              </div>
                              <p>{message.message_text}</p>
                              <div className="message-meta">
                                {formatDate(message.sent_at)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={sending}
                        />
                        <button
                          type="submit"
                          className="bg-primary text-white p-2 rounded-r-md"
                          disabled={!newMessage.trim() || sending}
                          aria-label="Send message"
                        >
                          <Send size={20} />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} className="text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Order Messages</h3>
                      <p className="text-gray-500 mb-4">
                        Select an order to view your messages with the artisan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessagesPage;