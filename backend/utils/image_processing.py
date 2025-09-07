import cv2
import numpy as np
from typing import Dict, List, Tuple
import json


def calculate_perceptual_metrics(img: np.ndarray) -> Dict[str, float]:
    """
    Calculate perceptual quality metrics (Wang et al., 2023)
    - Sharpness: Laplacian variance
    - Brightness balance: Histogram analysis
    - Contrast: Standard deviation of pixel values
    """
    # Convert to grayscale for some metrics
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Sharpness (Laplacian variance)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # Brightness balance (histogram analysis)
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    brightness_balance = np.std(hist) / np.mean(hist)
    
    # Contrast (standard deviation)
    contrast = np.std(gray)
    
    # Color saturation (HSV)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    saturation_mean = np.mean(hsv[:, :, 1])
    
    return {
        "sharpness": float(laplacian_var),
        "brightness_balance": float(brightness_balance),
        "contrast": float(contrast),
        "saturation": float(saturation_mean)
    }


def generate_explainable_summary(original_metrics: Dict[str, float], 
                                processed_metrics: Dict[str, float],
                                adjustments: Dict[str, float]) -> str:
    """
    Generate natural language explanation of enhancements (Zhou et al., 2022)
    """
    explanations = []
    
    # Analyze improvements
    sharpness_change = processed_metrics["sharpness"] - original_metrics["sharpness"]
    contrast_change = processed_metrics["contrast"] - original_metrics["contrast"]
    saturation_change = processed_metrics["saturation"] - original_metrics["saturation"]
    
    if abs(sharpness_change) > 50:
        if sharpness_change > 0:
            explanations.append("Enhanced image sharpness for clearer details")
        else:
            explanations.append("Softened image sharpness for smoother appearance")
    
    if abs(contrast_change) > 10:
        if contrast_change > 0:
            explanations.append("Increased contrast to make features more distinct")
        else:
            explanations.append("Reduced contrast for a more balanced look")
    
    if abs(saturation_change) > 20:
        if saturation_change > 0:
            explanations.append("Boosted color saturation for more vibrant colors")
        else:
            explanations.append("Desaturated colors for a more muted, elegant tone")
    
    # Add manual adjustments
    if adjustments.get("brightness", 0) != 0:
        brightness_val = adjustments["brightness"]
        if brightness_val > 0:
            explanations.append(f"Brightened the image by {brightness_val:.1f} levels")
        else:
            explanations.append(f"Darkened the image by {abs(brightness_val):.1f} levels")
    
    if adjustments.get("hue", 0) != 0:
        hue_val = adjustments["hue"]
        explanations.append(f"Shifted color hue by {hue_val:.0f} degrees")
    
    if adjustments.get("exposure", 0) != 0:
        exposure_val = adjustments["exposure"]
        if exposure_val > 0:
            explanations.append(f"Increased exposure by {exposure_val:.1f} stops")
        else:
            explanations.append(f"Decreased exposure by {abs(exposure_val):.1f} stops")
    
    if not explanations:
        explanations.append("Applied subtle enhancements to improve overall image quality")
    
    return " • ".join(explanations)


def apply_accessibility_filters(img: np.ndarray, filter_type: str) -> np.ndarray:
    """
    Apply accessibility filters (Topic 9, 2021 work on accessibility enhancement)
    """
    if filter_type == "high_contrast":
        # Increase contrast significantly
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        lab = cv2.merge([l, a, b])
        return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    
    elif filter_type == "colorblind_protanopia":
        # Simulate protanopia (red-blind)
        # Convert to LMS color space approximation
        img_float = img.astype(np.float32) / 255.0
        # Simple approximation for protanopia
        img_float[:, :, 2] = img_float[:, :, 1] * 0.5  # Reduce red channel
        return (img_float * 255).astype(np.uint8)
    
    elif filter_type == "colorblind_deuteranopia":
        # Simulate deuteranopia (green-blind)
        img_float = img.astype(np.float32) / 255.0
        img_float[:, :, 1] = img_float[:, :, 2] * 0.5  # Reduce green channel
        return (img_float * 255).astype(np.uint8)
    
    elif filter_type == "colorblind_tritanopia":
        # Simulate tritanopia (blue-blind)
        img_float = img.astype(np.float32) / 255.0
        img_float[:, :, 0] = img_float[:, :, 1] * 0.5  # Reduce blue channel
        return (img_float * 255).astype(np.uint8)
    
    return img


