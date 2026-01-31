import init, { convert_midi_to_structure } from '../pkg/midi2swstruct_web.js?v=2026.01.31';
import { sliders, resetSliders } from '../js/slider.js?v=2026.01.31';
import { drop_zones } from '../js/drop-zone.js?v=2026.01.31';
import '../js/collapsible.js?v=2026.01.31';

function formatError(err) {
    return err instanceof Error ? err.message : String(err);
}

async function setup() {
    await init();

    const statusEl = document.getElementById('status');
    const repeatEl = document.getElementById('repeat');

    statusEl.textContent = "Idle";
    repeatEl.checked = false;

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
        resetSliders();
        repeatEl.checked = false;
    });

    // Convert button
    const convertBtn = document.getElementById("convert-btn");
    convertBtn.addEventListener("click", async () => {
        const file = drop_zones["midi-input"]?.file;

        if (!file) {
            statusEl.textContent = "⚠️ No MIDI file selected!";
            return;
        }

        try {
            statusEl.textContent = "Reading file...";
            const midiBytes = new Uint8Array(await file.arrayBuffer());

            statusEl.textContent = "Converting MIDI...";
            const structureBytes = convert_midi_to_structure(
                midiBytes,
                sliders.minPitch(),
                sliders.maxPitch(),
                sliders.minVelocity(),
                repeatEl.checked,
                sliders.maxEventsPerFunc(),
                sliders.notesPerValue()
            );

            statusEl.textContent = "Preparing download...";
            const blob = new Blob([structureBytes], { type: 'application/octet-stream' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = file.name.replace(/\.(mid|midi)$/i, '.structure');
            a.click();

            statusEl.textContent = "✅ Conversion complete!";
        } catch (err) {
            console.error(err);
            statusEl.textContent = `❌ Error: ${formatError(err)}`;
        }
    });
}

setup();
