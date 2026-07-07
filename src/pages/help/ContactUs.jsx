import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Mail, Phone, MessageSquare, Clock, Loader2, Building, MapPin } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus('error: all fields required');
      return;
    }
    setLoading(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'support@voxvpn.net',
        subject: `Contact Form: ${formData.subject}`,
        body: `From: ${formData.name} (${formData.email})\n\nMessage:\n${formData.message}`,
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus('error: failed to send');
      setTimeout(() => setStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Contact <span className="text-cyan-400">Us</span></h1>
          <p className="text-slate-400 text-lg">We're here to help. Reach out through any of the channels below.</p>
        </div>

        {/* Business identity card */}
        <div className="rounded-2xl border border-cyan-500/20 p-6 mb-8" style={{ background: 'rgba(0,212,255,0.05)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Building size={16} className="text-cyan-400" />
            <h2 className="text-white font-bold text-sm">Company Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 text-slate-400">
              <Building size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <div><span className="text-slate-500 text-xs">Legal Name:</span> <span className="text-white font-medium">VoxDigits Communications LLC</span></div>
            </div>
            <div className="flex items-start gap-2 text-slate-400">
              <MapPin size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
              <div><span className="text-slate-500 text-xs">Registered Address:</span> <span className="text-white font-medium">VoxDigits Communications LLC, 1040 Main St, Camden, ME 04843, USA</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Mail, title: 'Support Email', desc: 'support@voxvpn.net', sub: 'We reply within 24 hours' },
            { icon: Mail, title: 'Sales Email', desc: 'sales@voxvpn.net', sub: 'For business & enterprise inquiries' },
            { icon: Mail, title: 'Billing Email', desc: 'billing@voxvpn.net', sub: 'For billing & refund questions' },
            { icon: Phone, title: 'Phone', desc: '+1 207-287-1513', sub: 'Business hours only' },
            { icon: MessageSquare, title: 'Live Chat', desc: 'Available in the app', sub: 'Monday–Friday, 9am–6pm UTC' },
            { icon: Clock, title: 'Business Hours', desc: 'Mon–Fri, 9am–6pm UTC', sub: 'Email support available 24/7' },
          ].map(({ icon: Icon, title, desc, sub }) => (
            <div key={title} className="p-6 rounded-xl border border-white/5 bg-[#0d1120] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{title}</h3>
                <p className="text-cyan-400 text-sm font-medium">{desc}</p>
                <p className="text-slate-500 text-xs mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Support channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <a href="/help-center" className="p-4 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all text-center">
            <MessageSquare size={20} className="text-cyan-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">Knowledge Base</h3>
            <p className="text-slate-500 text-xs">Browse guides & FAQs</p>
          </a>
          <a href="mailto:support@voxvpn.net" className="p-4 rounded-xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all text-center">
            <Mail size={20} className="text-cyan-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">Ticket System</h3>
            <p className="text-slate-500 text-xs">Email support@voxvpn.net</p>
          </a>
          <div className="p-4 rounded-xl border border-white/5 bg-[#0d1120] text-center">
            <MessageSquare size={20} className="text-cyan-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">Live Chat</h3>
            <p className="text-slate-500 text-xs">Mon–Fri, 9am–6pm UTC</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8">
          <h2 className="text-white font-bold text-lg mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                placeholder="Your name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50" 
              />
              <input 
                placeholder="Your email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50" 
              />
            </div>
            <input 
              placeholder="Subject" 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50" 
            />
            <textarea 
              placeholder="Your message..." 
              rows={5} 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 resize-none" 
            />
            {status && (
              <p className={`text-sm font-semibold ${status.includes('success') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {status.includes('success') ? '✓ Message sent successfully!' : status}
              </p>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold rounded-full transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}