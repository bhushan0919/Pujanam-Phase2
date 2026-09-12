// Frontend/src/pages/TrackBooking.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  CheckCircle,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  UserCheck,
  Video,
  MessageCircle,
  Star,
  AlertCircle,
  Bell,
  Sparkles,
  TrendingUp,
  Award,
  Construction,
  Wrench,
  BarChart3
} from 'lucide-react';

const TrackBooking = () => {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTrackBooking = () => {
    if (!bookingId && !phoneNumber) {
      // Show demo mode instead of error
      setShowDemo(true);
      setTimeout(() => setShowDemo(false), 3000);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call - Show coming soon message
    setTimeout(() => {
      setIsSearching(false);
      setShowDemo(true);
      setTimeout(() => setShowDemo(false), 4000);
    }, 1500);
  };

  const handleNotifyMe = () => {
    alert('🔔 We will notify you when the Track Booking feature is fully launched!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      {/* Back Button */}
      <div className="fixed left-4 top-4 z-[100] sm:left-6 sm:top-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl md:px-5 md:py-3"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-700 to-orange-700 pt-20 pb-12">
        <div
  className="absolute inset-0 opacity-10"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  }}
/>
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 mb-6">
            <Construction size={18} className="text-white" />
            <span className="text-white text-sm font-medium">Coming Soon</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Track Your Booking
          </h1>
          <p className="text-orange-100 text-base md:text-lg max-w-2xl mx-auto">
            Real-time tracking for your puja bookings is almost here!
          </p>
        </div>
      </div>

      {/* Coming Soon Main Card */}
      <div className="relative -mt-6 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 shadow-xl text-center">
            {/* Animated Construction Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-75" />
              <div className="relative rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-5">
                <Wrench size={48} className="text-white animate-bounce" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              Feature Coming Soon! 🚀
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're working hard to bring you a seamless booking tracking experience. 
              Stay tuned for real-time updates on your puja status.
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Planning</span>
                <span>Development</span>
                <span>Testing</span>
                <span>Launch</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-500 mt-2">65% Complete • Estimated Launch: Coming Weeks</p>
            </div>

            {/* Demo Search Form */}
            <div className="max-w-md mx-auto mb-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-gray-700">Try a Demo</span>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="Booking ID (e.g., PUJA123)"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none"
                  />
                  <div className="relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                      <div className="border-t border-gray-200" />
                      <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-2 text-xs text-gray-400">OR</span>
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none"
                  />
                  <button
                    onClick={handleTrackBooking}
                    disabled={isSearching}
                    className="w-full rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 py-2 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-70"
                  >
                    {isSearching ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Searching...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Search size={14} />
                        Try Demo
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Mode Message */}
            {showDemo && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-md mx-auto mb-6">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Sparkles size={18} />
                    <span className="text-sm font-medium">Demo Mode Active</span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    This is a preview of how tracking will work. Full functionality coming soon!
                  </p>
                </div>
              </div>
            )}

            {/* Features Preview */}
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto mb-8">
              <div className="rounded-xl bg-gray-50 p-3 text-left">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Real-time Status</span>
                </div>
                <p className="text-xs text-gray-500">Live updates on your puja progress</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-left">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <User size={16} />
                  <span className="text-sm font-medium">Pandit Location</span>
                </div>
                <p className="text-xs text-gray-500">Track pandit arrival in real-time</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-left">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Bell size={16} />
                  <span className="text-sm font-medium">Push Notifications</span>
                </div>
                <p className="text-xs text-gray-500">Get instant alerts on status changes</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-left">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Video size={16} />
                  <span className="text-sm font-medium">Live Video Feed</span>
                </div>
                <p className="text-xs text-gray-500">Watch your puja remotely (coming soon)</p>
              </div>
            </div>

            {/* Notify Button */}
            <button
              onClick={handleNotifyMe}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 font-semibold text-white transition hover:scale-105 hover:shadow-lg"
            >
              <Bell size={18} />
              Notify Me When Live
            </button>

            <p className="text-xs text-gray-400 mt-4">
              No spam, only important updates about this feature
            </p>
          </div>
        </div>
      </div>

      {/* Live Chart Coming Soon Section */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10">
            <Sparkles size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={20} />
              <span className="text-sm font-semibold uppercase tracking-wide">Also Coming Soon</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Live Astrology Chart</h3>
            <p className="text-indigo-100 mb-4">Track real-time planetary positions and get instant astrological insights.</p>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Award size={14} />
                <span>Vedic Calculations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserCheck size={14} />
                <span>Personalized Insights</span>
              </div>
            </div>
            <button 
              onClick={() => alert('🔮 Live Astrology Chart coming soon! We\'ll notify you.')}
              className="rounded-xl bg-white/20 px-5 py-2 text-sm font-semibold transition hover:bg-white/30"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 bg-white mt-4 py-6">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm text-gray-500">
            Need help with your booking? Contact our support team at <strong className="text-amber-600">+91 9373120370</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackBooking;