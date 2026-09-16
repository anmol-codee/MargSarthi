import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, GraduationCap, CheckCircle2, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gray-50 selection:bg-primary-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                MargSarthi
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="font-semibold">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" className="shadow-lg shadow-primary-500/30">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24 lg:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div {...fadeIn}>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-6">
                Your Academic Journey, Simplified
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
                Seamless Support for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                  Every Student
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                MargSarthi is the ultimate platform to resolve academic queries, book quick counseling calls, and manage your student profile with ease.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 shadow-xl shadow-primary-500/20" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Join Now
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-14 bg-white">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ticket Resolution</h3>
              <p className="text-gray-600 leading-relaxed">
                Raise requests for ID cards, migration certificates, or fee issues. Track status in real-time.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Calls</h3>
              <p className="text-gray-600 leading-relaxed">
                Book immediate 10-15 minute slots with counselors or admins for urgent queries.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Profile</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload and manage your educational documents securely. Admins can verify them directly.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
