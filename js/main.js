import init, { convert_midi_to_structure } from '../pkg/midi2swstruct_web.js';
import { sliders, resetSliders } from '../js/slider.js';
import { drop_zones } from '../js/drop-zone.js';

async function setup() {
    await init();

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
        resetSliders();
        document.getElementById('repeat').checked = false;
    });

    let midiBytes = null;

    // Convert button
    document.getElementById("convert-btn").addEventListener("click", async () => {
        if (!midiBytes) {
            midiBytes = drop_zones["midi-input"].file;
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
