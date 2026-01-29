use wasm_bindgen::prelude::*;
use midly::Smf;
use midi2swstruct::generate_music_player;
use sw_structure_io::io::WriteBuilding;

// Enable better error messages for JS
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// The main function exposed to JS
#[wasm_bindgen]
pub fn convert_midi_to_structure(
    midi_bytes: &[u8],
    min_pitch: u8,
    max_pitch: u8,
    min_velocity: u8,
    repeat: bool,
    max_events_per_func: usize,
    notes_per_value: u32,
) -> Result<Box<[u8]>, JsValue> {
    let smf = Smf::parse(midi_bytes)
    .map_err(|e| JsValue::from_str(&format!("Failed to parse MIDI: {}", e)))?;

    let building = generate_music_player(
        smf,
        notes_per_value as usize,
        min_pitch,
        max_pitch,
        min_velocity,
        repeat,
        max_events_per_func,
    ).map_err(|e| JsValue::from_str(&format!("Failed to generate building: {:?}", e)))?;

    let mut buffer = Vec::new();
    buffer.write_building(&building, 0)
    .map_err(|e| JsValue::from_str(&format!("Failed to serialize building: {:?}", e)))?;

    Ok(buffer.into_boxed_slice())
}
