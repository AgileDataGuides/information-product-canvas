/**
 * Export an IPC model to a .pptx presentation.
 * Uses PptxGenJS (client-side, no server needed).
 *
 * Layout mirrors the Agile Data Guides IPC Google Slides template:
 *   - Green header bar with IP Name, Product Owner, T-Shirt Size
 *   - Canvas grid: Outcomes/Actions | Vision (FOR/WHO/THE/THAT/UNLIKE) | Personas | Delivery Types / Data Sync
 *                  Business Questions | Vision (cont.) | Core Business Events
 *                  Feature Stories | Will / Won't
 *   - CC BY-SA 4.0 footer with Agile Data Guides branding
 */
import type { IPCModel, InformationProduct } from './types';
import PptxGenJS from 'pptxgenjs';

// ── Colors matching the ADG template ──
const GREEN = '4CAF50';
const DARK = '333333';
const WHITE = 'FFFFFF';
const MUTED = '666666';
const BORDER = 'CCCCCC';
const LIGHT_BG = 'F5F5F5';

const FONT = 'Calibri';

// ── Slide dimensions (inches, 16:9) ──
const SW = 10;
const SH = 5.625;

// Layout constants
const HEADER_H = 0.6;
const FOOTER_H = 0.35;
const FOOTER_Y = SH - FOOTER_H;
const CONTENT_Y = HEADER_H;
const CONTENT_H = FOOTER_Y - CONTENT_Y;
const BORDER_W = 0.015;
const PAD = 0.12;

// Column positions (x, w)
const COL1_X = 0;
const COL1_W = 3.65;
const COL2_X = COL1_X + COL1_W;
const COL2_W = 2.55;
const COL3_X = COL2_X + COL2_W;
const COL3_W = 1.9;
const COL4_X = COL3_X + COL3_W;
const COL4_W = SW - COL4_X;

// Row positions (y, h) within content area
const TOP_H = CONTENT_H * 0.42;     // Outcomes/Personas/Delivery/DataSync row
const MID_H = CONTENT_H * 0.30;     // BQ/CBE row
const BOT_H = CONTENT_H * 0.28;     // Feature Stories / Will-Won't row

const ROW1_Y = CONTENT_Y;
const ROW2_Y = ROW1_Y + TOP_H;
const ROW3_Y = ROW2_Y + MID_H;

// Delivery/DataSync split within Col4 top area
const DELIVERY_H = TOP_H * 0.5;
const DATASYNC_H = TOP_H - DELIVERY_H;

function truncate(text: string, max: number): string {
	if (!text || text.length <= max) return text || '';
	return text.slice(0, max - 1) + '…';
}

/** Draw a bordered cell with section header and bullet items */
function addCell(
	slide: PptxGenJS.Slide,
	x: number, y: number, w: number, h: number,
	title: string,
	items: string[],
) {
	// Border outline
	slide.addShape('rect' as any, {
		x, y, w, h,
		fill: { color: WHITE },
		line: { color: BORDER, width: 0.75 },
	});

	// Section title (green text)
	slide.addText(title, {
		x: x + PAD, y: y + 0.04, w: w - PAD * 2, h: 0.22,
		fontSize: 9, fontFace: FONT, bold: true,
		color: GREEN,
		margin: 0,
	});

	// Bullet items
	if (items.length > 0) {
		const textRows = items.map((item, i) => ({
			text: truncate(item, 100),
			options: {
				bullet: { code: '2022' } as any,
				breakLine: i < items.length - 1,
				fontSize: 8,
				fontFace: FONT,
				color: DARK,
				lineSpacingMultiple: 1.1,
			},
		}));
		slide.addText(textRows as any, {
			x: x + PAD, y: y + 0.28, w: w - PAD * 2, h: h - 0.34,
			valign: 'top',
			margin: 0,
		});
	}
}

/** Draw the Vision section with FOR/WHO/THE/THAT/UNLIKE green pills */
function addVisionCell(
	slide: PptxGenJS.Slide,
	ip: InformationProduct,
	x: number, y: number, w: number, h: number,
) {
	// Border outline
	slide.addShape('rect' as any, {
		x, y, w, h,
		fill: { color: WHITE },
		line: { color: BORDER, width: 0.75 },
	});

	// Section title
	slide.addText('Vision', {
		x: x + PAD, y: y + 0.04, w: w - PAD * 2, h: 0.22,
		fontSize: 9, fontFace: FONT, bold: true,
		color: GREEN,
		margin: 0,
	});

	// Parse vision text — try to extract FOR/WHO/THE/THAT/UNLIKE sections
	// or just show the vision as-is with the pill labels
	const visionParts = parseVision(ip);
	const pillLabels = ['FOR', 'WHO', 'THE', 'THAT', 'UNLIKE'] as const;
	const pillH = 0.2;
	const pillW = 0.42;
	const spacing = (h - 0.3) / 5;
	let pillY = y + 0.32;

	for (let i = 0; i < pillLabels.length; i++) {
		const label = pillLabels[i];
		const value = visionParts[label] || '';

		// Green pill badge
		slide.addShape('rect' as any, {
			x: x + PAD, y: pillY,
			w: pillW, h: pillH,
			fill: { color: GREEN },
			rectRadius: 0.04,
		});
		slide.addText(label, {
			x: x + PAD, y: pillY,
			w: pillW, h: pillH,
			fontSize: 7, fontFace: FONT, bold: true,
			color: WHITE, align: 'center', valign: 'middle',
			margin: 0,
		});

		// Value text next to pill
		if (value) {
			slide.addText(truncate(value, 60), {
				x: x + PAD + pillW + 0.08, y: pillY,
				w: w - PAD * 2 - pillW - 0.08, h: pillH,
				fontSize: 8, fontFace: FONT,
				color: DARK, valign: 'middle',
				margin: 0,
			});
		}

		pillY += spacing;
	}
}

/** Parse vision into FOR/WHO/THE/THAT/UNLIKE parts, falling back to simple display */
function parseVision(ip: InformationProduct): Record<string, string> {
	const result: Record<string, string> = {
		FOR: '',
		WHO: '',
		THE: ip.name || '',
		THAT: '',
		UNLIKE: '',
	};

	// Primary source: the visions[] items — each is a labelled line like
	// "FOR the Chief Revenue Officer," / "WHO needs to ...".
	for (const item of ip.visions || []) {
		const m = (item.name || '').match(/^\s*(FOR|WHO|THE|THAT|UNLIKE)\b\s*(.*)$/i);
		if (m) {
			const slot = m[1].toUpperCase();
			const value = m[2].replace(/,\s*$/, '').trim();
			if (value && !result[slot]) result[slot] = value;
		} else if (item.name && !result.THAT) {
			result.THAT = item.name.trim();
		}
	}
	if (result.FOR || result.WHO || result.THAT || result.UNLIKE) {
		if (!result.FOR && ip.personas.length > 0) {
			result.FOR = ip.personas.map((p) => p.name).join(', ');
		}
		return result;
	}

	// Legacy fallback: the deprecated single vision string.
	const vision = ip.vision || '';
	if (vision) {
		// Try to parse "For X, who Y, the Z that W, unlike U" pattern
		const forMatch = vision.match(/^for\s+(.+?)(?:,\s*who\s|$)/i);
		const whoMatch = vision.match(/who\s+(.+?)(?:,\s*the\s|$)/i);
		const theMatch = vision.match(/the\s+(.+?)(?:\s+that\s|$)/i);
		const thatMatch = vision.match(/that\s+(.+?)(?:,?\s*unlike\s|$)/i);
		const unlikeMatch = vision.match(/unlike\s+(.+?)$/i);

		if (forMatch || whoMatch || theMatch || thatMatch || unlikeMatch) {
			if (forMatch) result.FOR = forMatch[1].trim();
			if (whoMatch) result.WHO = whoMatch[1].trim();
			if (theMatch) result.THE = theMatch[1].trim();
			if (thatMatch) result.THAT = thatMatch[1].trim();
			if (unlikeMatch) result.UNLIKE = unlikeMatch[1].trim();
		} else {
			// Vision is a plain string — put it in THAT (key benefit)
			result.THAT = vision;
		}
	}

	// Fill in persona names for FOR
	if (!result.FOR && ip.personas.length > 0) {
		result.FOR = ip.personas.map((p) => p.name).join(', ');
	}

	return result;
}

