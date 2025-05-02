import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const MessagesPage = () => {
  // Mock conversations
  const [conversations, setConversations] = useState([
    {
      id: 'conv1',
      title: 'Order #HX-1234567',
      lastMessage: 'Your order has been shipped!',
      timestamp: '2023-04-16 09:30',
      unread: 1,
      messages: [
        {
          id: 'msg1',
          sender: 'user',
          text: 'Hello, I have a question about my order #HX-1234567',
          timestamp: '2023-04-15 14:23',
          read: true
        },
        {
          id: 'msg2',
          sender: 'support',
          text: 'Hello! How can I help you with your order?',
          timestamp: '2023-04-15 14:30',
          read: true
        },
        {
          id: 'msg3',
          sender: 'user',
          text: 'I was wondering when it might be shipped?',
          timestamp: '2023-04-15 14:35',
          read: true
        },
        {
          id: 'msg4',
          sender: 'support',
          text: 'Your order has been shipped!',
          timestamp: '2023-04-16 09:30',
          read: false
        }
      ]
    },
    {
      id: 'conv2',
      title: 'Product Inquiry',
      lastMessage: 'Yes, that product comes in multiple colors.',
      timestamp: '2023-04-10 11:20',
      unread: 0,
      messages: [
        {
          id: 'msg5',
          sender: 'user',
          text: 'Do you have the handmade pottery vase in blue?',
          timestamp: '2023-04-10 11:00',
          read: true
        },
        {
          id: 'msg6',
          sender: 'support',
          text: 'Yes, that product comes in multiple colors.',
          timestamp: '2023-04-10 11:20',
          read: true
        }
      ]
    }
  ]);
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const handleConversationSelect = (conversation) => {
    // Mark unread messages as read
    const updatedConversation = {
      ...conversation,
      unread: 0,
      messages: conversation.messages.map(msg => ({ ...msg, read: true }))
    };
    
    setSelectedConversation(updatedConversation);
    
    // Update the conversations list
    setConversations(conversations.map(conv => 
      conv.id === conversation.id ? updatedConversation : conv
    ));
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: true
    };
    
    const updatedConversation = {
      ...selectedConversation,
      lastMessage: newMessage.trim(),
      timestamp: new Date().toISOString(),
      messages: [...selectedConversation.messages, newMsg]
    };
    
    setSelectedConversation(updatedConversation);
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    ));
    setNewMessage('');
    
    // Mock response (in a real app, this would come from a server)
    setTimeout(() => {
      const responseMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'support',
        text: "Thank you for your message. Our support team will get back to you shortly.",
        timestamp: new Date().toISOString(),
        read: false
      };
      
      const updatedWithResponse = {
        ...updatedConversation,
        lastMessage: responseMsg.text,
        timestamp: responseMsg.timestamp,
        messages: [...updatedConversation.messages, responseMsg]
      };
      
      setSelectedConversation(updatedWithResponse);
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation.id ? updatedWithResponse : conv
      ));
    }, 1000);
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
          <h1 className="text-3xl font-bold mb-8">Messages</h1>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="grid md:grid-cols-3 h-[600px]">
              {/* Conversations List */}
              <div className="md:col-span-1 border-r overflow-y-auto">
                <div className="p-4 border-b">
                  <h2 className="font-semibold">Conversations</h2>
                </div>
                <div>
                  {conversations.map(conversation => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{conversation.title}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <div className="mt-1 flex justify-end">
                          <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                            {conversation.unread} new
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Message Content */}
              <div className="md:col-span-2 flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="p-4 border-b">
                      <h2 className="font-semibold">{selectedConversation.title}</h2>
                    </div>
                    
                    <div className="flex-grow p-4 overflow-y-auto">
                      {selectedConversation.messages.map(message => (
                        <div
                          key={message.id}
                          className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              {message.sender === 'support' && (
                                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                  <MessageSquare size={12} className="text-primary" />
                                </div>
                              )}
                              <span className="text-xs font-medium">
                                {message.sender === 'user' ? 'You' : 'Support Team'}
                              </span>
                            </div>
                            <p>{message.text}</p>
                            <div className="text-right">
                              <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="bg-primary text-white p-2 rounded-r-md"
                          disabled={!newMessage.trim()}
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
                      <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                      <p className="text-gray-500 mb-4">
                        Select a conversation to view your messages.
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