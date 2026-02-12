import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface PayinCompProps {
  src: string;
}

const PayinComp: React.FC<PayinCompProps> = ({ src }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState('600px');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'stoplightHeight' && typeof event.data.height === 'number') {
        setIframeHeight(`${event.data.height}px`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full flex justify-center items-center py-6 px-2 not-prose">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <iframe
          ref={iframeRef}
          src={src} 
          title="API Reference"
          loading="lazy"
          style={{
            width: '100%',
            height: iframeHeight,
            border: 'none',
            overflow: 'hidden',
            borderRadius: '12px',
          }}
        />
      </motion.div>
    </div>
  );
};

export default PayinComp;
