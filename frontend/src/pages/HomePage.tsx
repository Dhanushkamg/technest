import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Shield,
  Truck,
  Headphones,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  Star,
  Copy,
  Check,
  Send,
  Laptop,
  Smartphone,
  Tv,
  Cpu,
  Watch,
  Flame,
  Tag,
  Gamepad2,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { ProductCard } from '../components/product/ProductCard';
import { Button } from '../components/ui/Button';
import { RatingStars } from '../components/common/RatingStars';
import { SEO } from '../components/common/SEO';
import type { Category } from '../types';

interface HeroSlide {
  id: number;
  tag: string;
  title: string;
  highlight: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  badge: string;
  image: string;
  accentGradient: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: 'Flagship Electronics 2026',
    title: 'Upgrade Your',
    highlight: 'Digital Life',
    description:
      'Discover cutting-edge laptops, high-performance smartphones, audio gear, and precision tech workstations engineered for power users.',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    badge: 'Pro Tier Gear',
    image:
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-brand-500 to-indigo-600',
  },
  {
    id: 2,
    tag: 'Studio Grade Fidelity',
    title: 'Immersive Acoustics &',
    highlight: 'Lossless Audio',
    description:
      'Precision-tuned drivers with active spatial noise cancellation. Experience studio masters exactly as sound engineers intended.',
    ctaText: 'Discover Audio',
    ctaLink: '/products?search=Audio',
    badge: 'Hi-Res Audio',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 3,
    tag: 'Visual Precision',
    title: 'Curved OLED Displays &',
    highlight: 'Pro Workstations',
    description:
      'Quantum-dot OLED panels with ultra-low latency response times. Transform your creative workflow and gaming battlestation.',
    ctaText: 'Shop Monitors',
    ctaLink: '/products?search=Monitor',
    badge: 'OLED Perfection',
    image:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    accentGradient: 'from-cyan-500 to-blue-600',
  },
];

const TRUST_BENEFITS = [
  {
    icon: Truck,
    title: 'Express Dispatch',
    desc: 'Rapid order processing and insured direct nationwide shipping.',
  },
  {
    icon: Shield,
    title: 'Manufacturer Warranty',
    desc: '100% authentic electronics with official manufacturer warranty.',
  },
  {
    icon: Zap,
    title: 'Secure Payments',
    desc: 'Bank-grade 256-bit encryption with PayHere and card checkout.',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    desc: 'Responsive hardware support to assist your shopping experience.',
  },
];

const BRANDS = [
  { name: 'Apple', logo: 'Apple', query: 'Apple' },
  { name: 'Samsung', logo: 'Samsung', query: 'Samsung' },
  { name: 'Sony', logo: 'Sony', query: 'Sony' },
  { name: 'Dell', logo: 'Dell', query: 'Dell' },
  { name: 'ASUS', logo: 'ASUS', query: 'ASUS' },
  { name: 'Lenovo', logo: 'Lenovo', query: 'Lenovo' },
  { name: 'Logitech', logo: 'Logitech', query: 'Logitech' },
  { name: 'Razer', logo: 'Razer', query: 'Razer' },
];

