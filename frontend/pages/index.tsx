import Link from "next/link";
import Navbar from "../components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">Photo Equalizer</h1>
          <p className="text-xl text-gray-600 mb-8">
            Enhance your photos with professional-grade adjustments including brightness, 
            contrast, saturation, hue, and exposure controls.
          </p>
          <div className="space-x-4">
            <Link href="/dashboard">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Editing
              </button>
            </Link>
            <Link href="/presets">
              <button className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                View Presets
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}