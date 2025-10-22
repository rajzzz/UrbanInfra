// js/layers.js

// Style for the main district view
export function getDistrictStyle() {
    return {
        fillColor: '#1A73E8', // Google Blue
        strokeColor: '#FFFFFF',
        strokeWeight: 1.5,
        fillOpacity: 0.5,
    };
}

// Style for the wards-within-a-district view
export function getWardStyle() {
    return {
        fillColor: '#F9AB00', // Google Yellow
        strokeColor: '#FFFFFF',
        strokeWeight: 1,
        fillOpacity: 0.6,
    };
}

// Style for the single, selected ward (default green fill)
export function getSelectedWardStyle() {
    return {
        fillColor: '#188038', // Google Green
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        fillOpacity: 0.7,
    };
}

// ================== START: NEW FUNCTION ==================
/**
 * Style for highlighting a single ward on the satellite view.
 * Uses a thick red stroke and no fill to show the imagery underneath.
 */
export function getSatelliteWardBoundaryStyle() {
    return {
        strokeColor: '#FF0000', // Bright Red
        strokeWeight: 4,
        strokeOpacity: 0.9,
        fillOpacity: 0 // Completely transparent fill
    };
}
// =================== END: NEW FUNCTION ===================