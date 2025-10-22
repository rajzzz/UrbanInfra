// =====================================
// Imports
// =====================================
import { initializeMap } from "./map.js";
import { createInfoPanel, setupBackButton, setupMapTypeToggle } from "./ui.js";
import { getDistrictStyle, getWardStyle, getSelectedWardStyle, getSatelliteWardBoundaryStyle } from "./layers.js";

const backendMeta = document.querySelector('meta[name="backend-base-url"]');
// Use current origin to ensure same-origin requests (avoid CORS issues)
const BACKEND_BASE_URL = (backendMeta && backendMeta.content) || window.BACKEND_BASE_URL || window.location.origin;

// --- Ward Mapping Data ---
const districtWardMap = {
  North: [
    "MUKHERJEE NAGAR",
    "SANGAM PARK",
    "MODEL TOWN",
    "ROHINI",
    "SHALIMAR BAGH SOUTH",
    "ROHINI CENTRAL",
    "BEGUMPUR",
    "RANA PRATAP BAGH",
    "BAKHTAWAR PUR",
    "ALIPUR",
    "SAHIBABAD DAULAT PUR",
    "BANKNER",
    "BAWANA",
    "BHALSWA",
    "SAMAYPUR BADLI",
    "JAHANGIRPURI-I",
    "SARAI PIPAL THALA",
    "ADARASH  NAGAR",
    "DHIR PUR",
    "G.T.B. NAGAR",
    "ROHINI NORTH",
    "LIBAS PUR",
    "NARELA",
    "BHALASWA JAHAGIR PUR",
    "JAHANGIR PURI -II",
  ],
  "North East": [
    "GHONDA",
    "YAMUNA VIHAR",
    "JIWANPUR",
    "GOKALPUR",
    "SHIV VIHAR",
    "KARAWAL NAGAR EAST",
    "MUSTAFABAD",
    "KHAJOORI KHAS",
    "KARAWAL NAGAR WEST",
    "SONIA VIHAR",
    "BRAHAM PURI",
    "NEW USMANPUR",
    "BHAJANPURA",
    "NEHRU VIHAR",
    "TUKHMIR PUR",
  ],
  West: [
    "KHYALA",
    "JANAK PURI NORTH",
    "JANAK PURI WEST",
    "JANAK PURI SOUTH",
    "PUNJABI BAGH",
    "NEW RANJIT NAGAR",
    "KIRTI NAGAR",
    "MANSAROWER GARDEN",
    "HASTSAL",
    "TILAK NAGAR",
    "MAJOR BHUPINDAR SINGH NAGAR",
    "VIKASPURI EAST",
    "MOHAN GARDEN",
    "NAWADA",
    "UTTAM NAGAR",
    "RANI BAGH",
    "PASCHIM VIHAR NORTH",
    "PASCHIM VIHAR SOUTH",
    "QUAMMRUDDIN NAGAR",
    "NANGLOI EAST",
    "PERAGHARHI",
    "GURU HARKISHAN NAGAR",
    "KARAM PURA",
    "EAST PATEL NAGAR",
    "WEST PATEL NAGAR",
    "RAJA GARDEN",
    "RAGHUBIR NAGAR",
    "RAJOURI GARDEN",
    "NANGAL RAYA",
    "SUBHASH NAGAR",
    "NANGLOI JAT WEST",
    "MADIPUR",
    "TAGORE GARDEN",
    "KUNWAR SINGH NAGAR",
    "VIKAS NAGAR",
    "VIKAS PURI",
    "MAHAVIR NAGAR",
    "BALJIT NAGAR",
    "NILOTHI",
    "VISHNU GARDEN",
  ],
  East: [
    "GHONDLI",
    "ANARKALI",
    "MAYUR VIHAR PHASE-I",
    "DALLOPURA",
    "TRILOK PURI",
    "NEW ASHOK NAGAR",
    "KALYAN PURI",
    "KHICHRIPUR",
    "KONDLI",
    "GHAROLI",
    "VINOD NAGAR",
    "GEETA COLONY",
    "PREET VIHAR",
    "I.P EXTENTION",
    "SHAKARPUR",
    "LAXMI NAGAR",
    "MAYUR VIHAR PHASE II",
    "MANDAWALI",
    "PATPARGANJ",
    "PANDAV NAGAR",
    "KISHAN KUNJ",
  ],
  "South West": [
    "MILAP NAGAR",
    "SITA PURI",
    "CHHAWLA",
    "NANGLI SAKRAVATI",
    "KAKRAULA",
    "KHERA",
    "SADH NAGAR",
    "BINDAPUR",
    "DABRI",
    "MATIALA",
    "ROSHANPURA",
    "MAHAVIR ENCLAVE",
    "SAGARPUR WEST",
    "BIJWASAN",
    "MADHU VIHAR",
    "DICHAON KALAN",
    "PALAM",
    "MANGLAPURI",
    "NAJAFGARH",
  ],
  Central: [
    "CHANDNI CHOWK",
    "MINTO ROAD",
    "KUCHA PANDIT",
    "BAZAR SITARAM",
    "IDGAH ROAD",
    "TURKMAN GATE",
    "BALLIMARAN",
    "RAM NAGAR",
    "QASABPURA",
    "PAHAR GANJ",
    "KAMLA NAGAR",
    "INDER LOK COLONY",
    "KISHAN GANJ",
    "DEPUTY GANJ",
    "KASHMERE GATE",
    "MAJNU KA TILA",
    "JAMA MASJID",
    "DEV NAGAR",
    "KAROL BAGH",
    "MODEL BASTI",
    "MALKAGANJ",
    "JHARODA",
    "MUKUND PUR",
    "TIMAR PUR",
    "RAJENDER NAGAR",
    "BURARI",
    "DARYAGANJ",
    "SHASTRI NAGAR",
  ],
  "New Delhi": [
    "DELHI CANTT CHARGE 1",
    "DELHI CANTT CHARGE 2",
    "DELHI CANTT CHARGE 4",
    "DELHI CANTT CHARGE 5",
    "DELHI CANTT CHARGE 6",
    "DELHI CANTT CHARGE 7",
    "DELHI CANTT CHARGE 8",
    "DELHI CANTT CHARGE 3",
    "NDMC CHARGE 1",
    "NDMC CHARGE 2",
    "NDMC CHARGE 3",
    "NDMC CHARGE 4",
    "NDMC CHARGE 5",
    "NDMC CHARGE 7",
    "NDMC CHARGE 8",
    "NDMC CHARGE 9",
    "VASANT VIHAR",
    "NANAK PURA",
    "VASANTKUNJ",
    "PUSA",
    "INDER PURI",
    "NARAINA",
    "SAGARPUR",
    "MAHIPALPUR",
    "KAPASHERA",
    "HARI NAGAR",
    "R. K. PURAM",
    "RAJ NAGAR",
  ],
  South: [
    "MALVIYA NAGAR",
    "HAUZ RANI",
    "MUNIRKA",
    "DAKSHINPURI EXT.",
    "KHANPUR",
    "AMBEDKAR NAGAR",
    "MADANGIR",
    "PUSHP VIHAR",
    "SHAPUR JAT",
    "DEOLI",
    "CHHATARPUR",
    "AYA NAGAR",
    "BHATI",
    "KISHANGARH",
    "SAFDARJANG ENCLAVE",
    "HAUZ KHAS",
    "LADOSARAI",
    "SAID UL AJAIB",
    "SANGAM VIHAR",
    "MEHRAULI",
    "SANGAM VIHAR WEST",
    "TIGRI",
  ],
  Shahdara: [
    "DILSHAD GARDEN",
    "NEW SEEMA PURI",
    "NAND NAGRI",
    "SUNDER NAGARI",
    "DURGA PURI",
    "ASHOK NAGAR",
    "RAM NAGAR",
    "WELCOME COLONY",
    "CHAUHAN BANGER",
    "ZAFFRABAD",
    "MAUJPUR",
    "SUBHASH MOHALLA",
    "KARDAM PURI",
    "JANTA COLONY",
    "BABAR PUR",
    "SABOLI",
    "HARSH VIHAR",
    "GANDHI NAGAR",
    "AZAD NAGAR",
    "RAGHUBAR PURA",
    "SHAHDARA",
    "JHILMIL",
    "VIVEK VIHAR",
    "DILSHAD COLONY",
    "KRISHNA  NAGAR",
    "ANAND VIHAR",
    "VISHWASH NAGAR",
    "DHARAMPURA",
  ],
  "South East": [
    "NDMC CHARGE 6",
    "NIZAMUDDIN",
    "BHOGAL",
    "KASTURBA NAGAR",
    "AMAR COLONY",
    "ANDREWSGANJ",
    "TUGHLAKABAD EXTN",
    "SANGAM VIHAR CENTRAL",
    "SANGAM VIHAR EAST",
    "CHIRAG DELHI",
    "CHITRANJAN PARK",
    "GREATER KAILASH-I",
    "SRI NIWASPURI",
    "EAST OF KAILASH",
    "GOVIND PURI",
    "KALKAJI",
    "TUGHLAKABAD",
    "PUL PEHLAD",
    "TEKHAND",
    "HARKESH NAGAR",
    "JAITPUR",
    "MEETHEYPUR",
    "BADAR PUR",
    "MOLARBAND",
    "OKHLA",
    "MADANPUR KHADAR",
    "SARITA VIHAR",
    "LAJPAT NAGAR",
    "KOTLA MUBARAKPUR",
    "ZAKIR NAGAR",
  ],
  "North West": [
    "ASHOK VIHAR",
    "WAJIRPUR",
    "SAWAN PARK",
    "NIMRI COLONY",
    "SHAKUR PUR",
    "KOHAT ENCLAVE",
    "RAMPURA",
    "TRI NAGAR",
    "SARASWATI VIHAR",
    "SHALIMAR BAGH NORTH",
    "PITAMPUR NORTH",
    "PITAMPURA SOUTH",
    "NAHARPUR",
    "ROHINI EAST",
    "MANGOLPURI  WEST",
    "MANGOLPURI  EAST",
    "ROHINI SOUTH",
    "SULTANPURI  SOUTH",
    "SULTANPURI  EAST",
    "KIRARI SULEMAN NAGAR",
    "KARALA",
    "POOTH KALAN",
    "VIJAY VIHAR",
    "RITHALA",
    "MUNDAKA",
    "BUDH VIHAR",
    "NITHARI",
    "SULTANPUR MAJRA",
    "MOTI NAGAR",
    "MANGOLPURI",
    "MANGOL PURI  NORTH",
    "PRATAP VIHAR",
    "PREM NAGAR",
  ],
};

