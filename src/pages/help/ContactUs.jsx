import Navbar from '@/components/landing/Navbar.jsx';
import Footer from '@/components/landing/Footer.jsx';
import { Mail, Phone, MessageSquare, Clock } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="bg-[#080c18] min-h-screen">
      <Navbar />
      <div className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Contact <span className="text-cyan-400">Us</span></h1>
          <p className="text-slate-400 text-lg">We're here to help. Reach out through any of the channels below.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Mail, title: 'Email Support', desc: 'support@voxdigits.com', sub: 'We reply within 24 hours' },
            { icon: MessageSquare, title: 'Live Chat', desc: 'Available in the app', sub: 'Monday–Friday, 9am–6pm UTC' },
            { icon: Phone, title: 'Phone', desc: '+1 (555) 123-4567', sub: 'Business hours only' },
            { icon: Clock, title: 'Response Time', desc: '< 24 hours', sub: 'Average response time' },
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
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-8">
          <h2 className="text-white font-bold text-lg mb-6">Send Us a Message</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Your name" className="px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50" />
              <input placeholder="Your email" className="px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50" />
            </div>
            <input placeholder="Subject" className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50" />
            <textarea placeholder="Your message..." rows={5} className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 resize-none" />
            <button className="px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full transition-all">Send Message</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}