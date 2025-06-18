import React, { useState, useEffect } from 'react';

const ResizeAlert = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;

    const handleResize = () => {
      setShow(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShow(false), 3000);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-28 left-4 bg-neutral-800 text-red-500 px-4 py-2 rounded shadow-lg z-50">
      Window resized!
    </div>
  );
};

export default ResizeAlert;