/** Add the green header bar with IP Name, Product Owner, T-Shirt Size */
function addHeader(
	slide: PptxGenJS.Slide,
	ip: InformationProduct,
) {
	// Green header background
	slide.addShape('rect' as any, {
		x: 0, y: 0, w: SW, h: HEADER_H,
		fill: { color: GREEN },
	});

	// "Information Product Canvas" title
	slide.addText('Information Product Canvas', {
		x: 0.15, y: 0.1, w: 2.8, h: 0.4,
		fontSize: 14, fontFace: FONT, bold: true, italic: true,
		color: WHITE,
		margin: 0,
	});

	// "Information Product Name" label
	slide.addText('Information Product Name', {
		x: 3.1, y: 0.02, w: 3.5, h: 0.16,
		fontSize: 7, fontFace: FONT,
		color: WHITE,
		margin: 0,
	});
	// Name value field (white box)
	slide.addShape('rect' as any, {
		x: 3.1, y: 0.18, w: 3.5, h: 0.32,
		fill: { color: WHITE },
		rectRadius: 0.04,
	});
	slide.addText(truncate(ip.name, 50), {
		x: 3.2, y: 0.18, w: 3.3, h: 0.32,
		fontSize: 10, fontFace: FONT,
		color: DARK, valign: 'middle',
		margin: 0,
	});

	// "Product Owner" label + field
	slide.addText('Product Owner', {
		x: 6.8, y: 0.02, w: 2.0, h: 0.16,
		fontSize: 7, fontFace: FONT,
		color: WHITE,
		margin: 0,
	});
	slide.addShape('rect' as any, {
		x: 6.8, y: 0.18, w: 2.0, h: 0.32,
		fill: { color: WHITE },
		rectRadius: 0.04,
	});
	slide.addText(truncate(ip.productOwner, 30), {
		x: 6.9, y: 0.18, w: 1.8, h: 0.32,
		fontSize: 10, fontFace: FONT,
		color: DARK, valign: 'middle',
		margin: 0,
	});

	// "T-Shirt Size" label + field
	slide.addText('T-Shirt Size', {
		x: 9.0, y: 0.02, w: 0.85, h: 0.16,
		fontSize: 7, fontFace: FONT,
		color: WHITE,
		margin: 0,
	});
	slide.addShape('rect' as any, {
		x: 9.0, y: 0.18, w: 0.85, h: 0.32,
		fill: { color: WHITE },
		rectRadius: 0.04,
	});
	slide.addText(ip.tshirtSize || '', {
		x: 9.0, y: 0.18, w: 0.85, h: 0.32,
		fontSize: 10, fontFace: FONT, bold: true,
		color: DARK, align: 'center', valign: 'middle',
		margin: 0,
	});
}

/** Add the footer with CC BY-SA 4.0 and Agile Data Guides branding */
function addFooter(slide: PptxGenJS.Slide) {
	// Light gray footer background
	slide.addShape('rect' as any, {
		x: 0, y: FOOTER_Y, w: SW, h: FOOTER_H,
		fill: { color: LIGHT_BG },
		line: { color: BORDER, width: 0.5 },
	});

	// CC license text
	slide.addText('This work is licensed under CC BY-SA 4.0. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/', {
		x: 0.5, y: FOOTER_Y + 0.05, w: 6.5, h: 0.25,
		fontSize: 6, fontFace: FONT,
		color: GREEN,
		margin: 0,
	});

	// Agile Data Guides branding (right side)
	slide.addText('AGILE DATA GUIDES', {
		x: 7.5, y: FOOTER_Y + 0.02, w: 2.3, h: 0.3,
		fontSize: 10, fontFace: FONT, bold: true,
		color: DARK, align: 'right', valign: 'middle',
		margin: 0,
	});
}

function addTitleSlide(pres: PptxGenJS, model: IPCModel) {
	const slide = pres.addSlide();

	// Green background
	slide.addShape('rect' as any, {
		x: 0, y: 0, w: SW, h: SH,
		fill: { color: GREEN },
	});

	// White accent line
	slide.addShape('rect' as any, {
		x: 0.8, y: 2.0, w: 1.2, h: 0.05,
		fill: { color: WHITE },
	});

	// Title
	slide.addText('Information Product Canvas', {
		x: 0.8, y: 1.2, w: 8.4, h: 0.7,
		fontSize: 14, fontFace: FONT, bold: true, italic: true,
		color: WHITE,
		margin: 0,
	});

	// Model name
	slide.addText(model.name, {
		x: 0.8, y: 2.2, w: 8.4, h: 1.0,
		fontSize: 36, fontFace: FONT, bold: true,
		color: WHITE,
		margin: 0,
	});

	// Description
	slide.addText(model.description || '', {
		x: 0.8, y: 3.1, w: 8.4, h: 0.5,
		fontSize: 16, fontFace: FONT,
		color: WHITE,
		margin: 0,
	});

	// Stats
	const ipCount = model.informationProducts.length;
	slide.addText(`${ipCount} Information Product${ipCount !== 1 ? 's' : ''}`, {
		x: 0.8, y: 4.0, w: 4, h: 0.35,
		fontSize: 11, fontFace: FONT,
		color: WHITE,
		margin: 0,
	});

	// Footer
	addFooter(slide);
}

