import { useState, useEffect } from "react";
import { supabase } from "../components/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import ImagePreview from "../components/ImagePreview";
import Navbar from "../components/navbar";

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  exposure: number;
  accessibility_filter?: string;
  auto_enhance?: boolean;
}

interface PresetData {
  name: string;
  settings: ImageAdjustments;
  accessibility_filter?: string;
  auto_enhance?: boolean;
  category?: string;
  description?: string;
}

export default function Dashboard() {
  const user = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [presetName, setPresetName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Image adjustment parameters
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(1.0);
  const [saturation, setSaturation] = useState<number>(1.0);
  const [hue, setHue] = useState<number>(0);
  const [exposure, setExposure] = useState<number>(0);
  const [accessibilityFilter, setAccessibilityFilter] = useState<string>("");
  const [autoEnhance, setAutoEnhance] = useState<boolean>(false);

  // Load preset from localStorage on component mount
  useEffect(() => {
    const savedPreset = localStorage.getItem('selectedPreset');
    if (savedPreset) {
      try {
        const preset: ImageAdjustments = JSON.parse(savedPreset);
        if (preset.brightness !== undefined) setBrightness(preset.brightness);
        if (preset.contrast !== undefined) setContrast(preset.contrast);
        if (preset.saturation !== undefined) setSaturation(preset.saturation);
        if (preset.hue !== undefined) setHue(preset.hue);
        if (preset.exposure !== undefined) setExposure(preset.exposure);
        if (preset.accessibility_filter !== undefined) setAccessibilityFilter(preset.accessibility_filter);
        if (preset.auto_enhance !== undefined) setAutoEnhance(preset.auto_enhance);
        localStorage.removeItem('selectedPreset'); // Clear after applying
      } catch (error) {
        console.error('Error parsing preset:', error);
      }
    }
  }, []);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      window.location.href = '/';
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedUrl("");
      setSummary("");
    }
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("brightness", brightness.toString());
      formData.append("contrast", contrast.toString());
      formData.append("saturation", saturation.toString());
      formData.append("hue", hue.toString());
      formData.append("exposure", exposure.toString());
      if (accessibilityFilter) formData.append("accessibility_filter", accessibilityFilter);
      formData.append("auto_enhance", autoEnhance.toString());

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.processed_url) {
        throw new Error("Invalid response from server");
      }
      
      setProcessedUrl(result.processed_url);
      setSummary(result.summary || "Image processed successfully");
    } catch (error) {
      console.error("Error processing image:", error);
      alert(`Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert("Please enter a preset name");
      return;
    }

    if (!user) {
      alert("You must be logged in to save presets");
      return;
    }

    try {
      const { error } = await supabase.from("presets").insert([
        {
          name: presetName.trim(),
          settings: { 
            brightness,
            contrast,
            saturation,
            hue,
            exposure
          },
          accessibility_filter: accessibilityFilter || null,
          auto_enhance: autoEnhance,
          user_id: user.id,
        },
      ]);

      if (error) {
        console.error("Error saving preset:", error);
        alert(`Error saving preset: ${error.message}`);
      } else {
        alert("Preset saved successfully!");
        setPresetName(""); // Clear the input
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred while saving the preset");
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = "enhanced-image.jpg";
    link.click();
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Photo Equalizer Dashboard</h1>
      
      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Upload Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        {/* Image Adjustments */}
        {selectedFile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="col-span-full text-lg font-semibold mb-2">Image Adjustments</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Brightness: {brightness}</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Contrast: {contrast}</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Saturation: {saturation}</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={saturation}
                onChange={(e) => setSaturation(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Hue: {hue}</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={hue}
                onChange={(e) => setHue(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Exposure: {exposure}</label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={exposure}
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">Accessibility Filters</label>
              <select
                value={accessibilityFilter}
                onChange={(e) => setAccessibilityFilter(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">No Filter</option>
                <option value="high_contrast">High Contrast</option>
                <option value="colorblind_protanopia">Protanopia (Red-blind)</option>
                <option value="colorblind_deuteranopia">Deuteranopia (Green-blind)</option>
                <option value="colorblind_tritanopia">Tritanopia (Blue-blind)</option>
              </select>
            </div>
            
            <div className="col-span-full">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoEnhance}
                  onChange={(e) => setAutoEnhance(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Auto-Enhance (AI-powered)</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Automatically adjust brightness, contrast, and saturation based on image analysis
              </p>
            </div>
            
            <div className="col-span-full">
              <button
                onClick={handleUploadAndProcess}
                disabled={isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Process Image"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {previewUrl && processedUrl && (
        <ImagePreview before={previewUrl} after={processedUrl} summary={summary} />
      )}

      {/* Preset and Download */}
      {processedUrl && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <input
              type="text"
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSavePreset}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Preset
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Download Image
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}