'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    if (!loading && isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user?.role === 'manager') {
        router.push('/dashboard/approvals');
      } else if (user?.role === 'employee') {
        router.push('/dashboard/expenses');
      }
    }
  }, [user, isAuthenticated, loading, router]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Enhanced Background with Stunning Visual Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50"></div>
      
      {/* Large Background Circles - Left Side */}
      <div 
        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
        style={{
          transform: `translate(-50%, -50%) rotate(${scrollY * 0.1}deg)`,
        }}
      >
        {/* Outer Circle */}
        <div className="w-[600px] h-[600px] rounded-full border-[80px] border-gray-200/60 animate-pulse"></div>
        {/* Middle Circle */}
        <div className="absolute top-16 left-16 w-[440px] h-[440px] rounded-full border-[60px] border-blue-200/40 animate-ping"></div>
        {/* Inner Circle */}
        <div className="absolute top-32 left-32 w-[280px] h-[280px] rounded-full border-[40px] border-blue-300/30 animate-pulse"></div>
        {/* Small Inner Circle */}
        <div className="absolute top-48 left-48 w-[120px] h-[120px] rounded-full border-[20px] border-blue-400/20 animate-bounce"></div>
      </div>

      {/* Large Background Circles - Right Side */}
      <div 
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 transition-all duration-1000"
        style={{
          transform: `translate(50%, -50%) rotate(${-scrollY * 0.1}deg)`,
        }}
      >
        {/* Outer Circle */}
        <div className="w-[600px] h-[600px] rounded-full border-[80px] border-gray-200/60 animate-pulse"></div>
        {/* Middle Circle */}
        <div className="absolute top-16 left-16 w-[440px] h-[440px] rounded-full border-[60px] border-purple-200/40 animate-ping"></div>
        {/* Inner Circle */}
        <div className="absolute top-32 left-32 w-[280px] h-[280px] rounded-full border-[40px] border-purple-300/30 animate-pulse"></div>
        {/* Small Inner Circle */}
        <div className="absolute top-48 left-48 w-[120px] h-[120px] rounded-full border-[20px] border-purple-400/20 animate-bounce"></div>
      </div>

      {/* Additional Decorative Circles */}
      <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full border-[20px] border-blue-100/50 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-40 h-40 rounded-full border-[25px] border-purple-100/50 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full border-[15px] border-green-100/40 animate-ping"></div>

      {/* Floating Particles with Enhanced Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 6}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Enhanced Background Text with Stunning Animation */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-[25rem] font-bold text-gray-200/30 select-none transition-all duration-1000"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          opacity: 0.2 + (scrollY * 0.0001),
        }}
      >
        <span className="animate-pulse bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          EXPENSE
        </span>
      </div>

      {/* Multiple Gradient Overlays for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/40"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/10 to-transparent"></div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-blue-300/30 rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-12 h-12 border-2 border-purple-300/30 rotate-12 animate-spin" style={{ animationDuration: '15s' }}></div>
      <div className="absolute top-1/2 left-1/6 w-8 h-8 border-2 border-green-300/30 rotate-45 animate-spin" style={{ animationDuration: '25s' }}></div>

      {/* Additional Background Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-blue-200/20 to-purple-200/20 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-gradient-to-r from-purple-200/20 to-pink-200/20 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-green-200/20 to-blue-200/20 animate-pulse"></div>

      {/* Wave-like Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-50/30 to-transparent"></div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Lines */}
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"></div>
      <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>

      {/* Enhanced Header with Sticky Effect */}
      <header 
        className={`relative z-50 flex items-center justify-between px-8 py-6 transition-all duration-300 ${
          scrollY > 50 ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-lg' : ''
        }`}
      >
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
            Exe$Manen
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <button 
              onClick={() => scrollToSection(heroRef)}
              className="hover:text-gray-900 transition-all duration-300 hover:scale-105"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection(featuresRef)}
              className="hover:text-gray-900 transition-all duration-300 hover:scale-105"
            >
              Features
            </button>
            <button className="hover:text-gray-900 transition-all duration-300 hover:scale-105">
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection(pricingRef)}
              className="hover:text-gray-900 transition-all duration-300 hover:scale-105"
            >
              Pricing
            </button>
            <button className="hover:text-gray-900 transition-all duration-300 hover:scale-105">
              About Us
            </button>
            <button className="hover:text-gray-900 transition-all duration-300 hover:scale-105">
              Contact
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="/auth" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
          >
            Login
          </a>
          <a 
            href="/auth" 
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started
          </a>
        </div>
      </header>

      {/* Enhanced Hero Section with Animations */}
      <main 
        ref={heroRef}
        className="relative z-10 px-8 py-24"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div 
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
              <span className="block">Simplify Expense</span>
              <span className="block">Reimbursements.</span>
              <span className="block text-blue-600 animate-pulse">Automate Approvals.</span>
            </h1>
            <p className="mt-6 text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Save time, reduce errors, and manage multi-level approvals effortlessly. 
              Streamline your company's expense tracking with our comprehensive expense management system.
            </p>
          </div>
          
          <div 
            className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <a 
              href="/auth" 
              className="group bg-blue-600 text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden"
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </a>
            <button className="group bg-white text-gray-900 text-lg font-semibold px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden border-2 border-gray-200">
              <span className="relative z-10">Watch Demo</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Floating Action Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              style={{
                transform: `translateY(${scrollY * 0.05}px)`,
              }}
            >
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Processing</h3>
              <p className="text-gray-600 text-sm">Process expenses 70% faster</p>
            </div>
            <div 
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              style={{
                transform: `translateY(${scrollY * 0.08}px)`,
              }}
            >
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Safe</h3>
              <p className="text-gray-600 text-sm">Enterprise-grade security</p>
            </div>
            <div 
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              style={{
                transform: `translateY(${scrollY * 0.06}px)`,
              }}
            >
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Support</h3>
              <p className="text-gray-600 text-sm">Multi-currency support</p>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Core Features Section */}
      <section 
        ref={featuresRef}
        className="relative z-10 px-8 py-20"
        style={{
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className={`transition-all duration-1000 ${
              scrollY > 200 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
              Core Features
            </h2>
            <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Powerful features designed to streamline your expense management workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "👥",
                title: "Authentication & User Management",
                description: "Auto-create company & admin, manage roles with secure authentication system.",
                delay: 0
              },
              {
                icon: "📝",
                title: "Expense Submission",
                description: "Submit, track, and categorize expenses with detailed descriptions and receipts.",
                delay: 200
              },
              {
                icon: "✅",
                title: "Approval Workflow",
                description: "Multi-level manager approvals with transparent tracking and notifications.",
                delay: 400
              },
              {
                icon: "⚙️",
                title: "Conditional Rules",
                description: "Set percentage or specific approver rules for automated decision making.",
                delay: 600
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-200 hover:bg-white transition-all duration-500 hover:scale-105 hover:shadow-xl group shadow-lg`}
                style={{
                  animationDelay: `${feature.delay}ms`,
                  transform: `translateY(${scrollY * (0.02 + index * 0.01)}px)`,
                }}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="relative z-10 px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div 
            className={`transition-all duration-1000 ${
              scrollY > 400 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Simple 4-step process to streamline your expense management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Employee Submits",
                description: "Enter amount, category, description and upload receipts for expense claims.",
                icon: "📝"
              },
              {
                step: "2", 
                title: "Manager Reviews",
                description: "Managers approve/reject with comments visible, amounts in company currency.",
                icon: "👨‍💼"
              },
              {
                step: "3",
                title: "Next Approver", 
                description: "Finance, Director, or CFO approval as per conditional rules and hierarchy.",
                icon: "🏢"
              },
              {
                step: "4",
                title: "Processed",
                description: "Approved → Paid; Rejected → Feedback with detailed reasoning.",
                icon: "✅"
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="text-center group"
                style={{
                  animationDelay: `${index * 200}ms`,
                  transform: `translateY(${scrollY * (0.01 + index * 0.005)}px)`,
                }}
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    {step.step}
                  </div>
                  <div className="absolute -top-2 -right-2 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {step.icon}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-transparent"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Dashboard Previews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Admin Dashboard</h3>
              <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                <div className="text-gray-600 text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm">Analytics & Reports</p>
                  <p className="text-sm">User Management</p>
                  <p className="text-sm">System Settings</p>
                </div>
              </div>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Manager Dashboard</h3>
              <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                <div className="text-gray-600 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm">Pending Approvals</p>
                  <p className="text-sm">Team Expenses</p>
                  <p className="text-sm">Approval History</p>
                </div>
              </div>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Employee Dashboard</h3>
              <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                <div className="text-gray-600 text-center">
                  <div className="text-4xl mb-2">💼</div>
                  <p className="text-sm">Submit Expenses</p>
                  <p className="text-sm">Track Status</p>
                  <p className="text-sm">View History</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Why Choose Exe$Manen?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Save Time with Automated Approvals</h3>
              <p className="text-gray-600 text-sm">Reduce manual processing time by 70% with intelligent automation rules.</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reduce Errors & Mismanagement</h3>
              <p className="text-gray-600 text-sm">Eliminate human errors with automated validation and approval workflows.</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Level Flexible Approval Rules</h3>
              <p className="text-gray-600 text-sm">Customize approval chains based on amount, department, or specific conditions.</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparent Tracking & Reports</h3>
              <p className="text-gray-600 text-sm">Real-time visibility into expense status with comprehensive reporting.</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Role-Based Access Control</h3>
              <p className="text-gray-600 text-sm">Secure permissions ensuring users only access what they need.</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Currency Support</h3>
              <p className="text-gray-600 text-sm">Handle global expenses with automatic currency detection and conversion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-6 italic">"Exe$Manen reduced our expense processing time by 70%! The automated approvals are a game-changer."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">JS</div>
                <div>
                  <p className="text-gray-900 font-semibold">John Smith</p>
                  <p className="text-gray-600 text-sm">CFO, ABC Corp</p>
                </div>
              </div>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-6 italic">"The multi-level approval system perfectly matches our organizational structure. Highly recommended!"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">MJ</div>
                <div>
                  <p className="text-gray-900 font-semibold">Maria Johnson</p>
                  <p className="text-gray-600 text-sm">Finance Director, XYZ Ltd</p>
                </div>
              </div>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-6 italic">"Finally, a system that understands our complex approval requirements. Implementation was seamless."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">DK</div>
                <div>
                  <p className="text-gray-900 font-semibold">David Kumar</p>
                  <p className="text-gray-600 text-sm">Operations Manager, TechCorp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section 
        ref={pricingRef}
        className="relative z-10 px-8 py-20 bg-gray-50"
        style={{
          transform: `translateY(${scrollY * 0.03}px)`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className={`transition-all duration-1000 ${
              scrollY > 800 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              Flexible pricing options to fit your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Free Plan",
                price: "$0",
                period: "/month",
                features: ["1 company", "Basic approvals", "Up to 10 employees", "Email support"],
                button: "Get Started",
                popular: false,
                delay: 0
              },
              {
                name: "Pro Plan", 
                price: "$29",
                period: "/month",
                features: ["Multi-level approvals", "Advanced analytics", "Up to 100 employees", "Priority support", "Custom approval rules"],
                button: "Get Started",
                popular: true,
                delay: 200
              },
              {
                name: "Enterprise Plan",
                price: "$99", 
                period: "/month",
                features: ["Custom roles", "Conditional approval rules", "Unlimited employees", "24/7 support", "API access"],
                button: "Contact Sales",
                popular: false,
                delay: 400
              }
            ].map((plan, index) => (
              <div 
                key={index}
                className={`bg-white backdrop-blur-sm rounded-xl p-8 border transition-all duration-500 hover:scale-105 hover:shadow-xl group shadow-lg ${
                  plan.popular 
                    ? 'border-blue-500 relative ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-blue-500'
                }`}
                style={{
                  animationDelay: `${plan.delay}ms`,
                  transform: `translateY(${scrollY * (0.01 + index * 0.005)}px)`,
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold animate-pulse">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {plan.name}
                </h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-lg text-gray-600">{plan.period}</span>
                </div>
                
                <ul className="text-gray-600 space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex}
                      className="flex items-center group-hover:text-gray-900 transition-colors"
                      style={{ animationDelay: `${featureIndex * 100}ms` }}
                    >
                      <span className="text-green-500 mr-3 group-hover:scale-110 transition-transform">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}>
                  {plan.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How does multi-level approval work?</h3>
              <p className="text-gray-600">Our system allows you to set up approval chains where expenses flow through multiple approvers based on amount thresholds, departments, or custom rules you define.</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I define conditional rules?</h3>
              <p className="text-gray-600">Yes! You can set up rules like "auto-approve expenses under $100" or "require CFO approval for expenses over $5000" to automate your approval process.</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How do managers see pending approvals?</h3>
              <p className="text-gray-600">Managers receive real-time notifications and can view all pending approvals in their dashboard with detailed expense information and supporting documents.</p>
            </div>
            <div className="bg-white backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Is it secure to store expense data?</h3>
              <p className="text-gray-600">Absolutely! We use enterprise-grade encryption, secure cloud storage, and comply with financial data protection standards to keep your data safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative z-10 px-8 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div 
            className={`transition-all duration-1000 ${
              scrollY > 1000 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors cursor-pointer">
                  Exe$Manen
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Streamline your expense management with our comprehensive solution. 
                  Built for modern businesses.
                </p>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li><button onClick={() => scrollToSection(heroRef)} className="hover:text-gray-900 transition-colors hover:scale-105">Home</button></li>
                  <li><button onClick={() => scrollToSection(featuresRef)} className="hover:text-gray-900 transition-colors hover:scale-105">Features</button></li>
                  <li><button onClick={() => scrollToSection(pricingRef)} className="hover:text-gray-900 transition-colors hover:scale-105">Pricing</button></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors hover:scale-105">About</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li><a href="#" className="hover:text-gray-900 transition-colors hover:scale-105">Contact</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors hover:scale-105">Help Center</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors hover:scale-105">Documentation</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors hover:scale-105">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
              <p>© 2025 Exe$Manen. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {scrollY > 300 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Mouse Follower Effect */}
      <div 
        className="fixed pointer-events-none z-40 w-4 h-4 bg-blue-500/30 rounded-full transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
