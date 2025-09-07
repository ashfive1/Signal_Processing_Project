# Photo Equalizer - Research-Based Image Enhancement

A comprehensive web application that applies explainable photo enhancement using cutting-edge research insights. Built with Next.js, FastAPI, and Supabase.

## 🚀 Key Features

### Research-Based Enhancements

**Explainable Image Enhancement (Zhou et al., 2022)**
- AI-powered photo enhancement with natural language explanations
- Perceptual quality-aware adjustments based on image analysis
- Automatic brightness, contrast, and saturation optimization

**Perceptual Quality–Aware Enhancement (Wang et al., 2023)**
- Advanced perceptual quality metrics (sharpness, brightness balance)
- Intelligent histogram analysis and contrast optimization
- Beyond traditional histogram equalization

### Accessibility Features (Topic 9, 2021)

- **High Contrast Mode**: Enhanced visibility for low vision users
- **Color-Blind Support**: 
  - Protanopia (Red-blind) simulation
  - Deuteranopia (Green-blind) simulation  
  - Tritanopia (Blue-blind) simulation

### Enhanced Preset Management (Topic 12, 2022)

- **User Preference Adaptation**: Learn from user behavior
- **Usage Tracking**: Monitor preset popularity and effectiveness
- **Category System**: Organize presets by type (portrait, landscape, accessibility)
- **Collaborative Features**: Share and rate presets
- **Smart Recommendations**: AI-powered preset suggestions

## 🏗️ Architecture

### Frontend (Next.js + Tailwind CSS)
- **Dashboard**: Upload, preview, adjust, and download images
- **Preset Management**: Save, rename, categorize, and share presets
- **Accessibility UI**: High-contrast and color-blind friendly interface
- **Real-time Preview**: Side-by-side before/after comparison

### Backend (FastAPI + OpenCV)
- **Image Processing**: Advanced computer vision algorithms
- **Perceptual Metrics**: Sharpness, contrast, brightness balance analysis
- **Explainable AI**: Natural language enhancement summaries
- **Accessibility Filters**: Color-blind simulation and high-contrast modes

### Database (Supabase)
- **User Management**: Authentication and authorization
- **Preset Storage**: Enhanced metadata and usage tracking
- **User Preferences**: Adaptive learning and personalization
- **Collaborative Features**: Ratings and sharing system

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account

**Backend Setup:**
cd backend
uvicorn main:app/reload

**Frontend Setup:**
cd frontend
npm install //during first run
npm run dev

**Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- 
## 📊 Research Implementation

### Perceptual Quality Metrics
- **Sharpness**: Laplacian variance for edge detection
- **Brightness Balance**: Histogram analysis for optimal exposure
- **Contrast**: Standard deviation for dynamic range assessment
- **Saturation**: HSV color space analysis

### Explainable AI
- **Natural Language Summaries**: Human-readable enhancement descriptions
- **Metric Comparison**: Before/after quality analysis
- **Adjustment Explanations**: Detailed reasoning for each change

### Accessibility Compliance
- **WCAG Guidelines**: Web Content Accessibility Guidelines compliance
- **Color-Blind Testing**: Comprehensive color vision deficiency support
- **High Contrast**: Enhanced visibility for visual impairments

## 🎯 Usage Flow

1. **Upload**: Select an image file from your device
2. **Adjust**: Use intuitive 0-100 sliders to modify:
   - **Brightness** (0-100): Dark to Bright
   - **Contrast** (0-100): Low to High  
   - **Saturation** (0-100): Muted to Vibrant
   - **Hue** (0-100): Red Shift to Blue Shift
   - **Exposure** (0-100): Underexposed to Overexposed
3. **Accessibility**: Apply specialized filters for colorblind users
4. **Auto-Enhance**: Enable AI-powered automatic optimization
5. **Process**: Click "Process Image" to apply adjustments
6. **Preview**: View side-by-side comparison with enhancement summary
7. **Save Preset**: Name and save your settings for future use
8. **Download**: Download the enhanced image with proper naming

## 🔬 Technical Details

### Image Processing Pipeline
1. **Analysis**: Calculate perceptual quality metrics
2. **Enhancement**: Apply research-based algorithms
3. **Accessibility**: Apply specialized filters if needed
4. **Explanation**: Generate natural language summary
5. **Storage**: Save processed image and metadata

### API Endpoints
- `POST /process`: Enhanced image processing with 0-100 slider conversion
- `GET /download/{file_id}`: Download processed images with proper naming
- `GET /{file_path}`: Serve processed images
- Supabase integration for user data and presets

## 📈 Future Enhancements

- **Machine Learning**: Deep learning-based enhancement
- **Batch Processing**: Multiple image enhancement
- **Cloud Storage**: Direct cloud integration
- **Mobile App**: React Native mobile version
- **API Integration**: Third-party service connections

## 🤝 Contributing

This project implements cutting-edge research in computer vision and accessibility. Contributions are welcome for:
- New enhancement algorithms
- Additional accessibility features
- Performance optimizations
- UI/UX improvements

## 📚 References

- Zhou et al., 2022: "Explainable Image Enhancement"
- Wang et al., 2023: "Perceptual Quality–Aware Enhancement"
- Topic 9, 2021: "Accessibility Enhancement Research"
- Topic 12, 2022: "User Preference Adaptation"

---

**Built with ❤️ for accessible, explainable image enhancement**