// =====================================
// Global State
// =====================================
let map;
let districtDataGeoJson;
let wardDataGeoJson;
let selectedDistrict = null;
let currentView = "districts";
let districtLabels = [];
let wardLabels = [];
let idleListener = null;
let tilesListener = null;

// =====================================
// Initialization
// =====================================
async function initMap() {
  let AdvancedMarkerElement;
  try {
    const markerLibrary = await google.maps.importLibrary("marker");
    AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
  } catch (error) {
    console.error("Error importing Google Maps marker library:", error);
    alert("Could not load map markers.");
    return;
  }

  map = initializeMap();
  const infoPanel = createInfoPanel();
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoPanel.getElement());
  setupBackButton(map, handleBackButtonClick);
  setupMapTypeToggle(map);

  try {
    districtDataGeoJson = await fetchGeoJSON("https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/DELHI/DELHI_DISTRICTS.geojson");
    wardDataGeoJson = await fetchGeoJSON("https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/refs/heads/master/Delhi/Delhi_Wards.geojson");
  } catch (error) {
    console.error("Failed to load GeoJSON data:", error);
    alert("Could not load map data.");
    return;
  }

  map.data.setStyle((feature) => {
    if (currentView === "districts") return getDistrictStyle();
    if (currentView === "wards") return getWardStyle();
    return {};
  });

  // Hover info
  map.data.addListener("mouseover", (event) => {
    if (currentView === "ward") return;
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, { strokeWeight: 4 });
    infoPanel.update(event.feature);
  });

  map.data.addListener("mouseout", () => {
    if (currentView === "ward") return;
    map.data.revertStyle();
    infoPanel.update(null);
  });

  // Click events
  map.data.addListener("click", (event) => {
    if (currentView === "districts") {
      selectedDistrict = event.feature;
      showWardsInDistrict(AdvancedMarkerElement);
    } else if (currentView === "wards") {
      showSingleWard(event.feature);
    }
  });

  showAllDistricts(AdvancedMarkerElement);
}

