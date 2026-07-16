import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, Phone, Users, Search, Loader2, Upload } from "lucide-react";
import BulkContactImport from "@/components/contacts/BulkContactImport";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", phone_number: "", notes: "" });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Contact.list();
      setContacts(data || []);
    } catch (e) {
      console.error("Failed to load contacts:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone_number.trim()) {
      alert("Name and phone number are required");
      return;
    }

    try {
      if (editingId) {
        await base44.entities.Contact.update(editingId, formData);
      } else {
        await base44.entities.Contact.create(formData);
      }
      await loadContacts();
      setFormData({ name: "", phone_number: "", notes: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (e) {
      console.error("Failed to save contact:", e);
      alert("Failed to save contact");
    }
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      phone_number: contact.phone_number,
      notes: contact.notes || "",
    });
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this contact?")) {
      try {
        await base44.entities.Contact.delete(id);
        await loadContacts();
      } catch (e) {
        console.error("Failed to delete contact:", e);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", phone_number: "", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone_number.includes(search)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}>
      {showImport && (
        <BulkContactImport
          onClose={() => setShowImport(false)}
          onImported={() => { setShowImport(false); loadContacts(); }}
        />
      )}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))" }}>
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Contacts</h1>
              <p className="text-gray-400 text-sm">{contacts.length} saved {contacts.length === 1 ? "contact" : "contacts"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <Upload className="w-4 h-4 text-cyan-400" /> Import
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>
        </div>

        {/* Search */}
        {contacts.length > 0 && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="flex-1 bg-transparent text-white outline-none placeholder-gray-600 text-sm"
            />
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6 p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <h2 className="font-bold text-lg mb-4">{editingId ? "Edit Contact" : "New Contact"}</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contact name"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-cyan-500"
              />
              <input
                type="tel"
                value={formData.phone_number}
                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Phone number"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-cyan-500 font-mono"
              />
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes (optional)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-cyan-500 text-sm resize-none h-20"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff" }}
                >
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400 font-medium mb-4">No contacts yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}
            >
              <Plus className="w-4 h-4" /> Create your first contact
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No contacts match your search</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-4 p-4 rounded-2xl transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ background: "rgba(99,179,237,0.15)", color: "#93c5fd" }}>
                  {contact.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{contact.name}</p>
                  <p className="text-gray-400 text-sm font-mono">{contact.phone_number}</p>
                  {contact.notes && <p className="text-gray-500 text-xs mt-1">{contact.notes}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-white/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}