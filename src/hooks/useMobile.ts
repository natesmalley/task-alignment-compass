
import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    const checkMobile = async () => {
      try {
        // Dynamic import to handle cases where Capacitor might not be available
        const { Capacitor } = await import('@capacitor/core');
        const mobile = Capacitor.isNativePlatform();
        const currentPlatform = Capacitor.getPlatform();
        
        setIsMobile(mobile);
        setPlatform(currentPlatform);
      } catch (error) {
        // Fallback to web detection if Capacitor is not available
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(isMobileDevice);
        setPlatform('web');
      }
    };

    checkMobile();
  }, []);

  return {
    isMobile,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
};
