export function initializeMap() {
    // A Map ID is REQUIRED to use AdvancedMarkerElement.
    // The visual style for this Map ID is now controlled in the Google Cloud Console.
    const map = new google.maps.Map(document.getElementById("map"), {
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

    // We no longer set styles in the code, as it's handled by the Map ID.
    // map.setOptions({ styles: mapStyle }); // <-- REMOVED THIS LINE

    return map;
}