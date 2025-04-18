# Product Image Resizer

A simple web application for quickly processing product images for e-commerce websites. This tool automatically crops, resizes, and centers your product images with configurable margins and size - perfect for maintaining a consistent look across your online store.

## Features

- **Drag and drop** image uploading
- **Paste support** (Ctrl+V) for quick workflow
- **Automatic white/transparent background detection** and cropping to content
- **Automatic centering** of product in the frame
- **Configurable Settings (via Modal):**
  - **Final Size:** Slider to set square output dimensions (512px to 2048px).
  - **Margin:** Slider to set margin as a percentage (0% to 50%) of the final size.
  - **Background Color:** Color picker for the final image background.
  - Settings are **saved locally** in your browser.
- **Material Design 3** inspired UI with interactive sliders and buttons.
- **Instant download** of processed images (JPG format).
- **Live preview** of the processed image.

## How to Use

1.  Open the the [Web App](https://product-image-processor.vercel.app/) (or your locally hosted version).
    - To run locally: Clone the repository, navigate to the directory in your terminal, and start a simple web server (like `python -m http.server` or use VS Code's Live Server extension). Then open the provided URL (e.g., `http://localhost:8000`).
2.  **(Optional) Adjust Settings:** Click the gear icon (`settings`) in the top right to open the settings modal. Adjust the final size, margin percentage, and background color using the sliders and color picker. Your preferences will be saved for future use.
3.  **Add your image** using one of three methods:
    - Drag and drop an image file (ideally with a white or transparent background) onto the drop zone.
    - Click "BROWSE FILES" to select an image.
    - Copy an image to your clipboard and press Ctrl+V (or Cmd+V on Mac).
4.  **Wait for Processing:** The application will:
    - Crop the image to its content.
    - Resize and center the content within the specified final dimensions, applying the chosen margin percentage.
    - Fill the background with the selected color.
5.  **Automatic Download:** The processed image (e.g., `your-image-name_1000x1000.jpg`) will download automatically.
6.  **Preview:** A preview of the final image will appear on the page.

## Technical Details

- Pure HTML, CSS, and JavaScript (no external frameworks)
- Material Design 3 inspired UI components (buttons, sliders, modal)
- Canvas API for all image manipulation (cropping, resizing, drawing)
- `localStorage` for persisting user settings
- Outputs images as JPEGs with a quality setting of 0.92.

## Use Cases

- Preparing product photos for e-commerce platforms (Shopify, WooCommerce, Etsy, etc.)
- Creating consistently sized and margined images for online marketplaces or catalogs.
- Quickly process images without complex photo editing software.

## Browser Compatibility

Works best in modern browsers (Chrome, Firefox, Edge, Safari) that fully support HTML5 Canvas API, File API, Clipboard API, and modern CSS features (including CSS variables and pseudo-elements for slider styling).
