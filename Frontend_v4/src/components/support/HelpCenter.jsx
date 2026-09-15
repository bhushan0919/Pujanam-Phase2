// Frontend/src/pages/HelpCenter.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  ChevronRight,
  FileText,
  CreditCard,
  Calendar,
  UserCheck,
  Shield,
  Star,
  Headphones,
  Sparkles,
  Zap,
  Award,
  Globe,
  Lock,
  ThumbsUp,
  Video,
  Download,
  Settings,
  Bell
} from 'lucide-react';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const handleGoBack = () => {
    navigate(-1);
  };

  const categories = [
    { id: 'all', name: 'All', icon: HelpCircle, color: 'from-gray-500 to-gray-600' },
    { id: 'booking', name: 'Bookings', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { id: 'payment', name: 'Payments', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
    { id: 'pandit', name: 'Pandits', icon: UserCheck, color: 'from-purple-500 to-pink-500' },
    { id: 'account', name: 'Account', icon: Settings, color: 'from-orange-500 to-red-500' },
    { id: 'astrology', name: 'Astrology', icon: Sparkles, color: 'from-indigo-500 to-purple-500' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I book a puja?',
      answer: 'To book a puja, go to Services page, select your desired puja, choose date and time, provide your details, and complete the payment. You will receive a confirmation email and SMS.',
      helpful: 124
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I reschedule my booking?',
      answer: 'Yes, you can reschedule your booking up to 24 hours before the scheduled time. Go to My Bookings in your dashboard and click "Reschedule". Additional charges may apply.',
      helpful: 89
    },
    {
      id: 3,
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and wallet payments. Cash on delivery is available for select locations.',
      helpful: 156
    },
    {
      id: 4,
      category: 'payment',
      question: 'How do I get a refund?',
      answer: 'Refunds are automatically processed within 5-7 business days to your original payment method when you cancel as per our cancellation policy. Contact support for any issues.',
      helpful: 92
    },
    {
      id: 5,
      category: 'pandit',
      question: 'How are pandits verified?',
      answer: 'All pandits on our platform undergo a thorough verification process including document verification, background check, and interview. We only onboard experienced and certified pandits.',
      helpful: 203
    },
    {
      id: 6,
      category: 'pandit',
      question: 'Can I choose a specific pandit?',
      answer: 'Yes, you can browse pandit profiles and select your preferred pandit based on their experience, ratings, and reviews. Additional charges may apply for premium pandits.',
      helpful: 78
    },
    {
      id: 7,
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'Go to Settings > Delete Account. You will need to confirm your decision and provide a reason. All your data will be permanently removed within 30 days.',
      helpful: 45
    },
    {
      id: 8,
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to your Dashboard > Profile Settings > Change Password. Enter your current password and new password to update. You will receive a confirmation email.',
      helpful: 67
    },
    {
      id: 9,
      category: 'astrology',
      question: 'How accurate is the kundali generation?',
      answer: 'Our kundali generation uses the authentic Swiss Ephemeris with Lahiri Ayanamsa, following traditional Vedic Jyotish principles. For best accuracy, please provide exact birth details.',
      helpful: 112
    },
    {
      id: 10,
      category: 'astrology',
      question: 'Is the horoscope free?',
      answer: 'Yes, daily horoscope is completely free. Premium features like detailed kundali analysis and compatibility reports are available as paid services.',
      helpful: 88
    },
    {
      id: 11,
      category: 'booking',
      question: 'What happens if the pandit doesn\'t show up?',
      answer: 'If a pandit doesn\'t arrive within 30 minutes of scheduled time, you will receive a full refund plus ₹200 compensation. Contact support immediately for assistance.',
      helpful: 67
    },
    {
      id: 12,
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Yes, all payments are processed through PCI-DSS compliant payment gateways. We never store your complete card details on our servers.',
      helpful: 145
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [expandedFaq, setExpandedFaq] = useState(null);

  const quickLinks = [
    { title: 'Cancellation Policy', icon: Shield, link: '/cancellation-policy' },
    { title: 'Terms & Conditions', icon: FileText, link: '/terms-conditions' },
    { title: 'Privacy Policy', icon: Lock, link: '/privacy-policy' },
    { title: 'Contact Support', icon: Headphones, link: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
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
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-700 to-orange-700 pt-20 pb-16">
        <div
  className="absolute inset-0 opacity-10"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  }}
/>
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 mb-6">
            <HelpCircle size={18} className="text-white" />
            <span className="text-white text-sm font-medium">Help Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">
            Find answers to common questions, guides, and support resources
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative -mt-6 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-gray-700 shadow-lg focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon size={16} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* FAQ List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                  <HelpCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No results found</h3>
                  <p className="text-gray-500">Try a different search term or browse categories</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="rounded-2xl bg-white shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-block h-2 w-2 rounded-full ${
                            faq.category === 'booking' ? 'bg-blue-500' :
                            faq.category === 'payment' ? 'bg-green-500' :
                            faq.category === 'pandit' ? 'bg-purple-500' :
                            faq.category === 'account' ? 'bg-orange-500' :
                            'bg-indigo-500'
                          }`} />
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                      </div>
                      <ChevronRight 
                        size={20} 
                        className={`text-gray-400 transition-transform ${expandedFaq === faq.id ? 'rotate-90' : ''}`}
                      />
                    </button>
                    
                    {expandedFaq === faq.id && (
                      <div className="border-t border-gray-100 px-5 pb-5 pt-2">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                          <span>👍 {faq.helpful} people found this helpful</span>
                          <button className="text-orange-600 hover:text-orange-700">Was this helpful?</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap size={18} className="text-orange-500" />
                Quick Links
              </h3>
              <div className="space-y-2">
                {quickLinks.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate(link.link)}
                      className="flex w-full items-center justify-between rounded-xl p-3 text-left transition hover:bg-gray-50 group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-orange-500" />
                        <span className="text-gray-700 group-hover:text-orange-600">{link.title}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Support */}
            <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white shadow-lg">
              <Headphones size={32} className="mb-3 opacity-90" />
              <h3 className="text-lg font-semibold mb-1">Still need help?</h3>
              <p className="text-orange-100 text-sm mb-4">Our support team is available 24/7</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>+91 9373120370</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>support@pujanam.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Available 24x7</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/contact')}
                className="mt-4 w-full rounded-xl bg-white/20 py-2.5 text-sm font-semibold transition hover:bg-white/30"
              >
                Contact Support
              </button>
            </div>

            {/* Live Chart Coming Soon */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 opacity-10">
                <Sparkles size={80} />
              </div>
              <Sparkles size={28} className="mb-3" />
              <h3 className="text-lg font-semibold mb-1">Live Astrology Chart</h3>
              <p className="text-indigo-100 text-sm mb-3">Coming Soon! Track real-time planetary positions.</p>
              <div className="flex items-center gap-2 text-xs text-indigo-200">
                <Globe size={12} />
                <span>Real-time updates</span>
                <Award size={12} />
                <span>Vedic calculations</span>
              </div>
              <button
                onClick={() => alert('🔮 Live Astrology Chart coming soon! We\'ll notify you.')}
                className="mt-4 w-full rounded-xl bg-white/20 py-2 text-sm font-semibold transition hover:bg-white/30 flex items-center justify-center gap-2"
              >
                <Bell size={14} />
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-200 bg-white mt-8 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-500">Support Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">&lt; 2hr</div>
              <div className="text-sm text-gray-500">Avg Response Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">98%</div>
              <div className="text-sm text-gray-500">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">10K+</div>
              <div className="text-sm text-gray-500">Happy Devotees</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;