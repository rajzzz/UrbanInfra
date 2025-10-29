// js/ui.js

export function createInfoPanel() {
  const infoPanelElement = document.createElement("div");
  infoPanelElement.className = "info-panel";
  let analyzeHandler = null;
  let lastFeature = null;

  function renderSideInfo(feature, districtNameFallback) {
    const sideInfo = document.getElementById("side-info");
    if (!sideInfo) return;
    let content = "";
    content += '<div class="info-panel">';
    content += "<h4>Information</h4>";
    if (feature) {
      lastFeature = feature;
  const districtName = feature.getProperty("dtname") || districtNameFallback;
  const wardName = feature.getProperty("Ward_Name");
  const wardNo = feature.getProperty("Ward_No") || feature.getProperty("WardNo") || "";
  const population = feature.getProperty("population");

  content += '<div class="meta-row"><div class="meta-label">Ward</div><div class="meta-value">' + (wardName || '<span class="muted">—</span>') + "</div></div>";
  content += '<div class="meta-row"><div class="meta-label">Ward No</div><div class="meta-value">' + (wardNo || '<span class="muted">—</span>') + "</div></div>";
  if (districtName) content += '<div class="meta-row"><div class="meta-label">District</div><div class="meta-value">' + districtName + "</div></div>";
  content += '<div class="meta-row"><div class="meta-label">Population</div><div class="meta-value">' + (population !== null && population !== undefined ? Number(population).toLocaleString() : '<span class="muted">N/A</span>') + "</div></div>";

      // Add an Analyze button
      content += '<button id="analyze-ward" class="analyze-btn">Analyze Ward</button>';
    } else {
      lastFeature = null;
      content += '<p class="muted">Hover or select a ward to see details</p>';
    }
    content += "</div>";
    sideInfo.innerHTML = content;

    // Wire analyze button
    const analyzeBtn = document.getElementById("analyze-ward");
    if (analyzeBtn) {
      analyzeBtn.addEventListener("click", () => {
        if (analyzeHandler && lastFeature) analyzeHandler(lastFeature);
      });
    }
  }

  return {
    getElement: () => infoPanelElement,
    update: function (feature, districtNameFallback) {
      // Update the floating info-panel (top-left control)
      let content = '<div class="info-panel compact">';
      content += "<h4>Information</h4>";
      if (feature) {
        const districtName = feature.getProperty("dtname") || districtNameFallback;
        const wardName = feature.getProperty("Ward_Name");
        const population = feature.getProperty("population");

        if (districtName) {
          content += `<div class="meta-row"><div class="meta-label">District</div><div class="meta-value">${districtName}</div></div>`;
        } else if (wardName) {
          content += `<div class="meta-row"><div class="meta-label">Ward</div><div class="meta-value">${wardName}</div></div>`;
          content += `<div class="meta-row"><div class="meta-label">Ward No</div><div class="meta-value">${feature.getProperty("Ward_No")}</div></div>`;
        }
        // compact population display
        content += `<div class="meta-row"><div class="meta-label">Pop</div><div class="meta-value">${population !== null && population !== undefined ? Number(population).toLocaleString() : 'N/A'}</div></div>`;
      } else {
        content += '<p class="muted">Hover over a feature</p>';
      }
      content += "</div>";
      infoPanelElement.innerHTML = content;

      // Also render the detailed side-info panel
      renderSideInfo(feature, districtNameFallback);
    },
    setAnalyzeHandler: function (cb) {
      analyzeHandler = cb;
    },
  };
}

export function setupBackButton(map, backFunction) {
  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", backFunction);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(backButton);
  }
}

/**
 * Sets up the map type toggle switch (Roadmap vs. Satellite).
 * @param {google.maps.Map} map - The Google Map object.
 */
export function setupMapTypeToggle(map) {
  const toggleContainer = document.getElementById("map-controls");
  const toggleCheckbox = document.getElementById("map-type-toggle");

  if (!toggleContainer || !toggleCheckbox) {
    console.error("Map type toggle elements not found in the DOM.");
    return;
  }

  // Store the initial map type ID (e.g., 'roadmap' or your custom styled map ID)
  const initialMapTypeId = map.getMapTypeId();

  // Add an event listener to the checkbox
  toggleCheckbox.addEventListener("change", (event) => {
    if (event.target.checked) {
      // If the toggle is ON, switch to satellite view
      map.setMapTypeId("satellite");
    } else {
      // If the toggle is OFF, switch back to the original map type
      map.setMapTypeId(initialMapTypeId);
    }
  });

  // Add the control to the map's UI.
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleContainer);
}
