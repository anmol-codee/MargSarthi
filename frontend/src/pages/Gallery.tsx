import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const GALLERY_IMAGES = Array.from({ length: 24 }, (_, i) => `/gallery/gallery-${(i + 1).toString().padStart(2, '0')}.jpeg`);

export default function Gallery() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MargSarthi Gallery</h1>
            <p className="text-gray-500 mt-1">A glimpse into our campus, events, and student life.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {GALLERY_IMAGES.map((src, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <img 
                src={src} 
                alt={`Gallery ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
