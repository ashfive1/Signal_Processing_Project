import React, { useEffect, useState } from "react";
import { supabase } from "../components/lib/supabaseClient";
import Link from "next/link";
import Navbar from "../components/navbar";

export default function Presets() {
  const [presets, setPresets] = useState<any[]>([]);
  const [newName, setNewName] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresets = async () => {
      const { data, error } = await supabase.from("presets").select("*");
      if (error) console.error(error);
      else setPresets(data || []);
    };
    fetchPresets();
  }, []);

  const handleRename = async (id: string) => {
    if (!newName) return;
    const { error } = await supabase
      .from("presets")
      .update({ name: newName })
      .eq("id", id);

    if (error) console.error(error);
    else {
      alert("Preset renamed");
      setPresets(presets.map((p) => (p.id === id ? { ...p, name: newName } : p)));
      setNewName("");
      setSelectedPreset(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this preset?")) return;
    
    const { error } = await supabase
      .from("presets")
      .delete()
      .eq("id", id);

    if (error) console.error(error);
    else {
      setPresets(presets.filter((p) => p.id !== id));
    }
  };

  const handleApplyPreset = (preset: any) => {
    // Store preset settings in localStorage for dashboard to use
    const presetData = {
      ...preset.settings,
      accessibility_filter: preset.accessibility_filter,
      auto_enhance: preset.auto_enhance
    };
    localStorage.setItem('selectedPreset', JSON.stringify(presetData));
    alert(`Preset "${preset.name}" applied! Go to dashboard to use it.`);
    
    // Update usage count
    updatePresetUsage(preset.id);
  };

  const updatePresetUsage = async (presetId: string) => {
    try {
      // Get current usage count and increment it
      const { data: preset } = await supabase
        .from("presets")
        .select("usage_count")
        .eq("id", presetId)
        .single();
      
      if (preset) {
        const { error } = await supabase
          .from("presets")
          .update({ usage_count: (preset.usage_count || 0) + 1 })
          .eq("id", presetId);
        
        if (error) console.error("Error updating usage count:", error);
      }
    } catch (error) {
      console.error("Unexpected error updating usage:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Presets</h1>
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Dashboard
          </button>
        </Link>
      </div>
      
      {presets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No presets saved yet.</p>
          <p className="text-sm">Create your first preset in the dashboard!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {presets.map((preset) => (
            <div key={preset.id} className="border p-4 rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{preset.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <p>Settings:</p>
                <div className="ml-2 space-y-1">
                  {preset.settings.brightness !== undefined && (
                    <p>• Brightness: {preset.settings.brightness}</p>
                  )}
                  {preset.settings.contrast !== undefined && (
                    <p>• Contrast: {preset.settings.contrast}</p>
                  )}
                  {preset.settings.saturation !== undefined && (
                    <p>• Saturation: {preset.settings.saturation}</p>
                  )}
                  {preset.settings.hue !== undefined && (
                    <p>• Hue: {preset.settings.hue}</p>
                  )}
                  {preset.settings.exposure !== undefined && (
                    <p>• Exposure: {preset.settings.exposure}</p>
                  )}
                  {preset.accessibility_filter && (
                    <p>• Accessibility: {preset.accessibility_filter.replace('_', ' ')}</p>
                  )}
                  {preset.auto_enhance && (
                    <p>• Auto-Enhance: Enabled</p>
                  )}
                </div>
                {preset.category && (
                  <p className="text-xs text-blue-600 mt-2">Category: {preset.category}</p>
                )}
                {preset.usage_count > 0 && (
                  <p className="text-xs text-gray-500">Used {preset.usage_count} times</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New name"
                  value={selectedPreset === preset.id ? newName : ""}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border p-2 rounded flex-1"
                />
                <button
                  onClick={() => {
                    setSelectedPreset(preset.id);
                    handleRename(preset.id);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Rename
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