def process_image(input_path: str, output_path: str, 
                 brightness: float = 0, contrast: float = 1.0, 
                 saturation: float = 1.0, hue: float = 0, 
                 exposure: float = 0, accessibility_filter: str = None,
                 auto_enhance: bool = False) -> str:
    """
    Enhanced image processing with explainable AI and perceptual quality metrics
    """
    img = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if img is None:
        return "Error: Could not load image"
    
    # Calculate original perceptual metrics
    original_metrics = calculate_perceptual_metrics(img)
    
    # Convert to float32 for processing
    img_float = img.astype(np.float32) / 255.0
    
    # Auto-enhancement based on perceptual metrics (Wang et al., 2023)
    if auto_enhance:
        # Auto-adjust brightness if image is too dark/bright
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_brightness = np.mean(gray)
        if mean_brightness < 80:  # Too dark
            brightness += 0.2
        elif mean_brightness > 180:  # Too bright
            brightness -= 0.2
        
        # Auto-adjust contrast if image lacks contrast
        if original_metrics["contrast"] < 30:
            contrast = max(contrast, 1.2)
        
        # Auto-adjust saturation if colors are muted
        if original_metrics["saturation"] < 100:
            saturation = max(saturation, 1.1)
    
    # Apply brightness adjustment
    if brightness != 0:
        img_float = np.clip(img_float + brightness, 0, 1)
    
    # Apply contrast adjustment
    if contrast != 1.0:
        img_float = np.clip(img_float * contrast, 0, 1)
    
    # Apply exposure adjustment
    if exposure != 0:
        img_float = np.clip(img_float * (2 ** exposure), 0, 1)
    
    # Apply gamma correction for better tone mapping
    if contrast != 1.0:
        gamma = 1.0 / contrast if contrast > 0 else 1.0
        img_float = np.power(img_float, gamma)
    
    # Convert back to uint8
    img_processed = (img_float * 255).astype(np.uint8)
    
    # Apply saturation and hue adjustments
    if saturation != 1.0 or hue != 0:
        # Convert to HSV for saturation and hue adjustments
        hsv = cv2.cvtColor(img_processed, cv2.COLOR_BGR2HSV).astype(np.float32)
        
        # Adjust saturation
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * saturation, 0, 255)
        
        # Adjust hue
        if hue != 0:
            hsv[:, :, 0] = (hsv[:, :, 0] + hue) % 180
        
        # Convert back to BGR
        img_processed = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    
    # Apply accessibility filters if specified
    if accessibility_filter:
        img_processed = apply_accessibility_filters(img_processed, accessibility_filter)
    
    # Calculate processed perceptual metrics
    processed_metrics = calculate_perceptual_metrics(img_processed)
    
    # Save the processed image
    cv2.imwrite(output_path, img_processed)
    
    # Generate explainable summary (Zhou et al., 2022)
    adjustments = {
        "brightness": brightness,
        "contrast": contrast,
        "saturation": saturation,
        "hue": hue,
        "exposure": exposure
    }
    
    summary = generate_explainable_summary(original_metrics, processed_metrics, adjustments)
    
    # Add accessibility filter info if applied
    if accessibility_filter:
        filter_names = {
            "high_contrast": "High Contrast",
            "colorblind_protanopia": "Protanopia Simulation",
            "colorblind_deuteranopia": "Deuteranopia Simulation", 
            "colorblind_tritanopia": "Tritanopia Simulation"
        }
        summary += f" • Applied {filter_names.get(accessibility_filter, accessibility_filter)} accessibility filter"
    
    return summary