// js/ui.js

export function createInfoPanel() {
    const infoPanelElement = document.createElement('div');
    infoPanelElement.className = 'info-panel';
    
    return {
        getElement: () => infoPanelElement,
        update: function(feature) {
            let content = '<h4>Information</h4>';
            if (feature) {
                // Use 'dtname' for district name to match your GeoJSON structure
                const districtName = feature.getProperty('dtname'); 
                const wardName = feature.getProperty('Ward_Name');

                if (districtName) {
                    content += `<p><strong>District:</strong> ${districtName}</p>`;
                } else if (wardName) {
                    content += `<p><strong>Ward:</strong> ${wardName}</p>`;
                    content += `<p><strong>Ward No:</strong> ${feature.getProperty('Ward_No')}</p>`;
                    // The ward GeoJSON does not have a district name property, so this info is not available here.
                }
            } else {
                content += '<p>Hover over a feature</p>';
            }
            infoPanelElement.innerHTML = content;
        }
    };
}

export function setupBackButton(map, backFunction) {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', backFunction);
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(backButton);
    }
}

/**
 * Sets up the map type toggle switch (Roadmap vs. Satellite).
 * @param {google.maps.Map} map - The Google Map object.
 */
export function setupMapTypeToggle(map) {
    const toggleContainer = document.getElementById('map-controls');
    const toggleCheckbox = document.getElementById('map-type-toggle');
    
    if (!toggleContainer || !toggleCheckbox) {
        console.error("Map type toggle elements not found in the DOM.");
        return;
    }

    // Store the initial map type ID (e.g., 'roadmap' or your custom styled map ID)
    const initialMapTypeId = map.getMapTypeId();

    // Add an event listener to the checkbox
    toggleCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            // If the toggle is ON, switch to satellite view
            map.setMapTypeId('satellite');
        } else {
            // If the toggle is OFF, switch back to the original map type
            map.setMapTypeId(initialMapTypeId);
        }
    });

    // Add the control to the map's UI.
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleContainer);
}