window.initMap = initMap;

// =====================================
// Show Single Ward → Switch to Satellite → Capture HD Image
// =====================================
function showSingleWard(wardFeature) {
  if (idleListener) google.maps.event.removeListener(idleListener);
  if (tilesListener) google.maps.event.removeListener(tilesListener);

  clearMapData();
  clearLabels(wardLabels);
  currentView = "ward";

  const addedFeature = map.data.add(wardFeature)[0];
  map.data.overrideStyle(addedFeature, getSatelliteWardBoundaryStyle());

  const bounds = new google.maps.LatLngBounds();
  wardFeature.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
  map.fitBounds(bounds);

  document.getElementById("back-button").style.display = "block";
  updateTitleCardVisibility();

  console.log("Switching to satellite view...");
  map.setMapTypeId("satellite");

  console.log("Waiting for satellite tiles to load...");

  // Wait for tiles to load completely
  let tilesLoadedTime = null;
  tilesListener = google.maps.event.addListenerOnce(map, "tilesloaded", () => {
    tilesLoadedTime = Date.now();
    console.log("Tiles loaded at:", tilesLoadedTime);
  });

  // Wait for the map to be idle (all rendering done)
  idleListener = google.maps.event.addListenerOnce(map, "idle", () => {
    const idleTime = Date.now();
    console.log("Map idle at:", idleTime);

    // If tiles haven't loaded yet, wait for them
    if (!tilesLoadedTime) {
      console.log("Tiles not loaded yet, waiting...");
      const delayedTilesListener = google.maps.event.addListenerOnce(map, "tilesloaded", () => {
        console.log("Tiles finally loaded, waiting 3s for rendering...");
        setTimeout(() => {
          console.log("Capturing satellite image now...");
          captureAndProcessWard(wardFeature);
        }, 3000);
      });

      // Timeout fallback
      setTimeout(() => {
        google.maps.event.removeListener(delayedTilesListener);
        console.log("Timeout - capturing anyway...");
        captureAndProcessWard(wardFeature);
      }, 8000);
    } else {
      // Tiles loaded, wait a bit more for final rendering
      const waitTime = 3000;
      console.log(`Waiting ${waitTime}ms for final rendering...`);
      setTimeout(() => {
        console.log("Capturing satellite image now...");
        captureAndProcessWard(wardFeature);
      }, waitTime);
    }
  });
}

