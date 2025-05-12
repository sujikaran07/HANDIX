import React, { useState, useEffect } from 'react';
import ArtisanSidebar from '../../components/artisan/ArtisanSidebar';
import ArtisanTopBar from '../../components/artisan/ArtisanTopBar';
import { FaComments, FaPaperPlane, FaUser, FaSearch, FaEllipsisV, FaHeart } from 'react-icons/fa';
import '../../styles/artisan/ArtisanDashboard.css';
import '../../styles/artisan/ArtisanChat.css';

const ArtisanChat = () => {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('artisanToken');
        if (!token) {
          console.error('No token found for artisan');
          return;
        }

        // Simulate API response
        setTimeout(() => {
          // Dummy data
          const data = [
            {
              id: 1,
              name: 'Admin Support',
              avatar: null,
              lastMessage: 'Can you please check order #O325?',
              timestamp: '2023-08-01T09:30:00',
              unread: 2,
              location: 'Sheffield'
            },
            {
              id: 2,
              name: 'John Smith',
              avatar: null,
              lastMessage: 'Thank you for the update!',
              timestamp: '2023-08-01T08:15:00',
              unread: 0,
              location: 'Greater House'
            },
            {
              id: 3,
              name: 'Sarah Johnson',
              avatar: null,
              lastMessage: 'Please complete the order by Friday',
              timestamp: '2023-07-31T16:45:00',
              unread: 1,
              location: 'Jakarta'
            },
            {
              id: 4,
              name: 'Technical Support',
              avatar: null,
              lastMessage: 'Your issue has been resolved',
              timestamp: '2023-07-30T14:20:00',
              unread: 0,
              location: 'Denema Building'
            }
          ];
          
          setContacts(data);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const fetchMessages = (contactId) => {
    setIsLoading(true);
    
    // Simulate API call to fetch messages for the selected contact
    setTimeout(() => {
      // Dummy message data
      const currentDate = new Date();
      const yesterdayDate = new Date(currentDate);
      yesterdayDate.setDate(currentDate.getDate() - 1);
      
      const dummyMessages = [
        {
          id: 1,
          senderId: contactId,
          text: 'Hi! I saw your real estate dashboard tool online. Can you tell me more about its features?',
          timestamp: yesterdayDate.toISOString(),
          read: true,
          reaction: null
        },
        {
          id: 2,
          senderId: 'me',
          text: 'Hello! Sure, the real estate dashboard provides real-time data on property listings, market trends, price comparisons, and investment analysis. It\'s designed to help both agents and buyers make informed decisions.',
          timestamp: yesterdayDate.toISOString(),
          read: true,
          reaction: '🔥'
        },
        {
          id: 3,
          senderId: contactId,
          text: 'That sounds great! Does it include data on both residential and commercial properties?',
          timestamp: currentDate.toISOString(),
          read: true,
          reaction: null
        },
        {
          id: 4,
          senderId: 'me',
          text: 'Yes, it covers both residential and commercial properties. You can filter by location, property type, price range, and more.',
          timestamp: currentDate.toISOString(),
          read: true,
          reaction: null
        }
      ];
      
      setMessages(dummyMessages);
      setIsLoading(false);
    }, 800);
  };

  const handleContactSelect = (contact) => {
    setCurrentContact(contact);
    fetchMessages(contact.id);
    
    // Mark contact as read
    setContacts(contacts.map(c => 
      c.id === contact.id ? { ...c, unread: 0 } : c
    ));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentContact) return;

    // Add the new message to the current conversation
    const newMsg = {
      id: messages.length + 1,
      senderId: 'me',
      text: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
      reaction: null
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleReaction = (messageId, reaction) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, reaction: reaction } : msg
    ));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGroupedMessages = () => {
    const grouped = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.timestamp);
      const dateKey = date.toDateString() === new Date().toDateString() 
        ? 'TODAY'
        : date.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
          ? 'YESTERDAY'
          : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });
    
    return grouped;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'unread' && contact.unread > 0);
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (messages.length > 0) {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="artisan-chat-page">
      <ArtisanSidebar />
      <div className="artisan-main-content">
        <ArtisanTopBar />
        
        <div className="container mt-4 chat-container">
          <div className="card chat-card">
            <div className="chat-header d-flex justify-content-between align-items-center mb-0">
              <div className="title-section">
                <div className="icon-and-title">
                  <FaComments className="chat-icon" />
                  <div className="text-section">
                    <h2>Messages</h2>
                    <p>Chat with administrators, managers, and customers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-content">
              <div className="row h-100 g-0">
                {/* Contacts sidebar */}
                <div className="col-md-4 col-lg-3 border-end d-flex flex-column">
                  <div className="contacts-header p-3 border-bottom">
                    <div className="search-container">
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaSearch size={14} />
                        </span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Search conversations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="filter-tabs">
                      <ul className="nav nav-pills nav-fill">
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${filter === 'all' ? 'active' : ''}`} 
                            onClick={() => setFilter('all')}
                          >
                            All
                          </button>
                        </li>
                        <li className="nav-item">
                          <button 
                            className={`nav-link ${filter === 'unread' ? 'active' : ''}`} 
                            onClick={() => setFilter('unread')}
                          >
                            Unread
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="contacts-list">
                    {isLoading && contacts.length === 0 ? (
                      <div className="text-center my-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <div className="text-center my-4">
                        <p className="text-muted">No conversations found</p>
                      </div>
                    ) : (
                      filteredContacts.map(contact => (
                        <div 
                          key={contact.id} 
                          className={`contact-item p-3 border-bottom ${currentContact && currentContact.id === contact.id ? 'active' : ''}`}
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="d-flex align-items-center">
                            <div className="avatar-container me-3">
                              {contact.avatar ? (
                                <img src={contact.avatar} alt={contact.name} className="avatar" />
                              ) : (
                                <div className="default-avatar">
                                  <FaUser />
                                </div>
                              )}
                            </div>
                            <div className="contact-info flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">{contact.name}</h6>
                                <small className="text-muted">{formatTimestamp(contact.timestamp)}</small>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <p className="text-truncate mb-1 small text-muted" style={{ maxWidth: '150px' }}>
                                  {contact.lastMessage}
                                </p>
                                {contact.unread > 0 && (
                                  <span className="badge rounded-pill bg-primary">{contact.unread}</span>
                                )}
                              </div>
                              <div className="contact-location">
                                <small className="badge bg-light text-dark">{contact.location}</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Conversation area */}
                <div className="col-md-8 col-lg-9">
                  {!currentContact ? (
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center">
                      <FaComments size={48} className="text-muted mb-3" />
                      <h5>Select a conversation</h5>
                      <p className="text-muted">Choose a contact to start chatting</p>
                    </div>
                  ) : (
                    <div className="chat-box d-flex flex-column h-100">
                      <div className="chat-box-header p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div className="avatar-container me-2">
                              <div className="default-avatar">
                                <FaUser />
                              </div>
                            </div>
                            <div>
                              <h6 className="mb-0">{currentContact.name}</h6>
                              <small className="text-muted">{currentContact.location}</small>
                            </div>
                          </div>
                          <button className="btn btn-link text-muted">
                            <FaEllipsisV />
                          </button>
                        </div>
                      </div>
                      
                      <div className="messages-container flex-grow-1 p-3">
                        {isLoading ? (
                          <div className="text-center my-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading messages...</span>
                            </div>
                          </div>
                        ) : (
                          Object.entries(getGroupedMessages()).map(([date, msgs]) => (
                            <div key={date} className="message-group">
                              <div className="message-date-separator">
                                <span>{date}</span>
                              </div>
                              {msgs.map(message => (
                                <div 
                                  key={message.id} 
                                  className={`message-bubble-wrapper ${message.senderId === 'me' ? 'outgoing' : 'incoming'}`}
                                >
                                  <div className="message-bubble">
                                    <div className="message-content">
                                      {message.text}
                                    </div>
                                    <div className="message-footer">
                                      <div className="message-time">
                                        {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                      {message.senderId !== 'me' && !message.reaction && (
                                        <div className="message-reactions">
                                          <button 
                                            className="btn btn-sm reaction-btn" 
                                            onClick={() => handleReaction(message.id, '❤️')}
                                          >
                                            <FaHeart size={12} />
                                          </button>
                                        </div>
                                      )}
                                      {message.reaction && (
                                        <div className="message-reaction-display">
                                          {message.reaction}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="message-input-container p-3 border-top">
                        <form onSubmit={handleSendMessage} className="d-flex">
                          <input 
                            type="text" 
                            className="form-control me-2" 
                            placeholder="Type your message here..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                          />
                          <button 
                            className="btn btn-primary send-message-btn" 
                            type="submit"
                            disabled={!newMessage.trim()}
                          >
                            <FaPaperPlane />
                            <span className="d-none d-md-inline ms-2">Send</span>
                          </button>
                        </form>
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
