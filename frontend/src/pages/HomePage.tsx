import React from 'react';
import { Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-medium text-sm mb-8">
        <Cpu className="w-4 h-4" /> Next-Gen Tech Marketplace
      </div>
      <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight mb-6">
        Welcome to <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">TechNest</span>
      </h1>
      <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
        Discover cutting-edge gadgets, hardware, and premium electronics designed for power users.
      </p>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-xl shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:-translate-y-0.5"
      >
        Explore Catalog <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default HomePage;