// =====================================
// Capture Ward Screenshot + Metadata
// =====================================
async function captureAndProcessWard(wardFeature) {
  const loader = document.getElementById("loader");
  let loaderLabel = null;
  if (loader) {
    loader.style.display = "block";
    loaderLabel = loader.querySelector("p");
    if (loaderLabel) loaderLabel.textContent = "Preparing ward metadata...";
  }

  try {
    const bounds = new google.maps.LatLngBounds();
    wardFeature.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const center = bounds.getCenter();

    const metadata = {
      wardName: wardFeature.getProperty("Ward_Name"),
      wardNumber: wardFeature.getProperty("Ward_No"),
      districtName: selectedDistrict ? selectedDistrict.getProperty("dtname") : "N/A",
      coordinates: {
        bounding_box: {
          southwest: { lat: sw.lat(), lng: sw.lng() },
          northeast: { lat: ne.lat(), lng: ne.lng() },
        },
        center: {
          lat: center.lat(),
          lng: center.lng(),
        },
      },
    };

    metadata.map_view = {
      zoom: map.getZoom(),
      mapTypeId: map.getMapTypeId(),
    };

    metadata.ward_geojson = await featureToGeoJson(wardFeature);

    // Skip canvas capture - it doesn't work reliably with Google Maps WebGL satellite rendering
    // Let backend generate high-quality image via Static Maps API
    let imageFile = null;
    console.log("⏩ Skipping canvas capture - using backend Static Maps API for reliable satellite imagery");

    if (loaderLabel) {
      loaderLabel.textContent = "Sending ward metadata to AI backend...";
    }

    const redirectPath = await submitWardForAnalysis(metadata, imageFile);
    const redirectUrl = new URL(redirectPath, BACKEND_BASE_URL).toString();
    console.log("✅ Analysis request accepted. Redirecting to results:", redirectUrl);

    window.location.href = redirectUrl;
  } catch (err) {
    console.error("Failed to capture or send data:", err?.message || err);
    alert("Could not process ward. Please check the console.");
  } finally {
    if (loader) {
      const loaderLabel = loader.querySelector("p");
      if (loaderLabel && loaderLabel.textContent !== "Sending ward to AI backend...") {
        loaderLabel.textContent = "Upload failed. Please try again.";
      }
      setTimeout(() => {
        loader.style.display = "none";
        const innerLabel = loader.querySelector("p");
        if (innerLabel) innerLabel.textContent = "Analyzing Ward...";
      }, 1200);
    }
  }
}

