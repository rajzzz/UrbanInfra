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
let selectedDistrictName = null;
let currentView = "districts";
let districtLabels = [];
let wardLabels = [];
let idleListener = null;
let tilesListener = null;
let wardIndex = []; // will hold searchable ward entries
let suggestionSelected = -1;
let infoPanel = null;
// Population lookup table: normalized ward name -> population number
let wardPopulationMap = {};

// =====================================
// Initialization
// =====================================
async function initMap() {
  // Ensure Google Maps is fully loaded
  if (typeof google === 'undefined' || !google.maps || !google.maps.Map) {
    console.error("Google Maps API not loaded yet");
    setTimeout(() => initMap(), 200);
    return;
  }
  
  // Ensure map container exists
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    console.error("Map container element not found");
    return;
  }
  
  // Wait for importLibrary to be available (required for async loading)
  let retries = 0;
  const maxRetries = 20; // 10 seconds max wait time (20 * 500ms)
  while (!google.maps.importLibrary && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 500));
    retries++;
  }
  
  if (!google.maps.importLibrary) {
    console.error("google.maps.importLibrary is not available after waiting");
    alert("Could not load Google Maps marker library. Please refresh the page.");
    return;
  }
  
  let AdvancedMarkerElement;
  try {
    const markerLibrary = await google.maps.importLibrary("marker");
    AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
  } catch (error) {
    console.error("Error importing Google Maps marker library:", error);
    // Don't return, continue without AdvancedMarkerElement - use fallback if needed
    console.warn("Continuing without AdvancedMarkerElement - some features may be limited");
  }

  map = initializeMap();
  
  if (!map) {
    console.error("Failed to initialize map");
    return;
  }
  
  // Ensure map is properly sized after initialization
  setTimeout(() => {
    if (map && google && google.maps && google.maps.event) {
      google.maps.event.trigger(map, 'resize');
    }
  }, 200);
  
  infoPanel = createInfoPanel();
  setupBackButton(map, handleBackButtonClick);
  setupMapTypeToggle(map);

  try {
    districtDataGeoJson = await fetchGeoJSON("https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/DELHI/DELHI_DISTRICTS.geojson");
    wardDataGeoJson = await fetchGeoJSON("https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/refs/heads/master/Delhi/Delhi_Wards.geojson");
    // Load CSV with population data (local file included in js/)
    try {
      const popCsvText = await fetch('./js/delhi_ward_population.csv').then(r => r.text());
      parsePopulationCsv(popCsvText);
    } catch (csvErr) {
      console.warn('Could not load population CSV:', csvErr?.message || csvErr);
    }
    buildWardIndex();
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
  
  // Trigger another resize after data is loaded to ensure proper rendering
  setTimeout(() => {
    if (map && google && google.maps && google.maps.event) {
      google.maps.event.trigger(map, 'resize');
    }
  }, 500);

  // Hover info
  map.data.addListener("mouseover", (event) => {
    if (currentView === "ward") return;
    map.data.revertStyle();
    map.data.overrideStyle(event.feature, { strokeWeight: 4 });
    infoPanel.update(event.feature, selectedDistrictName);
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
      selectedDistrictName = selectedDistrict ? selectedDistrict.getProperty("dtname") : null;
      if (AdvancedMarkerElement) {
        showWardsInDistrict(AdvancedMarkerElement);
      } else {
        // Fallback: try to load the marker library again
        google.maps.importLibrary("marker")
          .then(({ AdvancedMarkerElement }) => {
            showWardsInDistrict(AdvancedMarkerElement);
          })
          .catch((err) => {
            console.error("Error loading markers:", err);
            // Continue without markers
            showWardsInDistrict(null);
          });
      }
    } else if (currentView === "wards") {
      showSingleWard(event.feature);
    }
  });

  // Wire up search box
  if (AdvancedMarkerElement) {
    setupSearchUI(AdvancedMarkerElement);
  } else {
    // Try to load marker library for search
    google.maps.importLibrary("marker")
      .then(({ AdvancedMarkerElement }) => {
        setupSearchUI(AdvancedMarkerElement);
      })
      .catch((err) => {
        console.error("Error loading markers for search:", err);
        setupSearchUI(null);
      });
  }

  // Provide analyze handler: the UI's Analyze button will call this with a google.maps.Data.Feature
  if (infoPanel && typeof infoPanel.setAnalyzeHandler === "function") {
    infoPanel.setAnalyzeHandler((feature) => {
      // Show loader immediately when analyze button is clicked
      showLoader("Preparing ward for analysis...", 5);
      
      // If the feature is a raw GeoJSON object (from wardDataGeoJson), convert it by adding to map.data
      try {
        // If it's already a google.maps.Data.Feature, show it directly
        if (feature && typeof feature.getGeometry === "function") {
          showSingleWard(feature);
        } else {
          const added = map.data.addGeoJson({ type: "FeatureCollection", features: [feature] })[0];
          if (added) showSingleWard(added);
        }
      } catch (err) {
        console.error("Analyze handler error:", err);
        hideLoader();
      }
    });
  }

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
  // Loader is already shown by analyze handler, now start the phases and update progress
  setLoaderProgress(5, "Preparing ward metadata...");
  startLoaderPhases();

  try {
    const bounds = new google.maps.LatLngBounds();
    wardFeature.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const center = bounds.getCenter();

    const metadata = {
      wardName: wardFeature.getProperty("Ward_Name"),
      wardNumber: wardFeature.getProperty("Ward_No"),
      districtName: selectedDistrictName || (selectedDistrict ? selectedDistrict.getProperty("dtname") : "N/A"),
      population: wardFeature.getProperty("population") !== null && wardFeature.getProperty("population") !== undefined ? wardFeature.getProperty("population") : 'N/A',
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

    setLoaderProgress(Math.max(loaderProgress, 35), "Sending data to backend...");
    console.log("Starting analysis submission at", new Date().toISOString());

    const redirectPath = await submitWardForAnalysis(metadata, imageFile);
    console.log("Analysis submission completed at", new Date().toISOString());
    const redirectUrl = new URL(redirectPath, BACKEND_BASE_URL).toString();
    console.log("✅ Analysis request accepted. Redirecting to results:", redirectUrl);

    setLoaderProgress(100, "Done! Redirecting...");
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 250);
  } catch (err) {
    console.error("Failed to capture or send data:", err?.message || err);
    const errorMessage = err?.message || "Unknown error occurred";
    
    // Update loader with specific error message
    if (errorMessage.includes("timeout")) {
      setLoaderProgress(90, "Analysis is taking longer than expected. Please wait...");
    } else {
      setLoaderProgress(90, `Error: ${errorMessage}. Attempting recovery...`);
    }
    
    // Try a non-blocking fallback: request latest analysis page from backend and redirect there if available.
    (async () => {
      try {
        const latestUrl = new URL("/analysis/latest", BACKEND_BASE_URL).toString();
        setLoaderProgress(Math.max(loaderProgress, 92), "Checking for previous analysis...");
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 5000);
        const resp = await fetch(latestUrl, { method: "GET", credentials: "include", signal: fallbackController.signal });
        clearTimeout(fallbackTimeout);
        if (resp && resp.ok) {
          console.warn("Redirecting to latest analysis as fallback after error");
          setLoaderProgress(100, "Redirecting to last analysis...");
          setTimeout(() => (window.location.href = latestUrl), 250);
          return;
        }
      } catch (fetchErr) {
        console.warn("Fallback fetch for latest analysis failed", fetchErr?.message || fetchErr);
      }

      // If fallback didn't work, show a single non-blocking alert as last resort
      setLoaderProgress(100, `Error: ${errorMessage}`);
      setTimeout(() => {
        hideLoader();
        alert(`Analysis failed: ${errorMessage}\n\nPlease check your connection and try again.`);
      }, 1500);
    })();
  }
}

