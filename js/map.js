export function initializeMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error("Map element not found");
        return null;
    }
    
    // A Map ID is REQUIRED to use AdvancedMarkerElement.
    // The visual style for this Map ID is now controlled in the Google Cloud Console.
    const map = new google.maps.Map(mapElement, {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 10,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        mapId: "9fc6d38ad53e758f7d239d37", // <-- Make sure your Map ID is pasted here

        // *** THIS IS THE FIX for the html2canvas warning ***
        // Allows html2canvas to capture the WebGL (Vector) map content.
        preserveDrawingBuffer: true
    });

    // Force a resize to ensure the map renders properly after page reload
    setTimeout(() => {
        if (map && google && google.maps && google.maps.event) {
            google.maps.event.trigger(map, 'resize');
        }
    }, 100);

    // We no longer set styles in the code, as it's handled by the Map ID.
    // map.setOptions({ styles: mapStyle }); // <-- REMOVED THIS LINE

    return map;
}