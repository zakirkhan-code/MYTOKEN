// pages/Home.jsx - Beautiful Landing Page
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, TrendingUp, Zap, Users, ChevronRight,
  Star, Unlock, Eye, Gauge, Lock, Globe, Rocket, CheckCircle
} from 'lucide-react';
import authService from '../services/authService';

export default function Home() {
  const isLoggedIn = authService.isAuthenticated();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* ===================================================================== */
      {/* HERO SECTION */
      {/* ===================================================================== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 blur-3xl -top-20 -left-20 animate-blob"></div>
          <div className="absolute w-96 h-96 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 blur-3xl top-1/2 -right-20 animate-blob animation-delay-2000"></div>
          <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-full opacity-20 blur-3xl -bottom-20 left-1/3 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Badge */}
          <div className="inline-block mb-8 px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-full text-blue-300 text-sm font-semibold backdrop-blur-xl">
            <span className="flex items-center space-x-2">
              <Rocket size={14} />
              <span>🎉 Launch Your Wealth Today</span>
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent animate-fade-in">
            Stake Your Crypto,
            <br /> Earn Massive Rewards
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of investors earning up to <span className="text-blue-400 font-semibold">10% APY</span> by staking with us. Secure, fast, and transparent.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>Start Staking</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-lg border-2 border-blue-500 text-blue-400 font-bold text-lg hover:bg-blue-500/10 transition-all duration-300"
                >
                  Already Have Account?
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-xl">
              <p className="text-3xl font-bold text-blue-400">$2.5M+</p>
              <p className="text-slate-400 text-sm mt-1">Total Staked</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-xl">
              <p className="text-3xl font-bold text-purple-400">5,234</p>
              <p className="text-slate-400 text-sm mt-1">Active Users</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-xl">
              <p className="text-3xl font-bold text-cyan-400">10%</p>
              <p className="text-slate-400 text-sm mt-1">APY Reward</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */
      {/* FEATURES SECTION */
      {/* ===================================================================== */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose MyToken?</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to start earning passive income from your cryptocurrency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="group p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Bank-Level Security</h3>
            <p className="text-slate-400">Military-grade encryption and multi-signature wallets protect your assets</p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">High Returns</h3>
            <p className="text-slate-400">Earn up to 10% APY with flexible staking periods</p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-slate-400">Instant deposits, withdrawals, and reward payouts</p>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Community Driven</h3>
            <p className="text-slate-400">Join 5000+ satisfied stakers earning daily</p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */
      {/* HOW IT WORKS SECTION */
      {/* ===================================================================== */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg">Get started in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-2xl font-bold mt-6 mb-4">Create Account</h3>
              <p className="text-slate-400 mb-4">Sign up with your email in less than 2 minutes</p>
              <div className="flex items-center text-blue-400">
                <CheckCircle size={18} className="mr-2" />
                <span className="text-sm">Email verification required</span>
              </div>
            </div>
            {/* Arrow */}
            <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2">
              <ChevronRight size={32} className="text-slate-600" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-2xl font-bold mt-6 mb-4">Connect Wallet</h3>
              <p className="text-slate-400 mb-4">Link your crypto wallet securely</p>
              <div className="flex items-center text-purple-400">
                <CheckCircle size={18} className="mr-2" />
                <span className="text-sm">Instant connection</span>
              </div>
            </div>
            {/* Arrow */}
            <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2">
              <ChevronRight size={32} className="text-slate-600" />
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-2xl font-bold mt-6 mb-4">Start Staking</h3>
              <p className="text-slate-400 mb-4">Stake tokens and start earning rewards</p>
              <div className="flex items-center text-cyan-400">
                <CheckCircle size={18} className="mr-2" />
                <span className="text-sm">Earn daily rewards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */
      {/* STATS SECTION */
      {/* ===================================================================== */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-5xl font-bold text-blue-400 mb-2">$2.5M+</p>
            <p className="text-slate-400">Total Value Locked</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-purple-400 mb-2">5,234</p>
            <p className="text-slate-400">Active Users</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-cyan-400 mb-2">$500K+</p>
            <p className="text-slate-400">Rewards Distributed</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-pink-400 mb-2">10%</p>
            <p className="text-slate-400">Average APY</p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */
      {/* CTA SECTION */
      {/* ===================================================================== */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of users already earning passive income with MyToken
          </p>
          {!isLoggedIn && (
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 group"
            >
              <span>Create Free Account</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </section>

      {/* ===================================================================== */
      {/* FOOTER */
      {/* ===================================================================== */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Social</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Discord</a></li>
                <li><a href="#" className="hover:text-white transition">Telegram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 MyToken. All rights reserved. | Powered by blockchain technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}