async function submitWardForAnalysis(metadata, imageFile) {
  const REQUEST_TIMEOUT = 180000; // 3 minutes timeout
  let response;
  let abortController = new AbortController();
  let timeoutId = setTimeout(() => {
    abortController.abort();
  }, REQUEST_TIMEOUT);

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

      console.log("Sending FormData request at", new Date().toISOString());
      response = await fetch(requestUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        signal: abortController.signal,
      });
      console.log("Received response at", new Date().toISOString(), "Status:", response.status);
    } else {
      const jsonBody = JSON.stringify({ metadata });
      console.log("JSON payload", {
        requestUrl,
        bodyPreview: jsonBody.slice(0, 4000),
      });

      console.log("Sending JSON request at", new Date().toISOString());
      response = await fetch(requestUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: jsonBody,
        signal: abortController.signal,
      });
      console.log("Received response at", new Date().toISOString(), "Status:", response.status);
    }
    
    clearTimeout(timeoutId);
  } catch (networkError) {
    clearTimeout(timeoutId);
    if (networkError.name === 'AbortError') {
      throw new Error("Request timeout: The analysis is taking too long. Please try again or contact support.");
    }
    throw new Error("Unable to reach backend at " + BACKEND_BASE_URL + ": " + networkError.message);
  }
  // Try to parse JSON body (may fail)
  let payload = null;
  try {
    payload = await response
      .clone()
      .json()
      .catch(() => null);
  } catch (e) {
    payload = null;
  }

  if (!response.ok) {
    if (payload && payload.redirect_url) {
      console.warn("Backend returned non-OK but included redirect_url; continuing with redirect.");
      return payload.redirect_url;
    }
    const text = await response
      .clone()
      .text()
      .catch(() => response.statusText);
    console.error("Backend error", response.status, text);
    throw new Error("Backend error " + response.status + ": " + (text || response.statusText));
  }

  const result = payload || (await response.json().catch(() => null));
  if (!result || !result.redirect_url) {
    throw new Error("Backend response missing redirect_url.");
  }
  console.log("Ward submission succeeded", response.status, response.headers.get("Set-Cookie"));
  return result.redirect_url;
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
  // Skip label creation if AdvancedMarkerElement is not available
  if (!AdvancedMarkerElement) {
    console.warn("AdvancedMarkerElement not available, skipping label creation");
    return null;
  }
  
  const bounds = new google.maps.LatLngBounds();
  feature.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
  const div = document.createElement("div");
  div.className = "map-label";
  div.textContent = text;

  try {
    const marker = new AdvancedMarkerElement({
      position: bounds.getCenter(),
      map: map,
      content: div,
      title: text,
    });
    return marker;
  } catch (error) {
    console.error("Error creating marker:", error);
    return null;
  }
}

