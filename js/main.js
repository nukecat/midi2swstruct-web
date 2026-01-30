import init, { convert_midi_to_structure } from '../pkg/midi2swstruct_web.js';
import { sliders, initSliders, resetSliders } from '../js/slider.js';

async function setup() {
    await init();

    initSliders();

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
        resetSliders,
        document.getElementById('repeat').checked = false;
    });

    let midiBytes = null;

    const fileInput = document.getElementById("file-input");
    const dropZone = document.querySelector(".drop-zone");
    const statusEl = document.getElementById("status");
    const fileInfoEl = document.querySelector(".selected-file-info");

    // Drag & Drop / File select
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", e => e.preventDefault());
    dropZone.addEventListener("drop", async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        midiBytes = new Uint8Array(await file.arrayBuffer());
        fileInfoEl.textContent = file.name;
    });
    fileInput.addEventListener("change", async (e) => {
        const file = fileInput.files[0];
        if (!file) return;
        midiBytes = new Uint8Array(await file.arrayBuffer());
        fileInfoEl.textContent = file.name;
    });

    // Convert button
    document.getElementById("convert-btn").addEventListener("click", async () => {
        if (!midiBytes) {
            alert("Please select a MIDI file first!");
            return;
        }

        statusEl.textContent = "Converting...";
        try {
            const structureBytes = convert_midi_to_structure(
                midiBytes,
                sliders.minPitch(),
                sliders.maxPitch(),
                sliders.minVelocity(),
                document.getElementById("repeat").checked,
                sliders.maxEventsPerFunc(),
                sliders.notesPerValue()
            );

            const blob = new Blob([structureBytes], { type: 'application/octet-stream' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileInfoEl.textContent.replace(/\.(mid|midi)$/i, '.structure');
            a.click();

            statusEl.textContent = "Done!";
        } catch (err) {
            console.error(err);
            statusEl.textContent = "Error: " + err;
        }
    });
}

setup();
