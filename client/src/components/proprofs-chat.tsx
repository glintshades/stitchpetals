import { useEffect } from "react";

export default function ProProfsChat() {
  useEffect(() => {
    // Check if already loaded
    if (document.querySelector('script[src*="live2support.com"]')) {
      return;
    }

    // Add script directly to head
    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.src = 'https://s01.live2support.com/dashboardv2/chatwindow/';
    
    // Set the required global variable
    (window as any).stid = 'Q2tKdkxOcmcxZnhDaEdlUGgxSjR6Zz09';
    
    // Add to document head
    document.head.appendChild(script);
    
    // Log for debugging
    console.log('ProProfs Chat: Script loaded');
    
    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as any).stid;
    };
  }, []);

  return null;
}