import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FAQChatbot from './FAQChatbot';

const Layout = ({ children, user, title }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Listen to sidebar collapse state from localStorage or custom event
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarState = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(sidebarState === 'true');
    };

    checkSidebarState();
    window.addEventListener('sidebarToggle', checkSidebarState);
    
    return () => {
      window.removeEventListener('sidebarToggle', checkSidebarState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
      <Sidebar onToggle={setIsCollapsed} />
      
      {/* Main Content Area - Adjusts margin based on sidebar state */}
      <div 
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        } min-h-screen flex flex-col`}
      >
        <Navbar user={user} title={title} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* FAQ Chatbot */}
      <FAQChatbot />
    </div>
  );
};

export default Layout;
