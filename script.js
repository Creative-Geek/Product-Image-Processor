const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const browseButton = document.getElementById("browse-button");
const statusDiv = document.getElementById("status");
const sourceCanvas = document.getElementById("source-canvas");
const croppedCanvas = document.getElementById("cropped-canvas");
const finalCanvas = document.getElementById("final-canvas");
const previewCanvas = document.getElementById("preview-canvas");
const previewHeading = document.getElementById("preview-heading");

const sourceCtx = sourceCanvas.getContext("2d");
const croppedCtx = croppedCanvas.getContext("2d");
const finalCtx = finalCanvas.getContext("2d");
const previewCtx = previewCanvas.getContext("2d");

const FINAL_SIZE = 1000;
const MARGIN = 180;
const TARGET_CONTENT_SIZE = FINAL_SIZE - 2 * MARGIN; // 1000 - 360 = 640

// Hide preview canvas initially
previewCanvas.style.display = "none";

// --- Material Design Interactive Elements ---
// Ripple effect for buttons
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();

  const size = Math.max(rect.width, rect.height) * 2;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.classList.add("ripple");
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);

  // Remove ripple after animation completes
  ripple.addEventListener("animationend", () => {
    ripple.remove();
  });
}

// Add ripple effect to all MD buttons
document.querySelectorAll(".md-button").forEach((button) => {
  button.addEventListener("mousedown", createRipple);

  // Add click animation
  button.addEventListener("mousedown", () => {
    button.classList.add("clicked");
  });

  button.addEventListener("mouseup", () => {
    setTimeout(() => button.classList.remove("clicked"), 150);
  });

  button.addEventListener("mouseleave", () => {
    button.classList.remove("clicked");
  });
});

// Add click animation to drop zone
dropZone.addEventListener("mousedown", () => {
  dropZone.classList.add("clicked");
});

dropZone.addEventListener("mouseup", () => {
  setTimeout(() => dropZone.classList.remove("clicked"), 150);
});

dropZone.addEventListener("mouseleave", () => {
  dropZone.classList.remove("clicked");
});

// --- Event Handlers ---
// Drag and drop event handlers
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault(); // Prevent default browser behavior
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault(); // Prevent default browser behavior
  dropZone.classList.remove("dragover");
  updateStatus("Processing...", true);

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  } else {
    updateStatus("No file dropped.");
  }
});

// --- Browse Button ---
browseButton.addEventListener("click", () => {
  fileInput.click(); // Trigger the hidden file input
});

fileInput.addEventListener("change", (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    updateStatus("Processing...", true);
    handleFile(files[0]);
  }
});

// --- Paste Event Handler (Ctrl+V) ---
document.addEventListener("paste", (e) => {
  e.preventDefault();
  updateStatus("Processing pasted image...", true);

  const items = e.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const blob = items[i].getAsFile();
      // Generate a pseudo-filename for pasted content
      blob.name =
        "pasted-image-" + new Date().toISOString().replace(/:/g, "-") + ".jpg";
      handleFile(blob);
      return;
    }
  }

  updateStatus("No image found in pasted content.");
});

// --- Status Updates with Animation ---
function updateStatus(message, isProcessing = false) {
  statusDiv.textContent = message;

  if (isProcessing) {
    statusDiv.classList.add("processing");
  } else {
    statusDiv.classList.remove("processing");
  }
}

// --- File Handling ---
function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    updateStatus("Error: Dropped file is not an image.");
    return;
  }

  // Store the original filename for later use when downloading
  const originalFilename = file.name;

  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      processImage(img, originalFilename);
    };
    img.onerror = function () {
      updateStatus("Error: Could not load image.");
    };
    img.src = e.target.result; // Set image source to the loaded file data
  };

  reader.onerror = function () {
    updateStatus("Error: Could not read file.");
  };

  reader.readAsDataURL(file); // Read the file as a Data URL
}

// --- Image Processing Pipeline ---
function processImage(img, originalFilename) {
  console.log("Original dimensions:", img.width, img.height);
  updateStatus("Cropping image...", true);

  // 1. Crop to Content
  const cropData = cropToContent(img);
  if (!cropData) {
    updateStatus(
      "Error: Could not find content in the image (is it all white?)."
    );
    return;
  }
  console.log("Cropped dimensions:", cropData.width, cropData.height);
  updateStatus("Creating final image...", true);

  // 2. Create Final Image (Background + Resized/Placed Cropped Image)
  createFinalImage(cropData);

  // 3. Draw Preview (Optional)
  drawPreview();

  // 4. Trigger Download
  downloadImage(originalFilename);

  updateStatus("Processing complete! Downloading...");

  // Show preview with animation
  previewHeading.style.display = "block";
  previewCanvas.style.display = "block";
  setTimeout(() => {
    previewCanvas.classList.add("show");
  }, 50);
}

