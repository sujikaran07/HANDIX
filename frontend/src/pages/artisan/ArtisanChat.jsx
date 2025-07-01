import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaComments, FaPaperPlane, FaUser, FaPaperclip } from 'react-icons/fa';
import '../../styles/artisan/ArtisanDashboard.css';
import '../../styles/artisan/ArtisanChat.css';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

// Artisan chat interface for communicating with customers about orders
const ArtisanChat = () => {
  // State management for chat functionality
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [attachments, setAttachments] = useState([]);

  // Authentication data from localStorage
  const artisanId = localStorage.getItem('artisanId');
  const token = localStorage.getItem('artisanToken');

  // Fetch orders assigned to this artisan
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      setError(null);
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/orders/assigned-by-id/${artisanId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setError('Failed to load orders.');
      } finally {
        setLoadingOrders(false);
      }
    };
    if (artisanId && token) fetchOrders();
  }, [artisanId, token]);

  // Fetch or create conversation when order is selected
  useEffect(() => {
    const fetchOrCreateConversation = async () => {
      if (!selectedOrder) return;
      setConversation(null);
      setMessages([]);
      setLoadingMessages(true);
      setError(null);
      try {
        // Try to get existing conversation
        let convRes;
        try {
          convRes = await axios.get(
            `${BACKEND_URL}/api/conversations/order/${selectedOrder.order_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          // Create conversation if not found
          if (err.response && err.response.status === 404) {
            convRes = await axios.post(
              `${BACKEND_URL}/api/conversations/`,
              {
                order_id: selectedOrder.order_id,
                customer_id: selectedOrder.customerId,
                artisan_id: artisanId,
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
  }, [selectedOrder, artisanId, token]);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  // Handle file attachment selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit to 5 files, 5MB each
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024).slice(0, 5);
    setAttachments(validFiles);
  };

  // Send message with optional attachments
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!conversation) return;
    setSending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversation.conversations_id);
      formData.append('sender_id', artisanId);
      formData.append('sender_role', 'artisan');
      formData.append('message_text', newMessage.trim());
      attachments.forEach(file => formData.append('attachments', file));
      
      const res = await axios.post(
        `${BACKEND_URL}/api/messages/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      setAttachments([]);
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Format timestamp for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="artisan-chat-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        <div className="container mt-4 chat-container">
          <div className="card chat-card">
            {/* Chat header */}
            <div className="chat-header d-flex justify-content-between align-items-center mb-0">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaComments className="chat-icon" />
                  <div className="text-section">
                    <h2>Order Messages</h2>
                    <p>Chat with customers about their orders</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="chat-content">
              <div className="row h-100 g-0">
                {/* Orders list sidebar */}
                <div className="col-md-4 col-lg-3 border-end d-flex flex-column">
                  <div className="contacts-header p-3 border-bottom">
                    <div className="fw-bold mb-2">Assigned Orders</div>
                  </div>
                  <div
                    className="contacts-list hide-scrollbar"
                    style={{
                      maxHeight: '350px',
                      overflowY: 'auto',
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE and Edge
                    }}
                  >
                    {loadingOrders ? (
                      <div className="text-center my-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="text-center my-4 text-danger">{error}</div>
                    ) : orders.length === 0 ? (
                      <div className="text-center my-4">
                        <p className="text-muted">No assigned orders found</p>
                      </div>
                    ) : (
                      orders.map(order => (
                        <div
                          key={order.order_id}
                          className={`contact-item p-3 border-bottom ${selectedOrder && selectedOrder.order_id === order.order_id ? 'active' : ''}`}
                          onClick={() => handleOrderSelect(order)}
                        >
                          <div className="d-flex align-items-center">
                            <div className="avatar-container me-3">
                              <div className="default-avatar">
                                <FaUser />
                              </div>
                            </div>
                            <div className="contact-info flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">Order #{order.order_id}</h6>
                                <small className="text-muted">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</small>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <p className="text-truncate mb-1 small text-muted" style={{ maxWidth: '150px' }}>
                                  Customer: {order.customerName || order.customerId || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Chat conversation area */}
                <div className="col-md-8 col-lg-9">
                  {!selectedOrder ? (
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center">
                      <FaComments size={48} className="text-muted mb-3" />
                      <h5>Select an order</h5>
                      <p className="text-muted">Choose an order to start chatting with the customer</p>
                    </div>
                  ) : (
                    <div className="chat-box d-flex flex-column h-100">
                      {/* Chat header with order info */}
                      <div className="chat-box-header p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div className="avatar-container me-2">
                              <div className="default-avatar">
                                <FaUser />
                              </div>
                            </div>
                            <div>
                              <h6 className="mb-0">Order #{selectedOrder.order_id}</h6>
                              <small className="text-muted">Customer: {selectedOrder.customerName || selectedOrder.customerId || 'N/A'}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Messages display area */}
                      <div className="messages-container flex-grow-1 p-3">
                        {loadingMessages ? (
                          <div className="text-center my-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading messages...</span>
                            </div>
                          </div>
                        ) : error ? (
                          <div className="text-center my-4 text-danger">{error}</div>
                        ) : messages.length === 0 ? (
                          <div className="text-center my-4 text-muted">No messages yet.</div>
                        ) : (
                          messages.map(message => (
                            <React.Fragment key={message.message_id}>
                              {/* Text bubble if present */}
                              {message.message_text && message.message_text.trim() && (
                                <div
                                  className={`message-row ${message.sender_role === 'artisan' ? 'artisan' : 'customer'}`}
                                >
                                  <div
                                    style={{
                                      background: message.sender_role === 'artisan' ? '#3e87c3' : '#fff',
                                      color: message.sender_role === 'artisan' ? '#fff' : '#222',
                                      borderRadius: '16px',
                                      padding: '12px 18px',
                                      marginBottom: '12px',
                                      maxWidth: '70%',
                                      marginLeft: message.sender_role === 'artisan' ? 'auto' : undefined,
                                      marginRight: message.sender_role === 'artisan' ? undefined : 'auto',
                                      boxShadow: '0 2px 8px rgba(44,62,80,0.04)',
                                      border: message.sender_role === 'artisan' ? 'none' : '1px solid #ececec',
                                      textAlign: 'left',
                                    }}
                                  >
                                    <div className="flex items-center mb-1">
                                      <span className="text-xs font-medium">
                                        {message.sender_role === 'artisan' ? 'You' : 'Customer'}
                                      </span>
                                    </div>
                                    <p>{message.message_text}</p>
                                    <div className="message-meta">
                                      {formatDate(message.sent_at)}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Each attachment in its own bubble */}
                              {message.attachments && message.attachments.length > 0 && message.attachments.map(att => (
                                <div
                                  key={att.attachment_id}
                                  className={`message-row ${message.sender_role === 'artisan' ? 'artisan' : 'customer'}`}
                                >
                                  <div
                                    style={{
                                      background: message.sender_role === 'artisan' ? '#3e87c3' : '#fff',
                                      color: message.sender_role === 'artisan' ? '#fff' : '#222',
                                      borderRadius: '16px',
                                      padding: '12px 18px',
                                      marginBottom: '12px',
                                      maxWidth: '70%',
                                      marginLeft: message.sender_role === 'artisan' ? 'auto' : undefined,
                                      marginRight: message.sender_role === 'artisan' ? undefined : 'auto',
                                      boxShadow: '0 2px 8px rgba(44,62,80,0.04)',
                                      border: message.sender_role === 'artisan' ? 'none' : '1px solid #ececec',
                                      textAlign: 'left',
                                    }}
                                  >
                                    {att.file_type.startsWith('image/') ? (
                                      <img
                                        src={att.file_path}
                                        alt="attachment"
                                        style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}
                                        onClick={() => {
                                          window.open(att.file_path, '_blank');
                                        }}
                                      />
                                    ) : (
                                      <a href={att.file_path} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginRight: 8 }}>
                                        {att.file_type.startsWith('application/pdf') ? 'PDF' : 'File'}: {att.file_path.split('/').pop()}
                                      </a>
                                    )}
                                    <div className="message-meta">
                                      {formatDate(message.sent_at)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </React.Fragment>
                          ))
                        )}
                      </div>
                      
                      {/* Message input with file attachment */}
                      <div className="message-input-container p-3 border-top">
                        <form onSubmit={handleSendMessage} className="d-flex align-items-center" encType="multipart/form-data">
                          <label htmlFor="file-input" className="me-2" style={{ cursor: 'pointer' }}>
                            <FaPaperclip size={18} />
                            <input
                              id="file-input"
                              type="file"
                              multiple
                              style={{ display: 'none' }}
                              onChange={handleFileChange}
                              accept="*"
                            />
                          </label>
                          <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Type your message here..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                          />
                          <button
                            className="btn btn-primary send-message-btn"
                            type="submit"
                            disabled={(!newMessage.trim() && attachments.length === 0) || sending}
                          >
                            <FaPaperPlane />
                            <span className="d-none d-md-inline ms-2">Send</span>
                          </button>
                        </form>
                        
                        {attachments.length > 0 && (
                          <div className="mb-2">
                            {attachments.map((file, idx) => (
                              <span key={idx} className="badge bg-secondary me-1">{file.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanChat;
