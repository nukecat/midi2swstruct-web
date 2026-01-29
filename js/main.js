import init, { convert_midi_to_structure } from './pkg/midi2swstruct_web.js';

const DEFAULTS = {
    minPitch: 27,
    maxPitch: 111,
    minVelocity: 1,
    repeat: false,
    notesPerValue: 24,
    maxEventsPerFunc: 1024
};

function setDefaults() {
    document.getElementById("min-pitch").value = DEFAULTS.minPitch;
    document.getElementById("max-pitch").value = DEFAULTS.maxPitch;
    document.getElementById("min-pitch-value").textContent = DEFAULTS.minPitch;
    document.getElementById("max-pitch-value").textContent = DEFAULTS.maxPitch;

    document.getElementById("min-velocity").value = DEFAULTS.minVelocity;
    document.getElementById("min-velocity-value").textContent = DEFAULTS.minVelocity;

    document.getElementById("repeat").checked = DEFAULTS.repeat;

    document.getElementById("notes-per-value").value = DEFAULTS.notesPerValue;
    document.getElementById("max-events-per-func").value = DEFAULTS.maxEventsPerFunc;
}

async function setup() {
    await init();

    let midiBytes = null;

    const fileInput = document.getElementById("file-input");
    const dropZone = document.querySelector(".drop-zone");
    const statusEl = document.getElementById("status");
    const fileInfoEl = document.querySelector(".selected-file-info");

    // Update slider values dynamically.
    ["min-pitch", "max-pitch", "min-velocity"].forEach(id => {
        const input = document.getElementById(id);
        const span = document.getElementById(`${id}-value`);
        input.addEventListener("input", () => span.textContent = input.value);
    });

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

    function clampInput(inputEl, min, max) {
        inputEl.addEventListener('input', () => {
            let val = Number(inputEl.value);
            if (val < min) inputEl.value = min;
            if (val > max) inputEl.value = max;
        });
    }

    // Apply to relevant inputs
    clampInput(document.getElementById("min-pitch"), 0, 127);
    clampInput(document.getElementById("max-pitch"), 0, 127);
    clampInput(document.getElementById("min-velocity"), 0, 127);
    clampInput(document.getElementById("notes-per-value"), 1, 24);
    clampInput(document.getElementById("max-events-per-func"), 1, 65536); // arbitrary max

    function validateMinMax(minEl, maxEl) {
        [minEl, maxEl].forEach(el => el.addEventListener('input', () => {
            let min = Number(minEl.value);
            let max = Number(maxEl.value);
            if (min > max) {
                maxEl.value = min;  // auto-correct
            }
        }));
    }

    validateMinMax(
        document.getElementById("min-pitch"),
        document.getElementById("max-pitch")
    );

    setDefaults();

    document.getElementById("reset-btn").addEventListener("click", setDefaults);

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
                Number(document.getElementById("min-pitch").value),
                Number(document.getElementById("max-pitch").value),
                Number(document.getElementById("min-velocity").value),
                document.getElementById("repeat").checked,
                Number(document.getElementById("max-events-per-func").value),
                Number(document.getElementById("notes-per-value").value)
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
