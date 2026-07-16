import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, Gavel, AlertTriangle, Database, Eye } from "lucide-react";

const REQUEST_TYPES = [
  { icon: Gavel, title: "Government Requests", desc: "Formal requests from government or law enforcement agencies for user data.", count: "0", note: "No data disclosed" },
  { icon: FileText, title: "DMCA Requests", desc: "Copyright takedown requests under the Digital Millennium Copyright Act.", count: "0", note: "No content removed" },
  { icon: AlertTriangle, title: "Abuse Reports", desc: "Reports of fraudulent, spam, or abusive activity on our platform.", count: "3", note: "Accounts reviewed and actioned per AUP" },
];

const DISCLOSURE_POLICY = [
  "VoxDigits does not sell, rent, or trade user data to any third party.",
  "We only disclose user data when legally compelled by a valid court order, subpoena, or binding government request.",
  "We challenge overly broad or improper requests and notify affected users when legally permitted.",
  "We publish all government data requests in this transparency report, updated quarterly.",
  "We have never installed backdoors or provided encryption keys to any government agency.",
  "We do not participate in mass surveillance programs, PRISM, or any equivalent data collection initiative.",
];

const REPORTS = [
  { period: "Q1 2026 (Jan – Mar)", gov: 0, dmca: 0, abuse: 1, disclosure: "No data disclosed" },
  { period: "Q4 2025 (Oct – Dec)", gov: 0, dmca: 0, abuse: 2, disclosure: "No data disclosed" },
  { period: "Q3 2025 (Jul – Sep)", gov: 0, dmca: 0, abuse: 0, disclosure: "No data disclosed" },
];

export default function TransparencyReport() {
  return (
    <div className="min-h-screen bg-[#060f1a] text-white">
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-6">
            <Eye className="w-3.5 h-3.5" /> Transparency Report
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Our Commitment to <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Transparency</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We believe in radical transparency. This report details every government request, DMCA takedown, and abuse report we receive.
          </p>
          <p className="text-gray-500 text-sm mt-4">Last Updated: July 2026</p>
        </div>
      </section>

      {/* Request Summary */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Request Summary (All Time)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {REQUEST_TYPES.map(({ icon: Icon, title, desc, count, note }) => (
              <div key={title} className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-cyan-400">{count}</span>
                  <span className="text-xs text-gray-500">{note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Disclosure Policy */}
      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold">Data Disclosure Policy</h2>
          </div>
          <ul className="space-y-4">
            {DISCLOSURE_POLICY.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-400 leading-relaxed">
                <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quarterly Breakdown */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Quarterly Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/[0.05] text-gray-300">
                  <th className="px-4 py-3 text-left font-medium">Period</th>
                  <th className="px-4 py-3 text-center font-medium">Gov Requests</th>
                  <th className="px-4 py-3 text-center font-medium">DMCA</th>
                  <th className="px-4 py-3 text-center font-medium">Abuse</th>
                  <th className="px-4 py-3 text-left font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {REPORTS.map((r, i) => (
                  <tr key={i} className="border-t border-white/10 text-gray-400">
                    <td className="px-4 py-3">{r.period}</td>
                    <td className="px-4 py-3 text-center text-cyan-400 font-semibold">{r.gov}</td>
                    <td className="px-4 py-3 text-center text-cyan-400 font-semibold">{r.dmca}</td>
                    <td className="px-4 py-3 text-center text-cyan-400 font-semibold">{r.abuse}</td>
                    <td className="px-4 py-3 text-xs">{r.disclosure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Warrant Canary */}
      <section className="py-16 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Warrant Canary</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            As of <span className="text-white font-semibold">July 7, 2026</span>, VoxDigits has:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-400">
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> Never received a National Security Letter or FISA court order</li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> Never placed any backdoors in our encryption or infrastructure</li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> Never been compelled to silently log user data</li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> Never participated in any mass surveillance program</li>
          </ul>
        </div>
      </section>
    </div>
  );
}