function addIpSlide(pres: PptxGenJS, ip: InformationProduct) {
	const slide = pres.addSlide();

	// ── Green header bar ──
	addHeader(slide, ip);

	// ── Canvas grid ──

	// Row 1: Outcomes/Actions | Vision (spans rows 1+2) | Personas | Delivery Types / Data Sync
	// Primary source is actionOutcomes[]; legacy bq.actionOutcome strings are
	// unioned in (deduped) for unmigrated input.
	const outcomeNames = ip.actionOutcomes.map((ao) => ao.name);
	const outcomeSeen = new Set(outcomeNames.map((n) => n.toLowerCase()));
	for (const bq of ip.businessQuestions) {
		if (bq.actionOutcome && !outcomeSeen.has(bq.actionOutcome.toLowerCase())) {
			outcomeNames.push(bq.actionOutcome);
			outcomeSeen.add(bq.actionOutcome.toLowerCase());
		}
	}
	addCell(slide, COL1_X, ROW1_Y, COL1_W, TOP_H,
		'Outcomes / Actions',
		outcomeNames
	);

	// Vision spans rows 1 + 2
	addVisionCell(slide, ip, COL2_X, ROW1_Y, COL2_W, TOP_H + MID_H);

	// Personas
	addCell(slide, COL3_X, ROW1_Y, COL3_W, TOP_H,
		'Personas',
		ip.personas.map((p) => p.name)
	);

	// Delivery Types (top of col4)
	addCell(slide, COL4_X, ROW1_Y, COL4_W, DELIVERY_H,
		'Delivery Types',
		ip.deliveryTypes.length > 0
			? ip.deliveryTypes.map((d) => d.name)
			: ip.deliveryType ? [ip.deliveryType] : []
	);

	// Data Sync (bottom of col4, top area)
	addCell(slide, COL4_X, ROW1_Y + DELIVERY_H, COL4_W, DATASYNC_H,
		'Data Sync',
		ip.dataSyncs.length > 0
			? ip.dataSyncs.map((d) => d.name)
			: ip.dataSync ? [ip.dataSync] : []
	);

	// Row 2: Business Questions | (Vision continues) | Core Business Events (spans cols 3+4)
	addCell(slide, COL1_X, ROW2_Y, COL1_W, MID_H,
		'Business Questions',
		ip.businessQuestions.map((bq) => bq.name)
	);

	// Core Business Events (cols 3+4 in row 2)
	addCell(slide, COL3_X, ROW2_Y, COL3_W + COL4_W, MID_H,
		'Core Business Events',
		ip.coreBusinessEvents.map((e) => e.name)
	);

	// Row 3: Feature Stories | Will / Won't
	const fsW = SW * 0.5;
	addCell(slide, 0, ROW3_Y, fsW, BOT_H,
		'Feature Stories',
		ip.featureStories.map((f) => f.name)
	);

	addCell(slide, fsW, ROW3_Y, SW - fsW, BOT_H,
		"Will / Won't",
		ip.willWont.map((w) => w.name)
	);

	// ── Footer ──
	addFooter(slide);
}

/**
 * Generate and download a PPTX from the IPC model.
 */
export async function exportIpcToPptx(model: IPCModel): Promise<void> {
	const pres = new PptxGenJS();
	pres.layout = 'LAYOUT_16x9';
	pres.author = 'Agile Data Guides';
	pres.title = model.name;
	pres.subject = 'Information Product Canvas';

	// Title slide
	addTitleSlide(pres, model);

	// One slide per Information Product
	const sorted = [...model.informationProducts].sort(
		(a, b) => ((a.order as number) || 0) - ((b.order as number) || 0)
	);
	for (const ip of sorted) {
		addIpSlide(pres, ip);
	}

	// Download
	const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
	const filename = `${model.id}-ipc-${timestamp}.pptx`;
	await pres.writeFile({ fileName: filename });
}