async function submitWardForAnalysis(metadata, imageFile) {
  let response;
  try {
    const requestUrl = `${BACKEND_BASE_URL}/analyze`;
    const metadataPreview = {
      wardName: metadata?.wardName,
      wardNumber: metadata?.wardNumber,
      districtName: metadata?.districtName,
      hasCoordinates: Boolean(metadata?.coordinates),
      hasGeoJson: Boolean(metadata?.ward_geojson),
      mapView: metadata?.map_view,
    };

    console.log("Submitting ward to backend", {
      hasImage: Boolean(imageFile),
      backend: BACKEND_BASE_URL,
      requestUrl,
      metadataPreview,
    });

    if (imageFile) {
      const formData = new FormData();
      formData.append("metadata_json", JSON.stringify(metadata));
      formData.append("satellite_image", imageFile, imageFile.name || "ward_snapshot.png");

      const formDataSummary = [];
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          formDataSummary.push({
            key,
            fileName: value.name,
            type: value.type,
            size: value.size,
          });
        } else {
          const textValue = typeof value === "string" ? value : JSON.stringify(value);
          formDataSummary.push({
            key,
            valuePreview: textValue.slice(0, 200),
            length: textValue.length,
          });
        }
      }
      console.log("FormData payload", formDataSummary);

      response = await fetch(requestUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
    } else {
      const jsonBody = JSON.stringify({ metadata });
      console.log("JSON payload", {
        requestUrl,
        bodyPreview: jsonBody.slice(0, 4000),
      });

      response = await fetch(requestUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: jsonBody,
      });
    }
  } catch (networkError) {
    throw new Error("Unable to reach backend at " + BACKEND_BASE_URL + ": " + networkError.message);
  }

  if (!response.ok) {
    console.error("Backend returned error", response.status, await response.clone().text());
    const message = await response.text().catch(() => response.statusText);
    throw new Error("Backend error " + response.status + ": " + message);
  }

  console.log("Ward submission succeeded", response.status, response.headers.get("Set-Cookie"));
  const payload = await response.json();
  if (!payload.redirect_url) {
    throw new Error("Backend response missing redirect_url.");
  }

  return payload.redirect_url;
}

function featureToGeoJson(feature) {
  return new Promise((resolve) => {
    feature.toGeoJson((geojson) => resolve(geojson));
  });
}

function canvasToBlob(canvas, type = "image/png", quality = 1.0) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error("Map canvas not found."));
      return;
    }

    if (typeof canvas.toBlob === "function") {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas capture produced an empty blob."));
        },
        type,
        quality
      );
    } else {
      try {
        const dataUrl = canvas.toDataURL(type, quality);
        const byteString = atob(dataUrl.split(",")[1]);
        const buffer = new ArrayBuffer(byteString.length);
        const array = new Uint8Array(buffer);
        for (let i = 0; i < byteString.length; i += 1) {
          array[i] = byteString.charCodeAt(i);
        }
        resolve(new Blob([array], { type }));
      } catch (err) {
        reject(err);
      }
    }
  });
}

