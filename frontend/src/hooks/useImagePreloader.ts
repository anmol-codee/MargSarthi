import { useEffect } from 'react';

export default function useImagePreloader() {
  useEffect(() => {
    // Delay preloading slightly so it doesn't impact initial render performance
    const timeoutId = setTimeout(() => {
      const heroImages = ['/hero-students.jpg', '/leaf-bg.jpg'];
      const galleryImages = Array.from({ length: 24 }, (_, i) => `/gallery/gallery-${(i + 1).toString().padStart(2, '0')}.jpeg`);
      
      const imagesToPreload = [...heroImages, ...galleryImages];
      
      imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }, 1000); // 1 second delay
    
    return () => clearTimeout(timeoutId);
  }, []);
}
