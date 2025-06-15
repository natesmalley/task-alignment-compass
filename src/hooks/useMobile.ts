
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    const checkMobile = () => {
      const mobile = Capacitor.isNativePlatform();
      const currentPlatform = Capacitor.getPlatform();
      
      setIsMobile(mobile);
      setPlatform(currentPlatform);
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
