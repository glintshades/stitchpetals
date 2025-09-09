export default function ProProfsChat() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <script>
            (function(){
              var pp=document.createElement('script'), ppr=document.getElementsByTagName('script')[0]; 
              stid='Q2tKdkxOcmcxZnhDaEdlUGgxSjR6Zz09';
              pp.type='text/javascript'; 
              pp.async=true; 
              pp.src=('https:' == document.location.protocol ? 'https://' : 'http://') + 's01.live2support.com/dashboardv2/chatwindow/'; 
              ppr.parentNode.insertBefore(pp, ppr);
            })();
          </script>
        `
      }}
    />
  );
}