function updateTitleCardVisibility() {
  const titleCard = document.getElementById("title-card");
  if (titleCard) titleCard.style.display = currentView === "ward" ? "none" : "block";
}

// -----------------------------
// Loader helpers (center overlay with progress bar)
// -----------------------------
let loaderTimer = null;
let loaderAnimating = false;
let loaderProgress = 0;

const loaderPhases = [
  { from: 5, to: 20, duration: 800, text: "Preparing ward metadata..." },
  { from: 20, to: 55, duration: 2000, text: "Sending data to backend..." },
  { from: 55, to: 85, duration: 2500, text: "Analyzing satellite image..." },
  { from: 85, to: 98, duration: 2200, text: "Generating recommendations..." },
];

function showLoader(statusText = "Preparing ward metadata...", percent = 5) {
  const overlay = document.getElementById("loader");
  if (!overlay) return;
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");
  setLoaderProgress(percent, statusText);
}

function hideLoader() {
  const overlay = document.getElementById("loader");
  if (!overlay) return;
  overlay.classList.remove("is-visible");
  overlay.setAttribute("aria-hidden", "true");
  stopLoaderPhases();
  // reset bar for next time
  const bar = document.getElementById("loader-progress");
  if (bar) bar.style.width = "0%";
}

function setLoaderProgress(percent, statusText) {
  loaderProgress = Math.max(0, Math.min(100, percent));
  const bar = document.getElementById("loader-progress");
  const status = document.getElementById("loader-status");
  if (bar) bar.style.width = loaderProgress + "%";
  if (status && statusText) status.textContent = statusText;
}

