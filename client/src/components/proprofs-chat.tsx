import { useEffect } from 'react';

declare global {
  interface Window {
    stid: string;
  }
}

export default function ProProfsChat() {
  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById('proprofs-chat-script')) {
      return;
    }

    try {
      // Set the global stid variable first
      window.stid = 'Q2tKdkxOcmgxZnhDaEdlUGgxSjR6Zz09';
      
      // Create and inject the ProProfs script exactly as provided
      const script = document.createElement('script');
      script.id = 'proprofs-chat-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src = (window.location.protocol === 'https:' ? 'https://' : 'http://') + 
                   's01.live2support.com/dashboardv2/chatwindow/';
      
      // Add error handling
      script.onerror = () => {
        console.warn('ProProfs chat script failed to load');
      };
      
      script.onload = () => {
        console.log('ProProfs chat loaded successfully');
      };
      
      // Append to head for better compatibility
      document.head.appendChild(script);
      
    } catch (error) {
      console.warn('Error loading ProProfs chat:', error);
    }

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('proprofs-chat-script');
      if (existingScript) {
        existingScript.remove();
      }
      if (window.stid) {
        delete window.stid;
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}