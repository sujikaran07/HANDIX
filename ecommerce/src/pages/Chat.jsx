import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Search } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const ChatPage = () => {
  const [conversations, setConversations] = useState([
    { id: 1, name: 'Sarah Wilson', lastMessage: 'Thank you for your order!', unread: 2, active: true },
    { id: 2, name: 'Craft Haven', lastMessage: 'Your custom order is ready', unread: 0, active: false },
    { id: 3, name: 'Lakmal Textiles', lastMessage: 'We have new batik designs in stock', unread: 0, active: false },
  ]);
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'artisan', text: 'Hello! Thank you for your interest in our handwoven bags.', timestamp: new Date(Date.now() - 60000 * 30) },
    { id: 2, sender: 'user', text: 'Hi there! I was wondering if you can make a custom size for the basket bag?', timestamp: new Date(Date.now() - 60000 * 25) },
    { id: 3, sender: 'artisan', text: 'Yes, we can definitely customize the size for you. What dimensions are you looking for?', timestamp: new Date(Date.now() - 60000 * 20) },
    { id: 4, sender: 'user', text: 'I was thinking about 14" width and 12" height. Is that possible?', timestamp: new Date(Date.now() - 60000 * 15) },
    { id: 5, sender: 'artisan', text: 'Absolutely! That size works well. There will be a small customization fee of LKR 500. Is that okay?', timestamp: new Date(Date.now() - 60000 * 10) },
    { id: 6, sender: 'artisan', text: 'Also, would you like any specific color pattern for the weave?', timestamp: new Date(Date.now() - 60000 * 5) },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectConversation = (id) => {
    setConversations(conversations.map(conv => ({
      ...conv,
      active: conv.id === id,
      unread: conv.id === id ? 0 : conv.unread
    })));
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    const message = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate response after 1 second
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        sender: 'artisan',
        text: 'Thank you for your message. I\'ll get back to you shortly!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };
  
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container-custom px-1 sm:px-2 md:px-3 w-full max-w-full md:max-w-[98%] lg:max-w-[96%] xl:max-w-[94%]">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden" style={{ height: '70vh' }}>
            <div className="grid md:grid-cols-7 h-full">
              {/* Conversation List */}
              <div className="md:col-span-2 border-r">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-bold mb-4">Messages</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                </div>
                
                <div className="overflow-y-auto" style={{ height: 'calc(70vh - 89px)' }}>
                  {filteredConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`w-full text-left p-4 border-b hover:bg-gray-50 ${
                        conv.active ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="ml-3 flex-grow">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{conv.name}</p>
                            {conv.unread > 0 && (
                              <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chat Area */}
              <div className="md:col-span-5 flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3">
                    <p className="font-medium">Sarah Wilson</p>
                    <p className="text-xs text-gray-500">Basket Weaving Artisan</p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : ''}`}
                    >
                      <div className={`max-w-[75%] ${
                        message.sender === 'user'
                          ? 'bg-primary text-white rounded-l-lg rounded-tr-lg'
                          : 'bg-gray-100 rounded-r-lg rounded-tl-lg'
                      } p-3`}>
                        <p>{message.text}</p>
                        <p className={`text-xs mt-1 text-right ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white p-2 rounded-r-md hover:bg-primary-hover"
                    >
                      <Send size={20} />
                    </button>
                  </form>
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

export default ChatPage;