function startLoaderPhases() {
  stopLoaderPhases();
  let phaseIndex = 0;
  loaderAnimating = true;
  const runPhase = () => {
    if (!loaderAnimating || phaseIndex >= loaderPhases.length) return;
    const { from, to, duration, text } = loaderPhases[phaseIndex];
    const start = performance.now();
    const animate = (t) => {
      if (!loaderAnimating) return;
      const elapsed = t - start;
      const ratio = Math.max(0, Math.min(1, elapsed / duration));
      const value = Math.round(from + (to - from) * ratio);
      setLoaderProgress(value, text);
      if (ratio < 1) {
        loaderTimer = requestAnimationFrame(animate);
      } else {
        phaseIndex += 1;
        runPhase();
      }
    };
    loaderTimer = requestAnimationFrame(animate);
  };
  runPhase();
}

function stopLoaderPhases() {
  loaderAnimating = false;
  if (loaderTimer) cancelAnimationFrame(loaderTimer);
  loaderTimer = null;
}

function showAllDistricts(AdvancedMarkerElement) {
  clearMapData();
  clearLabels(wardLabels);
  currentView = "districts";

  const features = map.data.addGeoJson(districtDataGeoJson);
  features.forEach((f) => {
    const name = f.getProperty("dtname");
    if (name) {
      const label = createLabelForFeature(f, name, AdvancedMarkerElement);
      if (label) districtLabels.push(label);
    }
  });

  map.setCenter({ lat: 28.6139, lng: 77.209 });
  map.setZoom(10);
  selectedDistrict = null;
  document.getElementById("back-button").style.display = "none";
  updateTitleCardVisibility();
}

// -----------------------------
// Search / Suggestion Helpers
// -----------------------------
// Normalize names for comparison: trim, collapse whitespace, uppercase
function normalizeName(s) {
  if (!s) return "";
  return s.toString().trim().replace(/\s+/g, " ").toUpperCase();
}

