const glyph_size = 42;
const sheet_w = 800;
const pad = 4;
const fontpath = "Rubik-ExtraBold.ttf"
const debug = false;

function update() {
	let glyphs = "∎";
	for (let i = 32; i < 122; i++) {
		glyphs += String.fromCharCode(i);
	}
	for (let i = 1040; i < 1103; i++) {
		glyphs += String.fromCharCode(i);
	}
	const dimensions = new Uint16Array(glyphs.length * 8);
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
	const sheet_ch = Math.ceil(glyphs.length / sheet_cw);
	canvas.width = (sheet_cw) * (max_glyph_w + pad) + pad * 2;
	canvas.height = sheet_ch * (max_glyph_h + pad) + pad * 2;
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

		dimensions[i * 8 + 0] = Math.floor(x / canvas.width * 0xffff);
		dimensions[i * 8 + 1] = Math.floor(y / canvas.height * 0xffff);
		dimensions[i * 8 + 2] = Math.ceil(glyph_w / canvas.width * 0xffff);
		dimensions[i * 8 + 3] = Math.ceil(glyph_h / canvas.height * 0xffff);
		dimensions[i * 8 + 4] = Math.floor(glyph_w / max_glyph_w * 0xffff);
		dimensions[i * 8 + 5] = Math.floor(glyph_h / max_glyph_h * 0xffff);
		dimensions[i * 8 + 6] = Math.floor((measure.actualBoundingBoxDescent / max_glyph_h + 0.5) * 0xffff);
		dimensions[i * 8 + 7] = 0; // reserved for spretesheet index
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
	
	txt_output1.innerHTML = new Uint8Array(dimensions.buffer).toBase64();
	txt_output2.innerHTML = new Uint8Array(charcodes.buffer).toBase64();
	
	txt_output3.innerHTML = `${max_glyph_w},${max_glyph_h},${sheet_cw},${sheet_ch}`

	const kernings = [];
	const kernings_map = [];
	for (let i = 0; i < glyphs.length; i++) {
		kernings_map.push(kernings.length * 0.5);
		let count = 0;
		for (let ii = 0; ii < glyphs.length; ii++) {
			const glyph_a = glyphs[i];
			const glyph_b = glyphs[ii];
			const measure_a = ctx.measureText(glyph_a);
			const measure_b = ctx.measureText(glyph_b);
			const width_a = (measure_a.actualBoundingBoxRight + measure_a.actualBoundingBoxLeft);
			const width_b = (measure_b.actualBoundingBoxRight + measure_b.actualBoundingBoxLeft);
			const measure_c = ctx.measureText(glyph_a + glyph_b);
			const width_c = (measure_c.actualBoundingBoxRight + measure_c.actualBoundingBoxLeft);

			// If negative, the characters are moved closer together (kerning)
			const kerning = width_c - (width_a + width_b);
			if (kerning < 0) {
				//console.log(`${glyph_a}->${glyph_b}`, kerning);
				kernings.push(charcodes[ii], kerning);
				count += 1;
			}
		}
		kernings_map.push(count);
	}

	const kernings_fin = [];
	for (let i = 0; i < glyphs.length; i++) {
		let pos = kernings_map[i * 2 + 0];
		let len = kernings_map[i * 2 + 1];
		kernings_fin.push(len);
		for (let ii = 0; ii < len; ii++) {
			const index = (pos * 2 + ii * 2);
			kernings_fin.push(kernings[index + 0]);
			const kerning = kernings[index + 1] 
			kernings_fin.push(Math.floor((kerning / max_glyph_h + 0.5) * 0xffff));
		}
	}

	txt_output4.innerHTML = new Uint8Array(new Uint16Array(kernings_fin).buffer).toBase64();

	//console.log(kernings_map, kernings, kernings_fin, new Uint16Array(kernings_fin));
}

function main() {
	load().then(() => {
		update();
	});

	set_copy_on_click(txt_output1);
	set_copy_on_click(txt_output2);
	set_copy_on_click(txt_output3);
	set_copy_on_click(txt_output4);
}

function set_copy_on_click(el) {
	el.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(el.innerHTML);
			console.log("copied", el.innerHTML);
		} catch {
		}
	});
}

function load() {
	const font = new FontFace('ToprocessFont', `url(${fontpath})`);
	return font.load().then((loadedFont) => {
		document.fonts.add(loadedFont); // Add to the document
	}).catch(err => console.error("Font failed to load", err));
}

main();
