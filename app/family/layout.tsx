"use client";

import { useEffect, useState } from "react";

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    // Use a short delay to ensure the component is mounted before animation starts
    const timer = setTimeout(() => {
      setIsEntering(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`family-page-container ${isEntering ? 'entered' : ''}`}>
      {children}
      
      <style jsx global>{`
        .family-page-container {
          position: relative;
          width: 100%;
          min-height: 100%;
          transform: translateY(100%);
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .family-page-container.entered {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