// Canonicalize ward names specifically for population matching between GeoJSON and CSV.
// The goal is to standardize obvious spelling/format variants without fuzzy matching.
// Rules:
// - Uppercase
// - Replace & with AND
// - Remove punctuation (.,'’()-) and hyphens
// - Normalize common tokens: EXTN/EXT./EXTENTION -> EXTENSION, I.P -> IP
// - Normalize a couple of known Delhi variants (e.g., JAHAGIR -> JAHANGIR, BHALASWA -> BHALSWA)
// - Normalize PHASE roman numerals (I/II) to 1/2
// - Collapse whitespace; optionally remove spaces entirely when noSpaces=true
function normalizeWardKey(input, noSpaces = false) {
  if (!input) return "";
  let s = input.toString().toUpperCase();

  // Token fixes before stripping punctuation
  s = s.replace(/&/g, " AND ");

  // Strip punctuation, keep spaces for token boundaries
  s = s.replace(/[\.,'’()]/g, " ");
  s = s.replace(/-/g, " ");

  // Common expansions / corrections
  s = s.replace(/\bEXTN\b/g, " EXTENSION ");
  s = s.replace(/\bEXT\.?\b/g, " EXTENSION ");
  s = s.replace(/\bEXTENTION\b/g, " EXTENSION ");
  s = s.replace(/\bI\s*\.?\s*P\b/g, " IP "); // I.P -> IP

  // Known variants seen in datasets
  s = s.replace(/\bJAHAGIR\b/g, " JAHANGIR ");
  s = s.replace(/\bBHALASWA\b/g, " BHALSWA ");

  // PHASE roman numerals to digits
  s = s.replace(/\bPHASE\s*-?\s*I\b/g, " PHASE 1");
  s = s.replace(/\bPHASE\s*-?\s*II\b/g, " PHASE 2");

  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  if (noSpaces) s = s.replace(/\s+/g, "");
  return s;
}

function buildWardIndex() {
  if (!wardDataGeoJson || !wardDataGeoJson.features) return;
  // Merge population into ward feature properties where possible
  wardDataGeoJson.features.forEach((f) => {
    try {
      const name = f.properties.Ward_Name || f.properties.WardName || f.properties.ward_name || '';
      const pop = getPopulationForWard(name);
      f.properties.population = pop !== null ? pop : null;
    } catch (e) {
      // ignore
    }
  });

  wardIndex = wardDataGeoJson.features.map((f, i) => {
    const name = (f.properties.Ward_Name || "").toString();
    const number = f.properties.Ward_No ? f.properties.Ward_No.toString() : "";
    return {
      nameUpper: name.toUpperCase(),
      name: name,
      number: number,
      featureIndex: i,
    };
  });
}

// Parse CSV text of population file into wardPopulationMap (normalized keys)
function parsePopulationCsv(csvText) {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) return;
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const wardIdx = header.indexOf('ward');
  const popIdx = header.indexOf('total_population') >= 0 ? header.indexOf('total_population') : header.indexOf('population') || 1;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    const wardName = cols[wardIdx] || cols[0];
    const pop = cols[popIdx] ? Number(cols[popIdx].replace(/\D/g, '')) : null;
    if (wardName) {
      const pVal = isNaN(pop) ? null : pop;
      // Store both spaced and no-space canonical keys for resilient matching
      const keySpaced = normalizeWardKey(wardName, false);
      const keyTight = normalizeWardKey(wardName, true);
      wardPopulationMap[keySpaced] = pVal;
      wardPopulationMap[keyTight] = pVal;
    }
  }
}

function getPopulationForWard(wardName) {
  if (!wardName) return null;
  // Try spaced canonical key
  const keySpaced = normalizeWardKey(wardName, false);
  let p = wardPopulationMap[keySpaced];
  if (typeof p === 'number') return p;
  // Try compact (no-space) canonical key
  const keyTight = normalizeWardKey(wardName, true);
  p = wardPopulationMap[keyTight];
  return typeof p === 'number' ? p : null;
}

