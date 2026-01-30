export const sliders = {};

export function initSliders() {
    document.querySelectorAll('[data-slider]').forEach(el => {
        const key   = el.dataset.slider;
        const min   = Number(el.dataset.min);
        const max   = Number(el.dataset.max);
        const step  = Number(el.dataset.step ?? 1);
        const def   = Number(el.dataset.default);
        const label = el.dataset.label ?? key;

        const labelEl   = el.querySelector('.label');
        const minSpan   = el.querySelector('.min');
        const maxSpan   = el.querySelector('.max');
        const numberEl  = el.querySelector('input[type="number"]');
        const rangeEl   = el.querySelector('input[type="range"]');

        // --- Set static text ---
        if (labelEl) labelEl.textContent = label;
        if (minSpan) minSpan.textContent = min;
        if (maxSpan) maxSpan.textContent = max;

        // --- Configure inputs ---
        [numberEl, rangeEl].forEach(input => {
            input.min = min;
            input.max = max;
            input.step = step;
        });

        // --- Utility functions ---
        const snap = v => Math.round(Number(v) / step) * step;
        const clamp = v => Math.min(max, Math.max(min, snap(v)));

        // --- Sync functions ---
        function syncFromNumber() {
            const v = clamp(numberEl.value);
            numberEl.value = v;
            rangeEl.value  = v;
        }

        function syncFromRange() {
            numberEl.value = rangeEl.value;
        }

        numberEl.addEventListener('input', syncFromNumber);
        rangeEl.addEventListener('input', syncFromRange);

        // --- Initialize default ---
        numberEl.value = rangeEl.value = def;

        // --- Store getter in sliders object ---
        sliders[key] = () => Number(numberEl.value);
    });
}

export function resetSliders() {
    document.querySelectorAll('[data-slider]').forEach(el => {
        const def = Number(el.dataset.default);
        const numberEl = el.querySelector('input[type="number"]');
        const rangeEl  = el.querySelector('input[type="range"]');
        numberEl.value = rangeEl.value = def;
    });
}
