#!/usr/bin/env python3
"""
Integration test script for Photo Equalizer
Tests the backend API endpoints and image processing functionality
"""

import requests
import os
import sys
from PIL import Image
import io

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend is not accessible: {e}")
        return False

def create_test_image():
    """Create a simple test image"""
    # Create a simple gradient test image
    img = Image.new('RGB', (200, 200), color='white')
    pixels = img.load()
    
    # Create a gradient
    for i in range(200):
        for j in range(200):
            pixels[i, j] = (i, j, (i + j) // 2)
    
    # Save to temporary file
    test_path = "test_image.jpg"
    img.save(test_path)
    return test_path

def test_image_processing():
    """Test image processing endpoint"""
    try:
        # Create test image
        test_image_path = create_test_image()
        
        # Prepare test data
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_image.jpg', f, 'image/jpeg')}
            data = {
                'brightness': '0.2',  # Converted from slider value
                'contrast': '1.2',
                'saturation': '1.1',
                'hue': '10',
                'exposure': '0.1',
                'auto_enhance': 'false'
            }
            
            response = requests.post(
                "http://localhost:8000/process",
                files=files,
                data=data,
                timeout=30
            )
        
        # Clean up test image
        os.remove(test_image_path)
        
        if response.status_code == 200:
            result = response.json()
            if 'processed_url' in result and 'summary' in result:
                print("✅ Image processing works")
                print(f"   Summary: {result['summary']}")
                return True
            else:
                print("❌ Invalid response format")
                return False
        else:
            print(f"❌ Image processing failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Image processing test failed: {e}")
        return False

def test_download_endpoint():
    """Test download endpoint"""
    try:
        # First process an image to get a file_id
        test_image_path = create_test_image()
        
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_image.jpg', f, 'image/jpeg')}
            data = {'brightness': '0', 'contrast': '1.0', 'saturation': '1.0', 'hue': '0', 'exposure': '0'}
            
            response = requests.post(
                "http://localhost:8000/process",
                files=files,
                data=data,
                timeout=30
            )
        
        os.remove(test_image_path)
        
        if response.status_code == 200:
            result = response.json()
            file_id = result.get('file_id')
            
            if file_id:
                # Test download
                download_response = requests.get(f"http://localhost:8000/download/{file_id}", timeout=10)
                if download_response.status_code == 200:
                    print("✅ Download endpoint works")
                    return True
                else:
                    print(f"❌ Download failed with status {download_response.status_code}")
                    return False
            else:
                print("❌ No file_id in response")
                return False
        else:
            print("❌ Could not process image for download test")
            return False
            
    except Exception as e:
        print(f"❌ Download test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Photo Equalizer Integration")
    print("=" * 50)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Image Processing", test_image_processing),
        ("Download Endpoint", test_download_endpoint)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Integration is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the backend server.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
