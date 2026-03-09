const dimensions_base = "fXcAAC+dYz+OipbKtp+ooiw/UtJS0lpRgHg3PlgmMC16w5CibJ2OoJOfm52RoJOfgp2SopGfMHo5i2mRa1lqkYift7etnZSdmqKVnYOdf52copedNJ2Sn5Sdf52rnZCdmaKQnZuuk52WopKdlJ+gnbudp52hnY+dTtJ6w03SXiSbJkokgHmFooJ5haKCeWumhqiHny+nT9KEny+fxXiFd4R5haKFomR1fHlun4V3i3XBdYx1jJ+tnY+dlJ13nbK9g53/nZSin52fzZqdpZ2rnZedmaKXnZCdmqKSnZ+d0LCnnai9kJ3QneK9r53QnYydl6LnopGdgHmFsX91X3WYjYJ53XV6eYV1haqHdYZ1lnWBdYR5gHWFooJ5f3WLoLnKjHWQjoF1sHXAjpl1tXV4dX95w3k="
const characters_base = "DiIgACEAIgAjACQAJQAmACcAKAApACoAKwAsAC0ALgAvADAAMQAyADMANAA1ADYANwA4ADkAOgA7ADwAPQA+AD8AQABBAEIAQwBEAEUARgBHAEgASQBKAEsATABNAE4ATwBQAFEAUgBTAFQAVQBWAFcAWABZAFoAWwBcAF0AXgBfAGAAYQBiAGMAZABlAGYAZwBoAGkAagBrAGwAbQBuAG8AcABxAHIAcwB0AHUAdgB3AHgAeQAQBBEEEgQTBBQEFQQWBBcEGAQZBBoEGwQcBB0EHgQfBCAEIQQiBCMEJAQlBCYEJwQoBCkEKgQrBCwELQQuBC8EMAQxBDIEMwQ0BDUENgQ3BDgEOQQ6BDsEPAQ9BD4EPwRABEEEQgRDBEQERQRGBEcESARJBEoESwRMBE0ETgQ="

const sheet_cw = 15;
const glyph_h = 56;
const pad = 4;

function main() {
	const img = document.querySelector("#source");
	const dimensions = Uint8Array.fromBase64(dimensions_base);
	const characters = new Uint16Array(Uint8Array.fromBase64(characters_base).buffer);
	const characters_map = new Map();

	for (let i = 0; i < characters.length; i++) {
		characters_map.set(String.fromCharCode(characters[i]), i);
	}
	
	const sheet_ch = Math.ceil(characters.length / sheet_cw);
	const glyph_w = (img.width - pad * 2) / sheet_cw;
	const glyph_h = (img.height - pad * 2) / sheet_ch;
	console.log(glyph_w, glyph_h);
	
	const canvas = document.querySelector("#level_canvas_d0") ?? null;
	const ctx = canvas.getContext("2d");
	const todraw = "**0dd ~ Aв";
	for (let i = 0; i < todraw.length; i++) {
		const index = characters_map.get(todraw[i]) ?? 0;
		console.log(todraw[i], index);
		const x = index % sheet_cw;
		const y = Math.floor(index / sheet_cw);
		const sx = x * (glyph_w) + pad;
		const sy = y * (glyph_h) + pad;
		const sw = glyph_w - pad;
		const sh = glyph_h - pad;
		const dx = i * glyph_w;
		const dy = 0;
		const dw = glyph_w - pad;
		const dh = glyph_h - pad;
		ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
	}
}


main();