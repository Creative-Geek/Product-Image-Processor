const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const browseButton = document.getElementById("browse-button");
const statusDiv = document.getElementById("status");
const sourceCanvas = document.getElementById("source-canvas");
const croppedCanvas = document.getElementById("cropped-canvas");
const finalCanvas = document.getElementById("final-canvas");
const previewCanvas = document.getElementById("preview-canvas");
const previewHeading = document.getElementById("preview-heading");
const settingsButton = document.getElementById("settings-button");
const settingsModalOverlay = document.getElementById("settings-modal-overlay");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsButton = document.getElementById("close-settings-button");
const finalSizeInput = document.getElementById("final-size");
const finalSizeValueOutput = document.getElementById("final-size-value");
const marginPercentageInput = document.getElementById("margin-percentage");
const marginPercentageValueOutput = document.getElementById(
  "margin-percentage-value"
);
const backgroundColorInput = document.getElementById("background-color");
const resetButtonElements = document.querySelectorAll(".reset-button");

const sourceCtx = sourceCanvas.getContext("2d");
const croppedCtx = croppedCanvas.getContext("2d");
const finalCtx = finalCanvas.getContext("2d");
const previewCtx = previewCanvas.getContext("2d");

// --- Default Settings ---
const DEFAULT_SETTINGS = {
  finalSize: 1000, // Square size
  marginPercentage: 18, // Margin as % of final size
  backgroundColor: "#ffffff",
};

// --- Settings Management ---
let currentSettings = { ...DEFAULT_SETTINGS };

function loadSettings() {
  const savedSettings = localStorage.getItem("imageProcessorSettings");
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      // Ensure loaded settings have all keys from defaults, preventing errors if structure changed
      currentSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
      // Validate loaded settings (especially ranges)
      currentSettings.finalSize = Math.max(
        512,
        Math.min(
          2048,
          parseInt(currentSettings.finalSize) || DEFAULT_SETTINGS.finalSize
        )
      );
      currentSettings.marginPercentage = Math.max(
        0,
        Math.min(
          50,
          parseInt(currentSettings.marginPercentage) ||
            DEFAULT_SETTINGS.marginPercentage
        )
      );
    } catch (e) {
      console.error("Error parsing saved settings:", e);
      // Use defaults if parsing fails
      currentSettings = { ...DEFAULT_SETTINGS };
    }
  } else {
    currentSettings = { ...DEFAULT_SETTINGS };
  }
  applySettingsToUI();
}

function saveSettings() {
  localStorage.setItem(
    "imageProcessorSettings",
    JSON.stringify(currentSettings)
  );
}

function applySettingsToUI() {
  finalSizeInput.value = currentSettings.finalSize;
  finalSizeValueOutput.textContent = `${currentSettings.finalSize} px`;

  marginPercentageInput.value = currentSettings.marginPercentage;
  marginPercentageValueOutput.textContent = `${currentSettings.marginPercentage} %`;

  backgroundColorInput.value = currentSettings.backgroundColor;

  // Update slider track gradient dynamically (optional but nice)
  updateSliderTrack(finalSizeInput);
  updateSliderTrack(marginPercentageInput);
}

function updateSetting(key, value) {
  // Basic validation
  if (key === "finalSize") {
    value = Math.max(
      512,
      Math.min(2048, parseInt(value, 10) || DEFAULT_SETTINGS[key])
    );
  } else if (key === "marginPercentage") {
    value = Math.max(
      0,
      Math.min(50, parseInt(value, 10) || DEFAULT_SETTINGS[key])
    );
  } else if (key === "backgroundColor") {
    // Basic hex color validation (allows 3, 6, 8 digits)
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) {
      value = DEFAULT_SETTINGS[key];
    }
  }

  currentSettings[key] = value;
  applySettingsToUI(); // Keep UI in sync (updates slider value text)
  saveSettings();
}

function resetSetting(key) {
  updateSetting(key, DEFAULT_SETTINGS[key]);
}

// --- Slider Track Styling Update ---
function updateSliderTrack(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const percentage = ((val - min) * 100) / (max - min);
  // Use CSS variables for colors
  const activeColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--md-primary")
    .trim();
  const inactiveColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--md-surface-variant")
    .trim();
  slider.style.background = `linear-gradient(to right, ${activeColor} ${percentage}%, ${inactiveColor} ${percentage}%)`;
}

// --- Modal Logic ---
function openSettingsModal() {
  applySettingsToUI(); // Ensure UI shows current settings when opened
  settingsModalOverlay.classList.add("visible");
}

function closeSettingsModal() {
  settingsModalOverlay.classList.remove("visible");
}

// --- Event Listeners for Settings ---
settingsButton.addEventListener("click", openSettingsModal);
closeSettingsButton.addEventListener("click", closeSettingsModal);
settingsModalOverlay.addEventListener("click", (e) => {
  // Close if clicked outside the modal dialog itself
  if (e.target === settingsModalOverlay) {
    closeSettingsModal();
  }
});

