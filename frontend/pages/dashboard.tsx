import { useState, useEffect, useRef } from "react";
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
  const [fileId, setFileId] = useState<string>("");
  
  // Image adjustment parameters (0-100 scale)
  const [brightness, setBrightness] = useState<number>(50);
  const [contrast, setContrast] = useState<number>(50);
  const [saturation, setSaturation] = useState<number>(50);
  const [hue, setHue] = useState<number>(50);
  const [exposure, setExposure] = useState<number>(50);
  const [accessibilityFilter, setAccessibilityFilter] = useState<string>("");
  const [autoEnhance, setAutoEnhance] = useState<boolean>(false);

  // Convert 0-100 slider values to actual processing values
  const convertSliderToValue = (sliderValue: number, type: 'brightness' | 'contrast' | 'saturation' | 'hue' | 'exposure') => {
    switch (type) {
      case 'brightness':
        return (sliderValue - 50) / 25; // -2 to 2 range
      case 'contrast':
        return sliderValue / 50; // 0 to 2 range
      case 'saturation':
        return sliderValue / 50; // 0 to 2 range
      case 'hue':
        return (sliderValue - 50) * 3.6; // -180 to 180 range
      case 'exposure':
        return (sliderValue - 50) / 25; // -2 to 2 range
      default:
        return sliderValue;
    }
  };

  // Load preset from localStorage on component mount
  useEffect(() => {
    const savedPreset = localStorage.getItem('selectedPreset');
    if (savedPreset) {
      try {
        const preset: ImageAdjustments = JSON.parse(savedPreset);
        // Convert from processing values back to 0-100 slider values
        if (preset.brightness !== undefined) setBrightness(Math.round((preset.brightness * 25) + 50));
        if (preset.contrast !== undefined) setContrast(Math.round(preset.contrast * 50));
        if (preset.saturation !== undefined) setSaturation(Math.round(preset.saturation * 50));
        if (preset.hue !== undefined) setHue(Math.round((preset.hue / 3.6) + 50));
        if (preset.exposure !== undefined) setExposure(Math.round((preset.exposure * 25) + 50));
        if (preset.accessibility_filter !== undefined) setAccessibilityFilter(preset.accessibility_filter);
        if (preset.auto_enhance !== undefined) setAutoEnhance(preset.auto_enhance);
        localStorage.removeItem('selectedPreset'); // Clear after applying
      } catch (error) {
        console.error('Error parsing preset:', error);
      }
    }
    // Load previously saved dashboard settings if present (and no preset override)
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings && !savedPreset) {
      try {
        const s = JSON.parse(savedSettings);
        if (typeof s.brightness === 'number') setBrightness(s.brightness);
        if (typeof s.contrast === 'number') setContrast(s.contrast);
        if (typeof s.saturation === 'number') setSaturation(s.saturation);
        if (typeof s.hue === 'number') setHue(s.hue);
        if (typeof s.exposure === 'number') setExposure(s.exposure);
        if (typeof s.accessibilityFilter === 'string') setAccessibilityFilter(s.accessibilityFilter);
        if (typeof s.autoEnhance === 'boolean') setAutoEnhance(s.autoEnhance);
      } catch (e) {
        console.error('Error parsing saved dashboard settings:', e);
      }
    }
  }, []);

  // Persist dashboard settings on change
  useEffect(() => {
    const settings = {
      brightness,
      contrast,
      saturation,
      hue,
      exposure,
      accessibilityFilter,
      autoEnhance,
    };
    try {
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    } catch (e) {
      // ignore quota or availability errors
    }
  }, [brightness, contrast, saturation, hue, exposure, accessibilityFilter, autoEnhance]);

  // Dashboard is accessible without authentication; no redirect

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
      formData.append("brightness", convertSliderToValue(brightness, 'brightness').toString());
      formData.append("contrast", convertSliderToValue(contrast, 'contrast').toString());
      formData.append("saturation", convertSliderToValue(saturation, 'saturation').toString());
      formData.append("hue", convertSliderToValue(hue, 'hue').toString());
      formData.append("exposure", convertSliderToValue(exposure, 'exposure').toString());
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
      setFileId(result.file_id);
    } catch (error) {
      console.error("Error processing image:", error);
      alert(`Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Debounced auto-processing on adjustments
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!selectedFile) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current as unknown as number);
    }
    debounceRef.current = setTimeout(() => {
      // Avoid stacking if already processing; will run on next change
      if (!isProcessing) {
        handleUploadAndProcess();
      }
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current as unknown as number);
    };
  }, [selectedFile, brightness, contrast, saturation, hue, exposure, accessibilityFilter, autoEnhance]);

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
            brightness: convertSliderToValue(brightness, 'brightness'),
            contrast: convertSliderToValue(contrast, 'contrast'),
            saturation: convertSliderToValue(saturation, 'saturation'),
            hue: convertSliderToValue(hue, 'hue'),
            exposure: convertSliderToValue(exposure, 'exposure')
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
    if (!fileId) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const downloadUrl = `${apiUrl}/download/${fileId}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `enhanced-image-${fileId}.jpg`;
    link.click();
  };

  const resetAdjustments = () => {
    setBrightness(50);
    setContrast(50);
    setSaturation(50);
    setHue(50);
    setExposure(50);
    setAccessibilityFilter("");
    setAutoEnhance(false);
    setProcessedUrl("");
    setSummary("");
    setFileId("");
    try {
      localStorage.removeItem('dashboardSettings');
    } catch {}
  };

  // Render dashboard regardless of auth state

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Photo Equalizer Dashboard</h1>
      
      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 text-center">Upload Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="mx-auto block w-full max-w-md text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-gray-100 dark:hover:file:bg-gray-700"
          />
        </div>
        
        {/* Image preview and controls */}
        {selectedFile && (
          <div className="space-y-8">
            {/* Images side-by-side, centered */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Original Image */}
              <div className="space-y-2 justify-self-center">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 text-center">Original Image</h3>
                <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                  <img 
                    src={previewUrl} 
                    alt="Original" 
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              </div>
              {/* Processed Image */}
              <div className="space-y-2 justify-self-center">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 text-center">Processed Image</h3>
                <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                  {processedUrl ? (
                    <img 
                      src={processedUrl} 
                      alt="Processed" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  ) : (
                    <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">Adjust sliders to process the image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vertical sliders below images, centered */}
            <div className="flex flex-wrap items-start justify-center gap-8">
              {/* Brightness */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brightness: {brightness}</span>
                <div className="h-48 flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">High</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="[appearance:none] h-48 w-2 bg-transparent [writing-mode:vertical-rl] [direction:rtl]"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Low</span>
                </div>
              </div>

              {/* Contrast */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contrast: {contrast}</span>
                <div className="h-48 flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">High</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="[appearance:none] h-48 w-2 bg-transparent [writing-mode:vertical-rl] [direction:rtl]"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Low</span>
                </div>
              </div>

              {/* Saturation */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saturation: {saturation}</span>
                <div className="h-48 flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">High</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="[appearance:none] h-48 w-2 bg-transparent [writing-mode:vertical-rl] [direction:rtl]"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Low</span>
                </div>
              </div>

              {/* Hue */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hue: {hue}</span>
                <div className="h-48 flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blue Shift</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={hue}
                    onChange={(e) => setHue(parseInt(e.target.value))}
                    className="[appearance:none] h-48 w-2 bg-transparent [writing-mode:vertical-rl] [direction:rtl]"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Red Shift</span>
                </div>
              </div>

              {/* Exposure */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exposure: {exposure}</span>
                <div className="h-48 flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Over</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={exposure}
                    onChange={(e) => setExposure(parseInt(e.target.value))}
                    className="[appearance:none] h-48 w-2 bg-transparent [writing-mode:vertical-rl] [direction:rtl]"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Under</span>
                </div>
              </div>
            </div>

            {/* Additional options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Accessibility Filters</label>
                <select
                  value={accessibilityFilter}
                  onChange={(e) => setAccessibilityFilter(e.target.value)}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <option value="">No Filter</option>
                  <option value="high_contrast">High Contrast</option>
                  <option value="colorblind_protanopia">Protanopia (Red-blind)</option>
                  <option value="colorblind_deuteranopia">Deuteranopia (Green-blind)</option>
                  <option value="colorblind_tritanopia">Tritanopia (Blue-blind)</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={autoEnhance}
                    onChange={(e) => setAutoEnhance(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Auto-Enhance (AI-powered)</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatically adjust brightness, contrast, and saturation based on image analysis
                </p>
              </div>
            </div>

            {/* Controls actions */}
            <div className="col-span-full flex justify-center">
              <button
                onClick={resetAdjustments}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Reset
              </button>
            </div>

            {/* Processing summary */}
            {summary && (
              <div className="col-span-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg p-4 max-w-2xl mx-auto">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 text-center">Processing Summary</h4>
                <p className="text-blue-700 dark:text-blue-200/90 text-center">{summary}</p>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Preset and Download */}
      {processedUrl && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div>
            <input
              type="text"
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="border p-2 rounded w-full bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
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