# Product Image Resizer

A simple web application for quickly processing product images for e-commerce websites. This tool automatically crops, resizes, and centers your product images with proper margins - perfect for maintaining a consistent look across your online store.

## Features

- **Drag and drop** image uploading
- **Paste support** (Ctrl+V) for quick workflow
- **Automatic white background detection** and cropping to content
- **Automatic centering** of product in the frame
- **Consistent margins** (180px) around the product
- **Standard output size** (1000x1000px) ideal for e-commerce platforms
- **Instant download** of processed images
- **Live preview** of the processed image

## How to Use

1. Open `index.html` in your web browser
2. Add your image using one of three methods:
   - Drag and drop an image file onto the drop zone
   - Click "BROWSE FILES" to select an image
   - Copy an image to your clipboard and press Ctrl+V
3. The image will be automatically processed:
   - White background will be detected and cropped
   - Image will be resized to fit within a 640x640px area
   - A 180px margin will be added on all sides
   - Final 1000x1000px image will be created
4. The processed image will automatically download
5. A preview will be displayed on screen

## Technical Details

- Pure HTML, CSS, and JavaScript (no frameworks or dependencies)
- Material Design-inspired UI with animations and effects
- Canvas-based image processing
- Preserves original filenames with .jpg extension

## Use Cases

- Product photography for e-commerce websites
- Creating consistent product images for online marketplaces
- Quick image processing without the need for complex photo editing software

## Browser Compatibility

Works in all modern browsers that support HTML5 Canvas API and File API.