const TESTIMONIALS = [
  {
    name: 'Alex Rivera',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'TechNest delivers top-tier workstation hardware. Fast shipping, pristine packaging, and the hardware catalog is top notch.',
  },
  {
    name: 'Sarah Chen',
    role: 'UI Designer & Producer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'Upgraded my studio monitors and audio setup. The genuine factory warranty and live order tracking gave me complete peace of mind.',
  },
  {
    name: 'Marcus Vance',
    role: 'Cybersecurity Analyst',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment:
      'Seamless checkout experience with PayHere and instant coupon verification. TechNest is my go-to electronics marketplace.',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Tabs state for catalog showcase
  const [activeTab, setActiveTab] = useState<'featured' | 'rated' | 'new'>('featured');

  // Flash deals countdown timer (static daily cycle)
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 35, seconds: 40 });

  // Coupon copied status
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch categories from real API
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch real featured products for showcase
  const { data: pagedProducts } = useQuery({
    queryKey: ['home-showcase-products', activeTab],
    queryFn: () => {
      if (activeTab === 'new') {
        return productApi.getProducts({ size: 8, sortBy: 'id', sortDir: 'desc' });
      }
      if (activeTab === 'rated') {
        return productApi.getProducts({ size: 8, sortBy: 'averageRating', sortDir: 'desc' });
      }
      return productApi.getProducts({ size: 8, sortBy: 'price', sortDir: 'desc' });
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch flash deal products (accessible budget deals)
  const { data: flashDealsData } = useQuery({
    queryKey: ['home-flash-deals'],
    queryFn: () => productApi.getProducts({ size: 4, sortBy: 'price', sortDir: 'asc' }),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch new arrivals separately
  const { data: newArrivalsData } = useQuery({
    queryKey: ['home-new-arrivals'],
    queryFn: () => productApi.getProducts({ size: 4, sortBy: 'id', sortDir: 'desc' }),
    staleTime: 1000 * 60 * 5,
  });

  const showcaseProducts = pagedProducts?.content || [];
  const flashProducts = flashDealsData?.content || [];
  const newArrivals = newArrivalsData?.content || [];

  // Autoplay hero carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Flash deals timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 11, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setNewsletterEmail('');
      toast.success('Thank you for subscribing to TechNest Insider updates!');
    }, 800);
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('laptop')) return Laptop;
    if (lower.includes('phone') || lower.includes('mobile')) return Smartphone;
    if (lower.includes('audio') || lower.includes('headphone')) return Headphones;
    if (lower.includes('monitor') || lower.includes('display')) return Tv;
    if (lower.includes('watch')) return Watch;
    if (lower.includes('gaming') || lower.includes('accessory')) return Gamepad2;
    return Cpu;
  };

  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 pb-16 overflow-hidden">
      <SEO
        title="TechNest — Next-Gen Electronics & Tech Marketplace"
        description="Discover cutting-edge laptops, smartphones, PC components, audio gear, and accessories at TechNest."
        canonicalUrl={window.location.origin}
      />

      {/* 1. HERO CAROUSEL */}
      <section
        aria-label="Featured Electronics Showcase"
        className="relative pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl min-h-[520px] sm:min-h-[580px] flex items-center">
          <AnimatePresence mode="wait">
            {HERO_SLIDES.map((slide, idx) => {
              if (idx !== currentSlide) return null;
              return (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.45 }}
                  className="relative w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-16 z-10"
                >
                  {/* Text Column */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-brand-400 font-semibold text-xs tracking-wider uppercase backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      {slide.tag}
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                      {slide.title}{' '}
                      <span className={`bg-gradient-to-r ${slide.accentGradient} bg-clip-text text-transparent`}>
                        {slide.highlight}
                      </span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                      {slide.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate(slide.ctaLink)}
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                        className="shadow-xl cursor-pointer"
                      >
                        {slide.ctaText}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/products')}
                        className="text-white border-slate-700 hover:border-brand-400 cursor-pointer"
                      >
                        Explore Products
                      </Button>
                    </div>
                  </div>

                  {/* Image Column */}
                  <div className="lg:col-span-5 relative flex items-center justify-center">
                    <div className="relative w-full max-w-md h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl group">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                        loading="eager"
                      />
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold text-xs">
                        {slide.badge}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Carousel Arrows */}
          <button
            type="button"
            aria-label="Previous Slide"
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md transition-colors shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next Slide"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md transition-colors shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-brand-400' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRUST / SERVICE BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:border-brand-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                <Tag className="w-3.5 h-3.5" /> Department Explorer
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Shop by Popular Category
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              View Full Department Index <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                  className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-400 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 border border-slate-200 dark:border-slate-700/80 group-hover:border-brand-300 dark:group-hover:border-brand-500/30 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2.5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Explore</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. FLASH DEALS */}
      {flashProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-rose-400 animate-pulse" /> Limited Time Flash Deals
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Hot Hardware Specials
                </h2>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Ends In:
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center min-w-[48px]">
                    <span className="text-base font-black text-white font-mono block">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase">Hours</span>
                  </div>
                  <span className="text-slate-600 font-bold">:</span>
                  <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center min-w-[48px]">
                    <span className="text-base font-black text-white font-mono block">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase">Mins</span>
                  </div>
                  <span className="text-slate-600 font-bold">:</span>
                  <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center min-w-[48px]">
                    <span className="text-base font-black text-rose-400 font-mono block">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURED PRODUCTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Curated Flagships
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Products
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Featured
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rated')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rated'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Top Rated
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {showcaseProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No products available in this section.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {showcaseProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/products')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="cursor-pointer"
          >
            Explore Complete Inventory ({showcaseProducts.length}+ Items)
          </Button>
        </div>
      </section>

      {/* 6. PROMOTIONAL BANNERS (GAMING & ACCESSORIES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Banner A: Gaming */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 p-8 sm:p-10 border border-purple-800/40 shadow-xl flex flex-col justify-between min-h-[280px]">
            <div className="space-y-3 z-10 max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs uppercase tracking-wider border border-purple-500/30">
                <Gamepad2 className="w-3.5 h-3.5" /> High Performance Rigs
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Level Up Your Gaming Experience
              </h3>
              <p className="text-xs sm:text-sm text-purple-200/80">
                Ultra-fast refresh displays, mechanical keyboards, and surround audio for competitive dominance.
              </p>
            </div>
            <div className="pt-6 z-10">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/products?search=Gaming')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                Shop Gaming Gear
              </Button>
            </div>
          </div>

          {/* Banner B: Accessories */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-900 via-slate-950 to-blue-950 p-8 sm:p-10 border border-cyan-800/40 shadow-xl flex flex-col justify-between min-h-[280px]">
            <div className="space-y-3 z-10 max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs uppercase tracking-wider border border-cyan-500/30">
                <Package className="w-3.5 h-3.5" /> Essential Add-ons
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Small Accessories, Big Difference
              </h3>
              <p className="text-xs sm:text-sm text-cyan-200/80">
                Power banks, multi-port USB-C hubs, ergonomic mice, and precision tech cables for your desk.
              </p>
            </div>
            <div className="pt-6 z-10">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/products?search=Accessories')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-600/30 cursor-pointer"
              >
                Explore Accessories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Latest Releases
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              See All New Gear <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 8. BRANDS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Authorized Brand Partners</p>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">World-Class Hardware Manufacturers</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {BRANDS.map((brand) => (
            <button
              key={brand.name}
              onClick={() => navigate(`/products?search=${brand.query}`)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-brand-500 dark:hover:border-brand-400 text-center font-bold text-xs text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-all shadow-sm cursor-pointer"
            >
              {brand.logo}
            </button>
          ))}
        </div>
      </section>

      {/* 9. REAL ACTIVE PROMOTION / COUPON BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-700 p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Limited Time Storewide Offer
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Get 10% Off All Hardware Orders
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Equip your workstation with monitors, laptops, and precision accessories using active coupon code <strong className="text-amber-300">NEWYEAR</strong> at checkout.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-lg">
            <span className="font-mono font-black text-xl tracking-wider text-amber-300 px-3">
              NEWYEAR
            </span>
            <button
              type="button"
              onClick={() => handleCopyCoupon('NEWYEAR')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-blue-50 font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              {copiedCoupon ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedCoupon ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>
      </section>

      {/* 10. CUSTOMER REVIEWS & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Real Feedback
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Trusted by Builders & Engineers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <RatingStars rating={t.rating} reviewCount={1} showCount={false} />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-brand-500/30"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. NEWSLETTER SUBSCRIPTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-lg space-y-6 max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Send className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Subscribe to TechNest Insider
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Be the first to receive hardware drops, flash discount codes, and exclusive engineering gear guides.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 outline-none"
            />
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubscribing}
              className="px-6 py-3 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Join Club
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
