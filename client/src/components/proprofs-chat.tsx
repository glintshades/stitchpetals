import { useEffect } from "react";

// Extend Window interface to include stid property
declare global {
  interface Window {
    stid?: string;
  }
}

export default function ProProfsChat() {
  useEffect(() => {
    // Check if ProProfs is already loaded to avoid duplicates
    if (window.stid || document.querySelector('script[src*="live2support.com"]')) {
      return;
    }

    // Load the ProProfs chat script exactly as provided
    const loadProProfsChat = () => {
      const pp = document.createElement('script');
      const ppr = document.getElementsByTagName('script')[0]; 
      
      window.stid = 'Q2tKdkxOcmcxZnhDaEdlUGgxSjR6Zz09';
      pp.type = 'text/javascript'; 
      pp.async = true; 
      pp.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 's01.live2support.com/dashboardv2/chatwindow/'; 
      
      // Insert script with null check
      if (ppr && ppr.parentNode) {
        ppr.parentNode.insertBefore(pp, ppr);
      } else {
        document.head.appendChild(pp);
      }
    };

    // Execute the ProProfs loading function
    loadProProfsChat();

    // Cleanup function
    return () => {
      // Remove the script and global variable
      const existingScript = document.querySelector('script[src*="live2support.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      delete window.stid;
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}