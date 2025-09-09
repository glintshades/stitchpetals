import { useEffect } from "react";

export default function ProProfsChat() {
  useEffect(() => {
    // Check if script is already loaded to avoid duplicates
    if (document.querySelector('script[src*="live2support.com"]')) {
      return;
    }

    // Create and load the ProProfs chat script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      (function(){
        var pp=document.createElement('script'), 
        ppr=document.getElementsByTagName('script')[0]; 
        stid='Q2tKdkxOcmcxZnhDaEdlUGgxSjR6Zz09';
        pp.type='text/javascript'; 
        pp.async=true; 
        pp.src=('https:' == document.location.protocol ? 'https://' : 'http://') + 's01.live2support.com/dashboardv2/chatwindow/'; 
        ppr.parentNode.insertBefore(pp, ppr);
      })();
    `;
    
    document.head.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src*="live2support.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}