import React, { useState } from "react";
import { Users, Phone, Search } from "lucide-react";

export default function ContactSelector({ contacts, onSelectContact }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_number.includes(searchTerm)
  );

  if (contacts.length === 0) {
    return (
      <div className="bg-[#0d2137] border border-gray-700 rounded-xl p-8 text-center">
        <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No contacts yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d2137] border border-gray-700 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-700 max-h-96 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No contacts found</div>
        ) : (
          filtered.map((contact, idx) => (
            <button
              key={idx}
              onClick={() => onSelectContact(contact)}
              className="w-full p-4 hover:bg-gray-800/50 transition-colors text-left flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-semibold text-sm">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{contact.name}</p>
                <p className="text-gray-400 text-sm font-mono">{contact.phone_number}</p>
              </div>
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}