const glyph_size = 42;
const sheet_w = 800;
const pad = 4;
const fontpath = "Rubik-ExtraBold.ttf"
const debug = true;

function update() {
	let glyphs = "∎";
	for (let i = 32; i < 122; i++) {
		glyphs += String.fromCharCode(i);
	}
	for (let i = 1040; i < 1103; i++) {
		glyphs += String.fromCharCode(i);
	}
	const dimensions = new Uint8Array(glyphs.length * 2);
	const charcodes = new Uint16Array(glyphs.length);
	
	const canvas = document.querySelector("#level_canvas_d0") ?? null;
	canvas.width = sheet_w;
	canvas.height = sheet_w;
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = !debug;
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0, 0, 2, 2);

	ctx.font = `bold ${glyph_size}px ToprocessFont`; 
	
	const measures = ctx.measureText(glyphs);
	
	let max_glyph_w = 0;
	let max_glyph_h = (measures.actualBoundingBoxAscent + measures.actualBoundingBoxDescent);
	for (let i = 0; i < glyphs.length; i++) {
		const glyph = glyphs[i];
		const measure = ctx.measureText(glyph);
		max_glyph_w = (Math.max(measure.actualBoundingBoxRight + measure.actualBoundingBoxLeft, max_glyph_w));
	}
	
	max_glyph_w = Math.floor(max_glyph_w);
	max_glyph_h = Math.floor(max_glyph_h);
	
	const sheet_cw = Math.floor(sheet_w / (max_glyph_w + pad * 2));
	canvas.width = (sheet_cw) * (max_glyph_w + pad) + pad * 2;
	canvas.height = Math.ceil(glyphs.length / sheet_cw) * (max_glyph_h + pad) + pad * 2;
	ctx.font = `bold ${glyph_size}px ToprocessFont`;
	
	for (let i = 0; i < glyphs.length; i++) {
		const glyph = glyphs[i];
		const measure = ctx.measureText(glyph);
		const glyph_w = (measure.actualBoundingBoxRight + measure.actualBoundingBoxLeft);
		const glyph_h = (measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent);
		const shift_x = ((max_glyph_w - glyph_w) * 0.5);
		const shift_y = ((max_glyph_h - glyph_h) * 0.5);
		const p = pad + i * (max_glyph_w + pad);
		const cx = (i % sheet_cw) * (max_glyph_w + pad) + pad;
		const cy = (Math.floor(i / sheet_cw) * (max_glyph_h + pad) + pad);
		const x = (cx + shift_x);
		const y = (cy + shift_y);
		const fx = Math.round(x + measure.actualBoundingBoxLeft);
		const fy = Math.round(y - measure.actualBoundingBoxDescent + glyph_h);
		
		ctx.fillStyle = "white"; 
		ctx.globalAlpha = 1.0;
		ctx.fillText(glyph, fx, fy);
		dimensions[i * 2] = Math.floor(glyph_w / max_glyph_w * 255);
		dimensions[i * 2 + 1] = Math.floor(glyph_h / max_glyph_h * 255);
		charcodes[i] = glyphs.charCodeAt(i);
		
		if (debug) {
			ctx.strokeStyle = "red";
			ctx.lineWidth = 1;
			ctx.globalAlpha = 0.5;
			ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.ceil(glyph_w), Math.ceil(glyph_h));
			ctx.strokeStyle = "yellow";
			ctx.strokeRect(Math.floor(cx) + 0.5, Math.floor(cy) + 0.5, Math.ceil(max_glyph_w), Math.ceil(max_glyph_h));
		}
	}
	
	txt_output1.innerHTML = dimensions.toBase64();
	txt_output2.innerHTML = new Uint8Array(charcodes.buffer).toBase64();
	
	txt_output3.innerHTML = `${max_glyph_w},${max_glyph_h},${sheet_cw}`
	console.log(dimensions, charcodes);
}

function main() {
	load().then(() => {
		update();
	});
}

function load() {
	const font = new FontFace('ToprocessFont', `url(${fontpath})`);
	return font.load().then((loadedFont) => {
		document.fonts.add(loadedFont); // Add to the document
	}).catch(err => console.error("Font failed to load", err));
}

main();