// Use 'input' event for sliders for real-time updates
finalSizeInput.addEventListener("input", (e) => {
  updateSetting("finalSize", e.target.value);
  updateSliderTrack(e.target); // Update track gradient live
});
marginPercentageInput.addEventListener("input", (e) => {
  updateSetting("marginPercentage", e.target.value);
  updateSliderTrack(e.target); // Update track gradient live
});

// Use 'change' for color picker (less frequent updates needed)
backgroundColorInput.addEventListener("change", (e) =>
  updateSetting("backgroundColor", e.target.value)
);

resetButtonElements.forEach((button) => {
  button.addEventListener("click", (e) => {
    const settingKey = e.currentTarget.dataset.setting;
    if (settingKey) {
      resetSetting(settingKey);
      // Manually update slider tracks after reset if needed
      if (settingKey === "finalSize") updateSliderTrack(finalSizeInput);
      if (settingKey === "marginPercentage")
        updateSliderTrack(marginPercentageInput);
    }
  });
});

// Load settings on initial script load
loadSettings();

// --- Material Design Interactive Elements ---
// Ripple effect for buttons (Unchanged)
function createRipple(event) {
  const button = event.currentTarget;
  // Prevent ripple on slider thumb/track interaction inside the button's parent
  if (event.target.type === "range") return;

  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();

  // Check if button has icon class for centering ripple
  const isIconButton =
    button.classList.contains("md-icon-button") ||
    button.classList.contains("reset-button");
  const size = isIconButton
    ? Math.max(rect.width, rect.height) * 1.5
    : Math.max(rect.width, rect.height) * 2;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.classList.add("ripple");
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  // Use appropriate ripple color
  if (button.classList.contains("md-button")) {
    ripple.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  } else {
    ripple.style.backgroundColor = "rgba(0, 0, 0, 0.1)"; // Ripple for icon/reset buttons
  }

  button.appendChild(ripple);

  // Remove ripple after animation completes
  ripple.addEventListener("animationend", () => {
    ripple.remove();
  });
}

// Add ripple effect to all MD buttons (includes icon and reset buttons now)
document
  .querySelectorAll(".md-button, .md-icon-button, .reset-button")
  .forEach((button) => {
    button.addEventListener("mousedown", createRipple);

    // Add click animation states (optional, can refine)
    button.addEventListener("mousedown", () => {
      if (button.type !== "range") {
        // Don't apply click scale to sliders
        button.classList.add("clicked");
      }
    });

    button.addEventListener("mouseup", () => {
      setTimeout(() => button.classList.remove("clicked"), 150);
    });

    button.addEventListener("mouseleave", () => {
      button.classList.remove("clicked");
    });
  });

// Add click animation to drop zone (Unchanged)
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
// Drag and drop event handlers (Unchanged)
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

// --- Browse Button --- (Unchanged)
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

// --- Paste Event Handler (Ctrl+V) --- (Unchanged)
document.addEventListener("paste", (e) => {
  e.preventDefault();
  updateStatus("Processing pasted image...", true);

  const items = e.clipboardData.items;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const blob = items[i].getAsFile();
      // Generate a pseudo-filename for pasted content
      blob.name =
        "pasted-image-" + new Date().toISOString().replace(/:/g, "-") + ".png"; // Prefer PNG for pasted
      handleFile(blob);
      return;
    }
  }

  updateStatus("No image found in pasted content.");
});

// --- Status Updates with Animation ---
function updateStatus(message, isProcessing = false) {
  statusDiv.textContent = message;
  statusDiv.style.display = "block"; // Make status visible

  if (isProcessing) {
    statusDiv.classList.add("processing");
  } else {
    statusDiv.classList.remove("processing");
  }
}

// --- File Handling --- (Unchanged)
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
  updateStatus("Cropping image...", true);
  hidePreview(); // Hide previous preview if any

  // 1. Crop to Content
  const cropData = cropToContent(img);
  if (!cropData) {
    updateStatus(
      "Error: Could not find content in the image (is it all white?)."
    );
    return;
  }
  updateStatus("Creating final image...", true);

  // 2. Create Final Image (using current settings)
  createFinalImage(cropData);

  // 3. Draw Preview
  drawPreview();

  // 4. Trigger Download
  downloadImage(originalFilename);

  // Show preview with animation
  showPreview();
}

function showPreview() {
  previewHeading.style.display = "block";
  previewCanvas.style.display = "block";
  // Hide status message when preview is shown
  statusDiv.style.display = "none";
  statusDiv.classList.remove("processing");

  // Trigger animation
  setTimeout(() => {
    previewCanvas.classList.add("show");
  }, 50); // Short delay to allow display:block to take effect
}

function hidePreview() {
  previewHeading.style.display = "none";
  previewCanvas.style.display = "none";
  previewCanvas.classList.remove("show"); // Reset animation class
}