async function captureMapSnapshot() {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    throw new Error("Map element not found.");
  }

  // Wait a bit more for rendering
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find all canvas elements
  const canvases = Array.from(mapElement.querySelectorAll("canvas"));

  console.log(`Found ${canvases.length} canvas element(s) in map`);

  if (canvases.length === 0) {
    throw new Error("No canvas elements found in map");
  }

  // Log each canvas
  canvases.forEach((canvas, i) => {
    console.log(`Canvas ${i}:`, {
      width: canvas.width,
      height: canvas.height,
      visible: canvas.offsetParent !== null,
      style: canvas.style.cssText,
    });
  });

  // Find the largest non-empty canvas
  let bestCanvas = null;
  let maxPixels = 0;

  for (const canvas of canvases) {
    const pixels = canvas.width * canvas.height;
    if (pixels > maxPixels && canvas.width > 0 && canvas.height > 0) {
      maxPixels = pixels;
      bestCanvas = canvas;
    }
  }

  if (!bestCanvas) {
    throw new Error("No valid canvas found");
  }

  console.log(`Using canvas: ${bestCanvas.width}x${bestCanvas.height}`);

  // If there's only one canvas or canvas compositing fails, use the largest canvas directly
  if (canvases.length === 1) {
    console.log("Single canvas - using directly");
    return canvasToBlob(bestCanvas);
  }

  // Try to composite multiple canvases
  try {
    const composite = document.createElement("canvas");
    composite.width = bestCanvas.width;
    composite.height = bestCanvas.height;
    const ctx = composite.getContext("2d");

    if (!ctx) {
      console.warn("Failed to get 2D context, using best canvas directly");
      return canvasToBlob(bestCanvas);
    }

    // Draw all canvases
    let drawn = 0;
    for (const canvas of canvases) {
      if (canvas.width > 0 && canvas.height > 0) {
        try {
          ctx.drawImage(canvas, 0, 0);
          drawn++;
          console.log(`Drew canvas ${drawn}`);
        } catch (err) {
          console.warn(`Failed to draw canvas:`, err.message);
        }
      }
    }

    if (drawn === 0) {
      console.warn("No canvases drawn, using best canvas directly");
      return canvasToBlob(bestCanvas);
    }

    console.log(`Successfully composited ${drawn} canvas layers`);
    return canvasToBlob(composite);
  } catch (err) {
    console.warn("Canvas compositing failed, using best canvas directly:", err.message);
    return canvasToBlob(bestCanvas);
  }
}

// =====================================
// Helper Functions
// =====================================
async function fetchGeoJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function clearMapData() {
  map.data.forEach((feature) => map.data.remove(feature));
}

function clearLabels(labelArray) {
  labelArray.forEach((label) => (label.map = null));
  labelArray.length = 0;
}

function createLabelForFeature(feature, text, AdvancedMarkerElement) {
  const bounds = new google.maps.LatLngBounds();
  feature.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
  const div = document.createElement("div");
  div.className = "map-label";
  div.textContent = text;

  const marker = new AdvancedMarkerElement({
    position: bounds.getCenter(),
    map: map,
    content: div,
    title: text,
  });
  return marker;
}

function updateTitleCardVisibility() {
  const titleCard = document.getElementById("title-card");
  if (titleCard) titleCard.style.display = currentView === "ward" ? "none" : "block";
}

function showAllDistricts(AdvancedMarkerElement) {
  clearMapData();
  clearLabels(wardLabels);
  currentView = "districts";

  const features = map.data.addGeoJson(districtDataGeoJson);
  features.forEach((f) => {
    const name = f.getProperty("dtname");
    if (name) districtLabels.push(createLabelForFeature(f, name, AdvancedMarkerElement));
  });

  map.setCenter({ lat: 28.6139, lng: 77.209 });
  map.setZoom(10);
  selectedDistrict = null;
  document.getElementById("back-button").style.display = "none";
  updateTitleCardVisibility();
}

function showWardsInDistrict(AdvancedMarkerElement) {
  if (!selectedDistrict) return;

  clearMapData();
  clearLabels(districtLabels);
  currentView = "wards";

  const districtName = selectedDistrict.getProperty("dtname");
  const wardsForDistrict = districtWardMap[districtName] || [];

  const wardFeatures = {
    type: "FeatureCollection",
    features: wardDataGeoJson.features.filter((ward) => wardsForDistrict.includes(ward.properties.Ward_Name)),
  };

  const features = map.data.addGeoJson(wardFeatures);
  features.forEach((f) => {
    const name = f.getProperty("Ward_Name");
    if (name) wardLabels.push(createLabelForFeature(f, name, AdvancedMarkerElement));
  });

  const bounds = new google.maps.LatLngBounds();
  selectedDistrict.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
  map.fitBounds(bounds);

  document.getElementById("back-button").style.display = "block";
  updateTitleCardVisibility();
}

function handleBackButtonClick() {
  if (idleListener) google.maps.event.removeListener(idleListener);
  if (tilesListener) google.maps.event.removeListener(tilesListener);

  map.setMapTypeId("roadmap");
  const toggleCheckbox = document.getElementById("map-type-toggle");
  if (toggleCheckbox) toggleCheckbox.checked = false;

  google.maps
    .importLibrary("marker")
    .then(({ AdvancedMarkerElement }) => {
      if (currentView === "ward") showWardsInDistrict(AdvancedMarkerElement);
      else if (currentView === "wards") showAllDistricts(AdvancedMarkerElement);
    })
    .catch((err) => console.error("Error restoring markers:", err));
}


