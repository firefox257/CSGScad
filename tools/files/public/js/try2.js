



import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js'; // Add this

const exporter = new STLExporter();
const objExporter = new OBJExporter(); // Add this

// ... existing code ...

export function exportSTL() {
    if (!currentObjects.length) {
        alert('No objects to export!');
        return;
    }
    const exportGroup = new THREE.Group();
    currentObjects.forEach((obj) => {
        if (obj.isMesh || obj instanceof Brush) exportGroup.add(obj.clone());
    });

    // Check the auto-saved format
    const format = (globalThis.settings && globalThis.settings.exportFormat) || 'stl';

    if (format === 'obj') {
        window.stlToSave = objExporter.parse(exportGroup);
        window.exportExt = '.obj';
    } else {
        window.stlToSave = exporter.parse(exportGroup, { binary: true });
        window.exportExt = '.stl';
    }
    
    openModal('save-stl-modal');
}

// Update the final save handler to use the correct extension
export async function handleSaveStl(event, filePath) {
    try {
        let finalPath = filePath;
        const ext = window.exportExt || '.stl';
        if (!finalPath.toLowerCase().endsWith(ext)) finalPath += ext;
        
        const content = window.stlToSave;
        await api.saveFile(finalPath, content);
        alert(`Exported successfully to: ${finalPath}`);
    } catch (error) {
        alert(`Failed to save export: ${error.message}`);
    }
    closeModal('save-stl-modal');
}


////-//////////////////-////






// --- Inside window.onload ---

// 1. Add radios to domElements
domElements.exportStlRadio = document.getElementById('format-stl');
domElements.exportObjRadio = document.getElementById('format-obj');

// 2. Load settings (existing logic)
const savedSettings = localStorage.getItem('csg-editor-settings');
if (savedSettings) {
    settings = JSON.parse(savedSettings);
}
// Apply loaded settings to UI
domElements.widthInput.value = settings.plateWidth;
domElements.lengthInput.value = settings.plateLength;
domElements.gridSizeInput.value = settings.gridSize;
domElements.libraryPathInput.value = settings.libraryPath;
if (settings.exportFormat === 'obj') {
    domElements.exportObjRadio.checked = true;
} else {
    domElements.exportStlRadio.checked = true;
}

// 3. Define the Auto-Save function
const autoSaveSettings = () => {
    settings.plateWidth = parseFloat(domElements.widthInput.value) || 220;
    settings.plateLength = parseFloat(domElements.lengthInput.value) || 220;
    settings.gridSize = parseFloat(domElements.gridSizeInput.value) || 10;
    settings.libraryPath = domElements.libraryPathInput.value || '/csgLib';
    settings.exportFormat = domElements.exportStlRadio.checked ? 'stl' : 'obj';

    localStorage.setItem('csg-editor-settings', JSON.stringify(settings));
    
    // Update the 3D grid immediately
    createBuildPlate();
    console.log("Settings auto-saved.");
};

// 4. Attach Listeners for immediate saving
[domElements.widthInput, domElements.lengthInput, domElements.gridSizeInput].forEach(el => {
    el.addEventListener('input', autoSaveSettings); // 'input' fires as they type
});
domElements.libraryPathInput.addEventListener('change', autoSaveSettings);
domElements.exportStlRadio.addEventListener('change', autoSaveSettings);
domElements.exportObjRadio.addEventListener('change', autoSaveSettings);