// --- Step 1: Crop to Content --- (Unchanged)
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
    const alphaThreshold = 10; // Pixels with alpha <= threshold are considered transparent background

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4; // Index for the start of pixel data (R, G, B, A)
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3]; // Alpha channel

        // Consider a pixel as content if it's not almost white AND has sufficient alpha
        if (
          (r <= whiteThreshold || g <= whiteThreshold || b <= whiteThreshold) &&
          a > alphaThreshold
        ) {
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

// --- Step 2: Create Final Image --- (Updated for new settings)
function createFinalImage(cropData) {
  // Use settings from currentSettings
  const finalSize = currentSettings.finalSize; // This is both width and height
  const marginPercentage = currentSettings.marginPercentage;
  const backgroundColor = currentSettings.backgroundColor;

  // Calculate absolute margin in pixels
  const margin = Math.round(finalSize * (marginPercentage / 100));

  // Calculate the available area for the content *after* margins are applied
  const targetContentWidth = finalSize - 2 * margin;
  const targetContentHeight = finalSize - 2 * margin;

  // Ensure target dimensions are positive (margin percentage could be high)
  if (targetContentWidth <= 0 || targetContentHeight <= 0) {
    console.warn(
      "Margin percentage too high, resulting in zero or negative content area. Clamping margin."
    );
    // Clamp margin calculation if it's too large (e.g., cap content area at 10px)
    const maxMargin = Math.floor((finalSize - 10) / 2);
    const effectiveMargin = Math.min(margin, maxMargin);
    targetContentWidth = finalSize - 2 * effectiveMargin;
    targetContentHeight = finalSize - 2 * effectiveMargin;
    // Recalculate margin based on clamped area if needed for positioning
    // margin = effectiveMargin; // Re-assign margin used for positioning
  }

  finalCanvas.width = finalSize;
  finalCanvas.height = finalSize;

  // Fill background with the selected color
  finalCtx.fillStyle = backgroundColor;
  finalCtx.fillRect(0, 0, finalSize, finalSize);

  // Calculate scaling factor to fit cropped image within target area
  const scale = Math.min(
    targetContentWidth / cropData.width,
    targetContentHeight / cropData.height
  );

  // Calculate dimensions and position to draw the scaled image
  const drawWidth = cropData.width * scale;
  const drawHeight = cropData.height * scale;
  // Calculate top-left corner (drawX, drawY) to center the scaled image within the margin area
  const drawX = margin + (targetContentWidth - drawWidth) / 2;
  const drawY = margin + (targetContentHeight - drawHeight) / 2;

  console.log(
    `Final Size: ${finalSize}x${finalSize}, Margin: ${margin}px (${marginPercentage}%)`
  );
  console.log(
    `Target Content Area: ${targetContentWidth}x${targetContentHeight}`
  );
  console.log(
    `Drawing cropped image onto final canvas at: x=${drawX.toFixed(
      2
    )}, y=${drawY.toFixed(2)}, w=${drawWidth.toFixed(
      2
    )}, h=${drawHeight.toFixed(2)}, scale: ${scale.toFixed(3)}`
  );

  // Draw the *cropped* image (from croppedCanvas) onto the final canvas, scaled and positioned
  finalCtx.drawImage(cropData.canvas, drawX, drawY, drawWidth, drawHeight);
}

// --- Step 3: Draw Preview --- (Unchanged)
function drawPreview() {
  const previewSize = Math.min(500, window.innerWidth - 48); // Adjust preview size based on viewport maybe
  previewCanvas.width = previewSize;
  previewCanvas.height = previewSize; // Keep preview square
  previewCtx.fillStyle =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--md-surface-variant")
      .trim() || "#eee"; // Use theme color for background
  previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

  // Draw the final image (potentially large) onto the smaller preview canvas
  // Maintain aspect ratio using drawImage's scaling
  previewCtx.drawImage(
    finalCanvas,
    0,
    0, // Source x, y
    finalCanvas.width,
    finalCanvas.height, // Source width, height
    0,
    0, // Destination x, y
    previewCanvas.width,
    previewCanvas.height // Destination width, height
  );
}

// --- Step 4: Trigger Download --- (Unchanged)
function downloadImage(originalFilename) {
  const dataURL = finalCanvas.toDataURL("image/jpeg", 0.92); // Get image data as JPG with quality setting

  const link = document.createElement("a");
  link.href = dataURL;

  // Sanitize filename and ensure .jpg extension
  const baseName = originalFilename.replace(/\.[^/.]+$/, ""); // Remove existing extension
  const safeBaseName = baseName.replace(/[^a-z0-9_.\-]/gi, "_"); // Replace unsafe characters
  link.download = `${safeBaseName}_${finalCanvas.width}x${finalCanvas.height}.jpg`;

  // Append link to body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- Initial UI Setup ---
hidePreview(); // Ensure preview is hidden on load
