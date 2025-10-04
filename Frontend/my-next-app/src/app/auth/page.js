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
            router.push('/dashboard/approvals');
          } else {
            router.push('/dashboard/expenses');
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
      className="min-h-screen bg-zinc-900 relative overflow-hidden"
      onClick={handleOutsideClick}
    >
      {/* Background decorative circles */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2">
        <div className="w-96 h-96 rounded-full border-[60px] border-zinc-800"></div>
      </div>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2">
        <div className="w-96 h-96 rounded-full border-[60px] border-zinc-800"></div>
      </div>

      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center text-[20rem] font-bold text-zinc-800 select-none">
        {isLogin ? 'LOG IN' : 'CREATE'}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-white hover:text-zinc-300"
          >
            ExMan.
          </button>
          <nav className="flex items-center gap-6 text-sm text-zinc-400">
            <button className="hover:text-white">Dashboard</button>
            <button className="hover:text-white">Expenses</button>
            <button className="hover:text-white">Reports</button>
            <button className="hover:text-white">Settings</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsLogin(true)}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Log in
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          ref={modalRef}
          className={`bg-white rounded-lg shadow-2xl flex overflow-hidden max-w-5xl w-full max-h-[90vh] transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Left Side */}
          <div className="w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center relative overflow-y-auto">
            <button 
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => router.push('/'), 300);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-normal text-gray-800 mb-16">Welcome!</h2>
            
            <div className="flex items-center gap-4 mb-16">
              <div className="text-7xl font-bold text-black">ExMan</div>
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-200 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-blue-600 flex items-center justify-center">
                    <div className="text-4xl">💰</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {isLogin ? (
                <>Not a member yet? <button onClick={() => setIsLogin(false)} className="text-black font-medium underline hover:no-underline">Register now</button></>
              ) : (
                <>Are you a member? <button onClick={() => setIsLogin(true)} className="text-black font-medium underline hover:no-underline">Log in now</button></>
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
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Email</label>
                  <input 
                    type="email" 
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full px-0 py-2 border-b border-gray-300 focus:border-gray-800 outline-none text-sm placeholder-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="w-full px-0 py-2 pr-8 border-b border-gray-300 focus:border-gray-800 outline-none text-sm placeholder-gray-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
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
                    className="w-4 h-4 border-gray-300 rounded"
                  />
                  <label htmlFor="keepLogged" className="ml-2 text-sm text-gray-600">Keep me logged in</label>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Log in now'}
                </button>

                <div className="text-center">
                  <button type="button" className="text-xs text-gray-600 hover:text-black underline">
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
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Company Name (*)</label>
                  <input 
                    type="text" 
                    placeholder="Company Name"
                    value={signupData.companyName}
                    onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                    className="w-full px-0 py-2 border-b border-gray-300 focus:border-gray-800 outline-none text-sm placeholder-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Full Name (*)</label>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                    className="w-full px-0 py-2 border-b border-gray-300 focus:border-gray-800 outline-none text-sm placeholder-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Email (*)</label>
                  <input 
                    type="email" 
                    placeholder="E-mail"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    className="w-full px-0 py-2 border-b border-gray-300 focus:border-gray-800 outline-none text-sm placeholder-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Country (*)</label>
                  <select
                    value={signupData.country}
                    onChange={(e) => setSignupData({...signupData, country: e.target.value})}
                    className="w-full px-0 py-2 border-b border-gray-300 focus:border-gray-800 outline-none text-sm"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Password (*)</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        className="w-full px-0 py-2 pr-8 border-b border-gray-300 focus:border-gray-800 outline-none text-sm placeholder-gray-300"
                        required
                        minLength={8}
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                        title="Password must contain at least one uppercase letter, one lowercase letter, and one number"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
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
                    <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Repeat Password (*)</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat Password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        className="w-full px-0 py-2 pr-8 border-b border-gray-300 focus:border-gray-800 outline-none text-sm placeholder-gray-300"
                        required
                        minLength={8}
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                        title="Password must contain at least one uppercase letter, one lowercase letter, and one number"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
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
                
                <div className="text-xs text-gray-500">
                  Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number.
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">I have read and accept the Terms and Conditions</label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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