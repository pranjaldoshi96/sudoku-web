import React, { useEffect } from 'react';
import '../styles/AdComponent.css';

function AdComponent({ format = 'auto', slot, style = {} }) {
  useEffect(() => {
    // Initialize ads when component mounts
    if (window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  return (
    <div className="ad-container" style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-4382992337001515"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

export default AdComponent; 