// --- Step 1: Crop to Content ---
function cropToContent(img) {
  // Draw image onto source canvas to get pixel data
  sourceCanvas.width = img.width;
  sourceCanvas.height = img.height;
  sourceCtx.drawImage(img, 0, 0);

  try {
    const imageData = sourceCtx.getImageData(
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height
    );
    const data = imageData.data;
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    let minX = width,
      minY = height,
      maxX = -1,
      maxY = -1;
    const whiteThreshold = 245; // Pixels with R, G, B > threshold are considered white background

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4; // Index for the start of pixel data (R, G, B, A)
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3]; // Alpha channel

        // Consider a pixel as non-background if it's not almost white OR if it's not fully transparent
        if (
          (r <= whiteThreshold || g <= whiteThreshold || b <= whiteThreshold) &&
          a > 30
        ) {
          // Added alpha check
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Check if any content was found
    if (maxX < minX || maxY < minY) {
      console.error(
        "No content found, image might be entirely white or transparent."
      );
      return null; // No content found
    }

    const croppedWidth = maxX - minX + 1;
    const croppedHeight = maxY - minY + 1;

    // Draw the cropped portion onto the croppedCanvas
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    croppedCtx.drawImage(
      sourceCanvas,
      minX,
      minY,
      croppedWidth,
      croppedHeight, // Source rectangle
      0,
      0,
      croppedWidth,
      croppedHeight // Destination rectangle
    );

    console.log(
      `Cropped Box: x=${minX}, y=${minY}, w=${croppedWidth}, h=${croppedHeight}`
    );
    return {
      canvas: croppedCanvas,
      width: croppedWidth,
      height: croppedHeight,
    };
  } catch (error) {
    console.error(
      "Error getting image data (maybe CORS issue if loading from external URL):",
      error
    );
    updateStatus("Error processing image data.");
    return null;
  }
}

// --- Step 2: Create Final Image ---
function createFinalImage(cropData) {
  finalCanvas.width = FINAL_SIZE;
  finalCanvas.height = FINAL_SIZE;

  // Fill background with white
  finalCtx.fillStyle = "white";
  finalCtx.fillRect(0, 0, FINAL_SIZE, FINAL_SIZE);

  // Calculate scaling factor to fit cropped image within target area (640x640)
  const scale = Math.min(
    TARGET_CONTENT_SIZE / cropData.width,
    TARGET_CONTENT_SIZE / cropData.height
  );

  // Calculate dimensions and position to draw the scaled image
  const drawWidth = cropData.width * scale;
  const drawHeight = cropData.height * scale;
  const drawX = MARGIN + (TARGET_CONTENT_SIZE - drawWidth) / 2; // Center horizontally within the margin
  const drawY = MARGIN + (TARGET_CONTENT_SIZE - drawHeight) / 2; // Center vertically within the margin

  console.log(
    `Drawing cropped image onto final canvas at: x=${drawX.toFixed(
      2
    )}, y=${drawY.toFixed(2)}, w=${drawWidth.toFixed(
      2
    )}, h=${drawHeight.toFixed(2)}`
  );

  // Draw the *cropped* image (from croppedCanvas) onto the final canvas, scaled and positioned
  finalCtx.drawImage(cropData.canvas, drawX, drawY, drawWidth, drawHeight);
}

// --- Step 3: Draw Preview ---
function drawPreview() {
  previewCanvas.width = 500; // Reset size if needed
  previewCanvas.height = 500;
  previewCtx.fillStyle = "#eee"; // Optional different background for preview
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  // Draw the final 1000x1000 image onto the smaller 500x500 preview canvas
  previewCtx.drawImage(
    finalCanvas,
    0,
    0,
    previewCanvas.width,
    previewCanvas.height
  );
}

// --- Step 4: Trigger Download ---
function downloadImage(originalFilename) {
  const dataURL = finalCanvas.toDataURL("image/jpeg"); // Get image data as JPG

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = originalFilename.replace(/\.[^/.]+$/, "") + ".jpg"; // Preserve original filename with .jpg extension

  // Append link to body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
