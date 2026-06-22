import React, { useRef, useEffect } from 'react';

interface TemplateLoaderProps {
  folderName: string;
}

export const TemplateLoader: React.FC<TemplateLoaderProps> = ({ folderName }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Force iframe reload when folderName changes
    if (iframeRef.current) {
      iframeRef.current.src = `/${folderName}/code.html`;
    }
  }, [folderName]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    try {
      const doc = iframe.contentDocument;

      // Create a style element to force layout overrides in the template
      const styleId = 'layout-override-style';
      let styleEl = doc.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) {
        styleEl = doc.createElement('style');
        styleEl.id = styleId;
        doc.head.appendChild(styleEl);
      }

      // Forcefully hide sidebar/header and reset margins/paddings of the main content area
      styleEl.innerHTML = `
        /* Hide all types of sidebars (aside, nav, or elements with sidebar classes) */
        body > aside,
        body > nav:first-of-type,
        nav.fixed.left-0.top-0,
        [class*="sidebar"]:not(main):not(.flex-1):not(div.flex-1) { 
          display: none !important; 
          width: 0 !important;
          max-width: 0 !important;
          visibility: hidden !important;
        }

        /* Hide template header */
        header { 
          display: none !important; 
        }

        /* Reset body background to match system background (fixes RKAP dark background) */
        body {
          display: flex !important;
          flex-direction: column !important;
          min-height: 100vh !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: #f8fafc !important;
          background-image: none !important;
        }

        /* Reset main layout wrapper to full width and remove left margin/padding spaces */
        main, 
        .flex-1,
        [class*="flex-1"],
        [class*="ml-"],
        [class*="w-[calc(100%-"] {
          margin-left: 0 !important;
          padding-left: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          left: 0 !important;
          flex: 1 1 0% !important;
        }

        /* Adjust padding of content page to be beautiful */
        .p-lg, 
        [class*="p-lg"],
        .p-6 {
          padding: 1.5rem !important;
        }
      `;
    } catch (error) {
      console.error('Failed to inject style overrides into iframe:', error);
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-4rem)] flex-1 relative overflow-hidden bg-slate-50">
      <iframe
        ref={iframeRef}
        src={`/${folderName}/code.html`}
        onLoad={handleIframeLoad}
        className="w-full h-full min-h-[calc(100vh-4rem)] border-0"
        title={`Template Loader - ${folderName}`}
      />
    </div>
  );
};