function setupSearchUI(AdvancedMarkerElement) {
  const input = document.getElementById("ward-search");
  const suggestions = document.getElementById("search-suggestions");
  if (!input || !suggestions) return;

  input.addEventListener("input", (e) => {
    const q = (e.target.value || "").trim().toUpperCase();
    renderSuggestions(q);
  });

  input.addEventListener("keydown", (e) => {
    const items = suggestions.querySelectorAll(".suggestion-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      suggestionSelected = Math.min(suggestionSelected + 1, items.length - 1);
      updateSuggestionHighlight(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      suggestionSelected = Math.max(suggestionSelected - 1, 0);
      updateSuggestionHighlight(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestionSelected >= 0 && items[suggestionSelected]) {
        items[suggestionSelected].click();
      } else if (items.length === 1) {
        items[0].click();
      }
    }
  });

  // click outside to close
  document.addEventListener("click", (ev) => {
    if (!ev.composedPath().includes(input) && !ev.composedPath().includes(suggestions)) {
      suggestions.innerHTML = "";
      suggestions.setAttribute("aria-hidden", "true");
      suggestionSelected = -1;
    }
  });

  function renderSuggestions(query) {
    suggestions.innerHTML = "";
    suggestionSelected = -1;
    if (!query) {
      suggestions.setAttribute("aria-hidden", "true");
      return;
    }

    const matches = wardIndex.filter((w) => w.nameUpper.includes(query) || w.number === query).slice(0, 30);
    if (matches.length === 0) {
      suggestions.setAttribute("aria-hidden", "true");
      return;
    }

    suggestions.setAttribute("aria-hidden", "false");
    const fragment = document.createDocumentFragment();
    matches.forEach((m) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.textContent = m.name + (m.number ? ` (${m.number})` : "");
      div.dataset.index = m.featureIndex;
      div.addEventListener("click", async () => {
        const idx = Number(div.dataset.index);
        const feature = wardDataGeoJson.features[idx];
        if (!feature) return;

        // Clear current map data and add the selected ward feature to the map for preview
        clearMapData();
        const addedFeature = map.data.addGeoJson({ type: "FeatureCollection", features: [feature] })[0];
        map.data.overrideStyle(addedFeature, getSelectedWardStyle ? getSelectedWardStyle() : {});

        // Fit map to ward bounds
        try {
          const bounds = new google.maps.LatLngBounds();
          addedFeature.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
          map.fitBounds(bounds);
        } catch (err) {
          console.warn("Could not fit bounds for selected ward", err);
        }

        // Do NOT auto-run analysis — let user click the Analyze button in the side panel
        // try to infer district by searching districtWardMap for ward name
        // Infer district robustly by normalizing ward names (trim + uppercase)
        try {
          const wardNameRaw = addedFeature.getProperty && addedFeature.getProperty("Ward_Name");
          selectedDistrictName = null;
          if (wardNameRaw) {
            const wardNameNorm = normalizeName(wardNameRaw);
            for (const [dName, wards] of Object.entries(districtWardMap)) {
              for (const w of wards) {
                if (normalizeName(w) === wardNameNorm) {
                  selectedDistrictName = dName;
                  break;
                }
              }
              if (selectedDistrictName) break;
            }
          }
        } catch (e) {
          selectedDistrictName = null;
        }

        // Update UI panels (left side info) — pass the inferred district name
        if (infoPanel && typeof infoPanel.update === "function") infoPanel.update(addedFeature, selectedDistrictName);

        suggestions.innerHTML = "";
        suggestions.setAttribute("aria-hidden", "true");
        input.value = "";
      });
      fragment.appendChild(div);
    });
    suggestions.appendChild(fragment);
  }

  function updateSuggestionHighlight(items) {
    items.forEach((it, i) => {
      if (i === suggestionSelected) it.classList.add("active");
      else it.classList.remove("active");
    });
    if (suggestionSelected >= 0 && items[suggestionSelected]) {
      items[suggestionSelected].scrollIntoView({ block: "nearest" });
    }
  }
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
    if (name) {
      const label = createLabelForFeature(f, name, AdvancedMarkerElement);
      if (label) wardLabels.push(label);
    }
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

  // Check if importLibrary is available before using it
  if (google.maps && typeof google.maps.importLibrary === 'function') {
    google.maps
      .importLibrary("marker")
      .then(({ AdvancedMarkerElement }) => {
        if (currentView === "ward") showWardsInDistrict(AdvancedMarkerElement);
        else if (currentView === "wards") showAllDistricts(AdvancedMarkerElement);
      })
      .catch((err) => {
        console.error("Error restoring markers:", err);
        // Continue without markers if library loading fails
        if (currentView === "ward") showWardsInDistrict(null);
        else if (currentView === "wards") showAllDistricts(null);
      });
  } else {
    console.warn("google.maps.importLibrary not available, continuing without markers");
    if (currentView === "ward") showWardsInDistrict(null);
    else if (currentView === "wards") showAllDistricts(null);
  }
}
