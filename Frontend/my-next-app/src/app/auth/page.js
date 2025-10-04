"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [contactEmail, setContactEmail] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  
  // Form data states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    companyName: '',
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    country: ''
  });
  
  const modalRef = useRef(null);
  const router = useRouter();
  const { login, signup, isAuthenticated } = useAuth();

  useEffect(() => {
    setIsVisible(true);
    fetchCountries();
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const data = await response.json();
      setCountries(data.map(country => ({
        name: country.name.common,
        official: country.name.official,
        currencies: country.currencies
      })));
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsVisible(false);
      setTimeout(() => {
        router.push('/');
      }, 300);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await login(loginData);
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        // Redirect based on role
        setTimeout(() => {
          if (result.user.role === 'admin') {
            router.push('/dashboard/admin');
          } else if (result.user.role === 'manager') {
            router.push('/dashboard/manager');
          } else {
            router.push('/dashboard/employee');
          }
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(signupData.password)) {
      setError('Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number');
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the Terms and Conditions');
      setLoading(false);
      return;
    }

    try {
      const result = await signup({
        companyName: signupData.companyName,
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        country: signupData.country
      });
      
      if (result.success) {
        setSuccess('Admin account created! Please check your email for verification code.');
        setTimeout(() => {
          router.push('/verify-email');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`${provider} login clicked`);
    // Add your social login logic here
  };

  return (
    <div 
      className="min-h-screen bg-white relative overflow-hidden"
      onClick={handleOutsideClick}
    >
      {/* Enhanced Background with Stunning Visual Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50"></div>
      
      {/* Large Background Circles - Left Side */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
        {/* Outer Circle */}
        <div className="w-[500px] h-[500px] rounded-full border-[70px] border-gray-200/60 animate-pulse"></div>
        {/* Middle Circle */}
        <div className="absolute top-12 left-12 w-[360px] h-[360px] rounded-full border-[50px] border-blue-200/40 animate-ping"></div>
        {/* Inner Circle */}
        <div className="absolute top-24 left-24 w-[220px] h-[220px] rounded-full border-[30px] border-blue-300/30 animate-pulse"></div>
        {/* Small Inner Circle */}
        <div className="absolute top-36 left-36 w-[80px] h-[80px] rounded-full border-[15px] border-blue-400/20 animate-bounce"></div>
      </div>

      {/* Large Background Circles - Right Side */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
        {/* Outer Circle */}
        <div className="w-[500px] h-[500px] rounded-full border-[70px] border-gray-200/60 animate-pulse"></div>
        {/* Middle Circle */}
        <div className="absolute top-12 left-12 w-[360px] h-[360px] rounded-full border-[50px] border-purple-200/40 animate-ping"></div>
        {/* Inner Circle */}
        <div className="absolute top-24 left-24 w-[220px] h-[220px] rounded-full border-[30px] border-purple-300/30 animate-pulse"></div>
        {/* Small Inner Circle */}
        <div className="absolute top-36 left-36 w-[80px] h-[80px] rounded-full border-[15px] border-purple-400/20 animate-bounce"></div>
      </div>

      {/* Additional Decorative Circles */}
      <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full border-[20px] border-blue-100/50 animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-40 h-40 rounded-full border-[25px] border-purple-100/50 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full border-[15px] border-green-100/40 animate-ping"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
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

      {/* Enhanced Background Text */}
      <div className="absolute inset-0 flex items-center justify-center text-[20rem] font-bold text-gray-200/30 select-none">
        <span className="animate-pulse bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {isLogin ? 'LOG IN' : 'CREATE'}
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

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            ExMan.
          </button>
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <button className="hover:text-gray-900 transition-colors">Dashboard</button>
            <button className="hover:text-gray-900 transition-colors">Expenses</button>
            <button className="hover:text-gray-900 transition-colors">Reports</button>
            <button className="hover:text-gray-900 transition-colors">Settings</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsLogin(true)}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          ref={modalRef}
          className={`bg-white rounded-lg shadow-2xl flex overflow-hidden max-w-5xl w-full max-h-[90vh] transition-all duration-300 border border-gray-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Left Side */}
          <div className="w-1/2 bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex flex-col items-center justify-center relative overflow-y-auto">
            <button 
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => router.push('/'), 300);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-normal text-gray-800 mb-16">Welcome!</h2>
            
            <div className="flex items-center gap-4 mb-16">
              <div className="text-7xl font-bold text-gray-900">ExMan</div>
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center shadow-lg">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-blue-600 flex items-center justify-center">
                    <div className="text-4xl">💰</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {isLogin ? (
                <>Not a member yet? <button onClick={() => setIsLogin(false)} className="text-blue-600 font-medium underline hover:no-underline transition-colors">Register now</button></>
              ) : (
                <>Are you a member? <button onClick={() => setIsLogin(true)} className="text-blue-600 font-medium underline hover:no-underline transition-colors">Log in now</button></>
              )}
            </p>
          </div>

          {/* Right Side - Login */}
          {isLogin && (
            <div className="w-1/2 p-8 overflow-y-auto">
              <h2 className="text-2xl font-normal text-gray-800 mb-8">Log in</h2>
              
              <form className="space-y-6" onSubmit={handleLogin}>
                {/* Error/Success Messages */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {success}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 placeholder-gray-900 bg-white shadow-sm transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 placeholder-gray-900 bg-white shadow-sm transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="keepLogged"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="keepLogged" className="ml-2 text-sm text-gray-700 font-medium">Keep me logged in</label>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Logging in...' : 'Log in now'}
                </button>

                <div className="text-center">
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-800 font-medium underline transition-colors">
                    Forgot your password?
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Right Side - Signup */}
          {!isLogin && (
            <div className="w-1/2 p-8 overflow-y-auto">
              <h2 className="text-2xl font-normal text-gray-800 mb-8">Create Admin Account</h2>
              
              <form className="space-y-6" onSubmit={handleSignup}>
                {/* Error/Success Messages */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {success}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Enter your company name"
                    value={signupData.companyName}
                    onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 placeholder-gray-900 bg-white shadow-sm transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 placeholder-gray-900 bg-white shadow-sm transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 placeholder-gray-900 bg-white shadow-sm transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country <span className="text-red-500">*</span></label>
                  <select
                    value={signupData.country}
                    onChange={(e) => setSignupData({...signupData, country: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 bg-white shadow-sm transition-all duration-200"
                    required
                  >
                    <option value="">Select your country</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 placeholder-gray-900 bg-white shadow-sm transition-all duration-200"
                        required
                        minLength={8}
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                        title="Password must contain at least one uppercase letter, one lowercase letter, and one number"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 placeholder-gray-900 bg-white shadow-sm transition-all duration-200"
                        required
                        minLength={8}
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                        title="Password must contain at least one uppercase letter, one lowercase letter, and one number"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <strong>Password Requirements:</strong> Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number.
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700 font-medium">I have read and accept the Terms and Conditions</label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Creating Account...' : 'Create Admin Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}