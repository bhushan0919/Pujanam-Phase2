// src/components/astro/KundaliPDFExport.jsx
// Modern Clean Astrology PDF Export - Light Theme Edition

async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ========== TEXT ESCAPING UTILITY ==========
function escapePdfText(text) {
  if (!text) return '';
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&([^;]+);/g, (match, entity) => {
      const specialChars = { 'amp': '&', 'lt': '<', 'gt': '>', 'apos': "'", 'quot': '"' };
      return specialChars[entity] || match;
    })
    // Strip ALL non-printable-ASCII: emojis, devanagari, unicode symbols jsPDF cannot render
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

// ========== MODERN CLEAN COLOR SYSTEM ==========
const COLOR = {
  pageBg:      [250, 248, 245],
  surface:     [255, 255, 255],
  surfaceAlt:  [247, 245, 241],
  headerBg:    [ 42,  36,  74],
  accentBand:  [245, 241, 255],
  gold:        [180, 135,  60],
  goldLight:   [230, 195, 110],
  goldBg:      [255, 248, 225],
  indigo:      [ 62,  52, 120],
  indigoMid:   [ 90,  80, 160],
  indigoLight: [180, 170, 220],
  purple:      [130,  90, 180],
  teal:        [ 30, 150, 140],
  success:     [ 34, 140,  90],
  successBg:   [220, 245, 232],
  danger:      [200,  55,  65],
  dangerBg:    [255, 225, 228],
  warning:     [180, 120,  30],
  warningBg:   [255, 245, 215],
  textDark:    [ 25,  22,  45],
  textBody:    [ 60,  55,  80],
  textSub:     [100,  95, 120],
  textMuted:   [155, 150, 170],
  textOnDark:  [255, 255, 255],
  Sun:         [200, 130,  30],
  Moon:        [ 80, 100, 180],
  Mercury:     [ 40, 160, 100],
  Venus:       [180,  70, 130],
  Mars:        [200,  50,  50],
  Jupiter:     [160, 120,  30],
  Saturn:      [ 60,  90, 160],
  Rahu:        [100,  80, 140],
  Ketu:        [120, 100,  80],
};

const PLANET_ABBR = {
  Sun: 'Su', Moon: 'Mo', Mercury: 'Me', Venus: 'Ve', Mars: 'Ma',
  Jupiter: 'Ju', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke'
};

const RASHI = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_ENG = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// ========== DRAWING HELPERS ==========
const setColor  = (doc, [r, g, b]) => doc.setTextColor(r, g, b);
const fill      = (doc, [r, g, b]) => doc.setFillColor(r, g, b);
const stroke    = (doc, [r, g, b]) => doc.setDrawColor(r, g, b);

const bold = (doc, size, color = COLOR.textDark) => {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(size); setColor(doc, color);
};
const regular = (doc, size, color = COLOR.textBody) => {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(size); setColor(doc, color);
};
const light = (doc, size, color = COLOR.textSub) => {
  doc.setFont('helvetica', 'normal'); doc.setFontSize(size); setColor(doc, color);
};
const italic = (doc, size, color = COLOR.textSub) => {
  doc.setFont('helvetica', 'italic'); doc.setFontSize(size); setColor(doc, color);
};

const roundedRect = (doc, x, y, w, h, r = 4, style = 'F') =>
  doc.roundedRect(x, y, w, h, r, r, style);

const hairline = (doc, x, y, w, color = COLOR.indigoLight) => {
  stroke(doc, color); doc.setLineWidth(0.3); doc.line(x, y, x + w, y);
};

const accentStripe = (doc, x, y, h, color = COLOR.gold) => {
  fill(doc, color); doc.rect(x, y, 2.5, h, 'F');
};

const card = (doc, x, y, w, h, bgColor = COLOR.surface, radius = 4) => {
  fill(doc, [210, 205, 220]);
  roundedRect(doc, x + 0.6, y + 0.6, w, h, radius);
  fill(doc, bgColor);
  roundedRect(doc, x, y, w, h, radius);
};

const badge = (doc, text, x, y, bg, textColor) => {
  const w = doc.getTextWidth(text) + 8;
  fill(doc, bg);
  roundedRect(doc, x, y - 3.2, w, 5.5, 2.5);
  bold(doc, 6, textColor);
  doc.text(escapePdfText(text), x + 4, y);
  return w + 3;
};

// ========== PDF BUILDER ==========
class PDFBuilder {
  constructor(doc, margin = 13) {
    this.doc = doc;
    this.margin = margin;
    this.pageW = 210;
    this.pageH = 297;
    this.contentW = this.pageW - margin * 2;
    this.y = margin;
    this.page = 1;
  }

  paintBg() {
    fill(this.doc, COLOR.pageBg);
    this.doc.rect(0, 0, this.pageW, this.pageH, 'F');
    fill(this.doc, COLOR.headerBg);
    this.doc.rect(0, 0, this.pageW, 4, 'F');
    fill(this.doc, COLOR.gold);
    this.doc.rect(0, 4, this.pageW, 1.2, 'F');
    fill(this.doc, COLOR.headerBg);
    this.doc.rect(0, this.pageH - 4, this.pageW, 4, 'F');
    fill(this.doc, COLOR.gold);
    this.doc.rect(0, this.pageH - 5.2, this.pageW, 1.2, 'F');
  }

  footer(name) {
    light(this.doc, 6.5, COLOR.textMuted);
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const footerText = `${escapePdfText(name)}'s Kundali  |  Vedic Astrology by Pujanam  |  ${date}  |  Page ${this.page}`;
    this.doc.text(footerText, this.pageW / 2, this.pageH - 8, { align: 'center' });
    hairline(this.doc, this.margin, this.pageH - 10.5, this.contentW, COLOR.indigoLight);
  }

  need(h, name) {
    if (this.y + h > this.pageH - 22) {
      this.footer(name);
      this.doc.addPage();
      this.page++;
      this.paintBg();
      this.y = this.margin + 8;
    }
  }

  gap(h = 6) { this.y += h; }

  sectionTitle(text) {
    fill(this.doc, COLOR.headerBg);
    roundedRect(this.doc, this.margin, this.y, this.contentW, 10, 3);
    fill(this.doc, COLOR.gold);
    this.doc.rect(this.margin, this.y, 3, 10, 'F');
    bold(this.doc, 9.5, COLOR.textOnDark);
    this.doc.text(escapePdfText(text).toUpperCase(), this.margin + 9, this.y + 7);
    this.y += 15;
  }

  luxuryCard(x, y, w, h) {
    card(this.doc, x, y, w, h);
  }
}

// ========== KUNDALI CHART ==========
function drawKundaliChart(builder, kundali) {
  const { doc, margin } = builder;
  const size = Math.min(builder.contentW, 148);
  const cell = size / 4;
  const ox = (builder.pageW - size) / 2;
  const oy = builder.y;

  const lagnaIdx = RASHI.indexOf(kundali.lagna);
  const signForHouse = h => RASHI_ENG[(lagnaIdx + h - 1) % 12];

  const positions = [
    { house: 12, r: 0, c: 0 }, { house: 1,  r: 0, c: 1 },
    { house: 2,  r: 0, c: 2 }, { house: 3,  r: 0, c: 3 },
    { house: 11, r: 1, c: 0 }, { house: 4,  r: 1, c: 3 },
    { house: 10, r: 2, c: 0 }, { house: 5,  r: 2, c: 3 },
    { house: 9,  r: 3, c: 0 }, { house: 8,  r: 3, c: 1 },
    { house: 7,  r: 3, c: 2 }, { house: 6,  r: 3, c: 3 },
  ];

  fill(doc, COLOR.surface);
  doc.rect(ox, oy, size, size, 'F');
  stroke(doc, COLOR.indigo);
  doc.setLineWidth(0.8);
  doc.rect(ox, oy, size, size);

  stroke(doc, COLOR.indigoLight);
  doc.setLineWidth(0.35);
  for (let i = 1; i < 4; i++) {
    doc.line(ox + cell * i, oy, ox + cell * i, oy + size);
    doc.line(ox, oy + cell * i, ox + size, oy + cell * i);
  }

  stroke(doc, COLOR.indigoLight);
  doc.setLineWidth(0.2);
  doc.line(ox + cell, oy + cell, ox + cell * 2, oy + cell * 2);
  doc.line(ox + cell * 2, oy + cell, ox + cell, oy + cell * 2);
  doc.line(ox + cell * 2, oy + cell * 2, ox + cell * 3, oy + cell);
  doc.line(ox + cell * 2, oy + cell * 2, ox + cell * 3, oy + cell * 3);

  fill(doc, COLOR.accentBand);
  doc.rect(ox + cell, oy + cell, cell * 2, cell * 2, 'F');
  stroke(doc, COLOR.indigoMid);
  doc.setLineWidth(0.4);
  const cx = ox + cell * 2;
  const cy = oy + cell * 2;
  doc.circle(cx, cy, 11, 'S');
  doc.circle(cx, cy, 7, 'S');
  bold(doc, 7.5, COLOR.indigo);
  doc.text("KUNDALI", cx, cy - 1, { align: 'center' });
  light(doc, 6, COLOR.indigoMid);
  doc.text("North Indian", cx, cy + 5, { align: 'center' });

  positions.forEach(({ house, r, c }) => {
    const hx = ox + c * cell;
    const hy = oy + r * cell;
    const planets = (kundali.houses[house] || []).filter(p => p !== 'Lagna');

    if (house === 1) {
      fill(doc, COLOR.goldBg);
      doc.rect(hx, hy, cell, cell, 'F');
      stroke(doc, COLOR.gold);
      doc.setLineWidth(0.6);
      doc.rect(hx, hy, cell, cell);
    }

    bold(doc, 7.5, house === 1 ? COLOR.gold : COLOR.indigoLight);
    doc.text(String(house), hx + 3, hy + 6);
    if (house === 1) {
      light(doc, 5.5, COLOR.gold);
      doc.text("ASC", hx + 9, hy + 6);
    }

    light(doc, 5, COLOR.textMuted);
    doc.text(escapePdfText(signForHouse(house)), hx + 3, hy + 10.5);

    let py = hy + 16;
    planets.forEach(p => {
      const planetColor = COLOR[p] || COLOR.textBody;
      bold(doc, 7, planetColor);
      const abbr = PLANET_ABBR[p] || p.slice(0, 2);
      doc.text(`${abbr} ${escapePdfText(p)}`, hx + 3, py);
      py += 5.5;
    });
  });

  builder.y += size + 10;
}

// ========== COVER PAGE ==========
function drawCover(builder, name, kundali) {
  const { doc, margin, pageW } = builder;
  builder.paintBg();

  fill(doc, COLOR.headerBg);
  doc.rect(0, 10, pageW, 70, 'F');
  fill(doc, COLOR.gold);
  doc.rect(0, 75, pageW, 1.5, 'F');

  // Geometric mandala (pure circles + lines, no emoji)
  stroke(doc, [90, 80, 140]);
  doc.setLineWidth(0.5);
  doc.circle(pageW / 2, 45, 28, 'S');
  stroke(doc, COLOR.goldLight);
  doc.setLineWidth(0.8);
  doc.circle(pageW / 2, 45, 22, 'S');
  stroke(doc, [80, 70, 130]);
  doc.setLineWidth(0.3);
  doc.circle(pageW / 2, 45, 15, 'S');
  stroke(doc, COLOR.goldLight);
  doc.setLineWidth(0.4);
  doc.line(pageW / 2, 20, pageW / 2, 70);
  doc.line(pageW / 2 - 28, 45, pageW / 2 + 28, 45);
  fill(doc, COLOR.gold);
  doc.circle(pageW / 2, 45, 2.5, 'F');

  bold(doc, 8, COLOR.goldLight);
  doc.text("VEDIC BIRTH CHART ANALYSIS", pageW / 2 + 28, 38, { align: "center" });
  light(doc, 6.5, [170, 160, 200]);
  doc.text("Sidereal  |  Lahiri Ayanamsa  |  North Indian Style", pageW / 2 + 28, 46, { align: "center" });

  // Name card
  fill(doc, COLOR.surface);
  roundedRect(doc, margin, 85, builder.contentW, 38, 5);
  accentStripe(doc, margin, 85, 38, COLOR.gold);
  bold(doc, 22, COLOR.indigo);
  doc.text(escapePdfText(name), margin + 12, 103);
  bold(doc, 11, COLOR.gold);
  doc.text("KUNDALI", margin + 12, 114);
  light(doc, 8.5, COLOR.textSub);
  doc.text(`${escapePdfText(kundali.lagna)} (${escapePdfText(kundali.lagnaEnglish)})`, pageW - margin - 8, 103, { align: "right" });
  light(doc, 7, COLOR.textMuted);
  doc.text(escapePdfText(`${kundali.lagnaNakshatra} Nakshatra  |  Pada ${kundali.lagnaPada}`), pageW - margin - 8, 111, { align: "right" });

  // Stats grid (2 rows x 3 cols)
  const statW = (builder.contentW - 15) / 3;
  const stats = [
    ['Moon Sign',  escapePdfText(kundali.planets?.find(p => p.name === 'Moon')?.sign || '-')],
    ['Sun Sign',   escapePdfText(kundali.planets?.find(p => p.name === 'Sun')?.sign || '-')],
    ['Nakshatra',  escapePdfText(kundali.nakshatra || '-')],
    ['Mahadasha',  escapePdfText(kundali.mahadasha || '-')],
    ['Tithi',      escapePdfText(kundali.tithi_name || '-')],
    ['Ayanamsa',   `${kundali.ayanamsa} deg`],
  ];

  let sx = margin, sy = 132;
  stats.forEach(([label, val], i) => {
    if (i === 3) { sx = margin; sy += 30; }
    card(doc, sx, sy, statW, 26);
    accentStripe(doc, sx, sy, 26, i < 3 ? COLOR.indigo : COLOR.purple);
    light(doc, 6.5, COLOR.textMuted);
    doc.text(escapePdfText(label.toUpperCase()), sx + 8, sy + 9);
    bold(doc, 10, COLOR.textDark);
    doc.text(val, sx + 8, sy + 20);
    sx += statW + 7.5;
  });

  // Tagline
  const qy = 198;
  fill(doc, COLOR.accentBand);
  roundedRect(doc, margin, qy, builder.contentW, 14, 4);
  hairline(doc, margin, qy, builder.contentW, COLOR.gold);
  italic(doc, 7.5, COLOR.indigoMid);
  doc.text("The stars incline, they do not bind. May this chart illuminate your path.", pageW / 2, qy + 9, { align: "center" });

  builder.footer(name);
}

// ========== PLANETS ==========
function drawPlanets(builder, kundali, name) {
  const { doc, margin, contentW } = builder;
  builder.y = margin + 6;
  builder.sectionTitle("Planetary Positions");

  const cols = [0, 28, 68, 98, 122, 158];
  fill(doc, COLOR.accentBand);
  doc.rect(margin, builder.y, contentW, 8, 'F');
  light(doc, 6.5, COLOR.indigo);
  ["Planet", "Sign / Nakshatra", "Degree", "House", "Strength", "Notes"].forEach((h, i) => {
    doc.text(h, margin + cols[i] + 2, builder.y + 5.5);
  });
  builder.y += 11;

  (kundali.planets || []).forEach((p, idx) => {
    builder.need(12, name);
    const bg = idx % 2 === 0 ? COLOR.surface : COLOR.surfaceAlt;
    fill(doc, bg);
    doc.rect(margin, builder.y - 2, contentW, 12, 'F');

    const pColor = COLOR[p.name] || COLOR.textBody;
    fill(doc, pColor);
    doc.rect(margin, builder.y - 2, 2.5, 12, 'F');

    bold(doc, 8, pColor);
    doc.text(`${PLANET_ABBR[p.name] || ''}  ${escapePdfText(p.name)}`, margin + cols[0] + 5, builder.y + 5.5);

    regular(doc, 7.5, COLOR.textBody);
    doc.text(escapePdfText(p.sign), margin + cols[1] + 2, builder.y + 4);
    light(doc, 6, COLOR.textMuted);
    doc.text(`${escapePdfText(p.nakshatra)} P${p.pada}`, margin + cols[1] + 2, builder.y + 9);

    regular(doc, 7.5, COLOR.gold);
    doc.text(escapePdfText(p.degreeDMS), margin + cols[2] + 2, builder.y + 5.5);

    bold(doc, 10.5, COLOR.indigo);
    doc.text(String(p.house), margin + cols[3] + 6, builder.y + 5.5);

    const strengthColors = { Exalted: COLOR.success, "Own Sign": COLOR.indigo, Neutral: COLOR.textMuted, Debilitated: COLOR.danger };
    const strBg = { Exalted: COLOR.successBg, "Own Sign": COLOR.accentBand, Neutral: [240,240,245], Debilitated: COLOR.dangerBg };
    if (p.strength) {
      fill(doc, strBg[p.strength] || [240,240,245]);
      roundedRect(doc, margin + cols[4] + 1, builder.y + 0.5, 36, 7, 2);
      bold(doc, 6.5, strengthColors[p.strength] || COLOR.textMuted);
      doc.text(escapePdfText(p.strength), margin + cols[4] + 3, builder.y + 5.5);
    }

    const notes = [p.retrograde && 'R', p.combust && 'C'].filter(Boolean).join(' ');
    if (notes) {
      fill(doc, COLOR.warningBg);
      roundedRect(doc, margin + cols[5] + 1, builder.y + 0.5, 14, 7, 2);
      bold(doc, 7, COLOR.warning);
      doc.text(notes, margin + cols[5] + 3, builder.y + 5.5);
    }

    builder.y += 13;
  });
}

// ========== PANCHANG ==========
function drawPanchang(builder, kundali, name) {
  const { doc, margin, contentW } = builder;
  builder.sectionTitle("Panchang");

  const items = [
    ["Tithi",     escapePdfText(`${kundali.tithi_name} (${kundali.tithi_number})`)],
    ["Paksha",    escapePdfText(kundali.paksha)],
    ["Nakshatra", escapePdfText(`${kundali.nakshatra} P${kundali.nakshatra_pada}`)],
    ["Yoga",      escapePdfText(kundali.yoga_name)],
    ["Karana",    escapePdfText(kundali.karana_name)],
    ["Ayanamsa",  `${kundali.ayanamsa} deg`],
  ];

  const colW = (contentW - 10) / 3;
  items.forEach(([label, val], idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cx = margin + col * (colW + 5);
    const cy = builder.y + row * 24;
    card(doc, cx, cy, colW, 20);
    accentStripe(doc, cx, cy, 20, COLOR.teal);
    light(doc, 6.5, COLOR.textMuted);
    doc.text(escapePdfText(label.toUpperCase()), cx + 8, cy + 8);
    bold(doc, 9, COLOR.textDark);
    doc.text(val, cx + 8, cy + 16);
  });

  builder.y += Math.ceil(items.length / 3) * 24 + 8;
}

// ========== DASHA ==========
function drawDasha(builder, kundali, name) {
  const { doc, margin, contentW } = builder;
  builder.sectionTitle("Vimshottari Dasha");

  builder.need(28, name);
  card(doc, margin, builder.y, contentW, 24, COLOR.accentBand);
  accentStripe(doc, margin, builder.y, 24, COLOR.purple);
  bold(doc, 8.5, COLOR.textSub);
  doc.text("Current Mahadasha", margin + 9, builder.y + 9);
  bold(doc, 14, COLOR.indigo);
  doc.text(escapePdfText(kundali.mahadasha), margin + 9, builder.y + 19);
  light(doc, 7.5, COLOR.textSub);
  doc.text(`Balance: ${escapePdfText(kundali.dasha_balance)}`, margin + contentW - 8, builder.y + 19, { align: "right" });
  builder.y += 30;

  if (kundali.antardasha_list && kundali.antardasha_list.length) {
    bold(doc, 7.5, COLOR.indigo);
    doc.text("Antardasha Sequence", margin, builder.y);
    builder.y += 7;

    kundali.antardasha_list.forEach((ad, i) => {
      builder.need(11, name);
      fill(doc, i % 2 === 0 ? COLOR.surface : COLOR.surfaceAlt);
      doc.rect(margin, builder.y, contentW, 10, 'F');
      fill(doc, COLOR.indigoMid);
      doc.circle(margin + 5, builder.y + 5, 1.2, 'F');
      regular(doc, 8, COLOR.textBody);
      doc.text(escapePdfText(ad.lord), margin + 11, builder.y + 7);
      light(doc, 7.5, COLOR.gold);
      doc.text(`${ad.years} yrs`, margin + contentW - 8, builder.y + 7, { align: "right" });
      builder.y += 11;
    });
  }
  builder.gap(6);
}

// ========== SCORES ==========
function drawScores(builder, kundali, name) {
  const { doc, margin, contentW } = builder;
  builder.sectionTitle("Strength Scores");

  Object.entries(kundali.scores || {}).forEach(([key, val]) => {
    builder.need(16, name);
    const label = key.replace(/_/g, " ").replace("score", "").trim();
    const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);
    const barW = contentW - 90;
    const barColor = val >= 70 ? COLOR.success : val >= 40 ? COLOR.gold : COLOR.danger;
    const bgColor  = val >= 70 ? COLOR.successBg : val >= 40 ? COLOR.goldBg : COLOR.dangerBg;

    card(doc, margin, builder.y, contentW, 13, bgColor);
    accentStripe(doc, margin, builder.y, 13, barColor);
    bold(doc, 8, COLOR.textDark);
    doc.text(escapePdfText(displayLabel), margin + 9, builder.y + 9);
    bold(doc, 9, barColor);
    doc.text(`${val}%`, margin + 64, builder.y + 9);
    fill(doc, [225, 222, 235]);
    roundedRect(doc, margin + 80, builder.y + 4.5, barW, 4, 2);
    fill(doc, barColor);
    roundedRect(doc, margin + 80, builder.y + 4.5, Math.max(0, barW * val / 100), 4, 2);

    const filled = Math.round((val / 100) * 5);
    for (let i = 0; i < 5; i++) {
      bold(doc, 8, i < filled ? COLOR.gold : [210, 207, 220]);
      doc.text("*", margin + contentW - 22 + i * 4.5, builder.y + 9);
    }
    builder.y += 16;
  });

  builder.gap(4);
  italic(doc, 6.5, COLOR.textMuted);
  const note = "Scores calculated using classical Vedic principles based on planetary positions, house placements, exaltation/debilitation, and aspect interactions.";
  builder.doc.splitTextToSize(note, builder.contentW).forEach(l => {
    builder.doc.text(l, builder.pageW / 2, builder.y, { align: "center" }); builder.y += 4.5;
  });
  builder.gap(4);
}

// ========== YOGAS ==========
function drawYogas(builder, kundali, name) {
  const { doc, margin, contentW } = builder;
  builder.sectionTitle("Yogas");

  [...(kundali.yogas || [])].sort((a, b) => Number(b.present) - Number(a.present)).forEach(y => {
    const lines = doc.splitTextToSize(escapePdfText(y.description), contentW - 22);
    const h = 20 + lines.length * 4.5;
    builder.need(h + 5, name);

    card(doc, margin, builder.y, contentW, h, y.present ? COLOR.successBg : COLOR.surfaceAlt);
    accentStripe(doc, margin, builder.y, h, y.present ? COLOR.success : COLOR.textMuted);
    bold(doc, 9, y.present ? COLOR.success : COLOR.textSub);
    doc.text(escapePdfText(y.name), margin + 9, builder.y + 10);
    badge(doc,
      y.present ? "ACTIVE" : "INACTIVE",
      margin + contentW - (y.present ? 28 : 30), builder.y + 9.5,
      y.present ? COLOR.successBg : [220, 215, 230],
      y.present ? COLOR.success : COLOR.textSub
    );
    light(doc, 7, COLOR.textBody);
    let ry = builder.y + 17;
    lines.forEach(line => { doc.text(line, margin + 9, ry); ry += 4.5; });
    builder.y += h + 6;
  });
}

// ========== DOSHAS ==========
function drawDoshas(builder, kundali, name) {
  const { doc, margin, contentW } = builder;
  builder.sectionTitle("Doshas");

  (kundali.doshas || []).forEach(d => {
    const descLines = doc.splitTextToSize(escapePdfText(d.description), contentW - 22);
    const remedies  = (d.remedies || []).map(r => escapePdfText(r)).slice(0, 3);
    const h = 20 + descLines.length * 4.5 + (d.present && remedies.length ? remedies.length * 4.5 + 10 : 0);
    builder.need(h + 5, name);

    card(doc, margin, builder.y, contentW, h, d.present ? COLOR.dangerBg : COLOR.successBg);
    accentStripe(doc, margin, builder.y, h, d.present ? COLOR.danger : COLOR.success);
    bold(doc, 9, d.present ? COLOR.danger : COLOR.success);
    doc.text(escapePdfText(d.name), margin + 9, builder.y + 10);

    if (d.present && d.severity) {
      badge(doc, d.severity.toUpperCase(), margin + contentW - 34, builder.y + 9.5,
        d.severity === "High" ? COLOR.dangerBg : COLOR.warningBg,
        d.severity === "High" ? COLOR.danger : COLOR.warning);
    } else if (!d.present) {
      badge(doc, "CLEAR", margin + contentW - 26, builder.y + 9.5, COLOR.successBg, COLOR.success);
    }

    light(doc, 7, COLOR.textBody);
    let ry = builder.y + 17;
    descLines.forEach(line => { doc.text(line, margin + 9, ry); ry += 4.5; });

    if (d.present && remedies.length) {
      bold(doc, 7, COLOR.gold);
      doc.text("Remedies:", margin + 9, ry + 4);
      ry += 9;
      light(doc, 6.5, COLOR.textBody);
      remedies.forEach(rem => { doc.text(`- ${rem}`, margin + 14, ry); ry += 4.5; });
    }
    builder.y += h + 6;
  });
}

// ========== MARRIAGE YOGA ==========
function drawMarriage(builder, kundali, name) {
  const my = kundali.marriage_yoga;
  if (!my) return;
  const { doc, margin, contentW } = builder;
  builder.sectionTitle("Marriage Yoga");

  const statW = (contentW - 10) / 3;
  [
    ["Status",   my.present ? "Active" : "Inactive", my.present ? COLOR.success : COLOR.danger,  my.present ? COLOR.successBg : COLOR.dangerBg],
    ["Strength", escapePdfText(my.strength || "-"),   COLOR.gold,   COLOR.goldBg],
    ["Score",    `${my.score || 0} / 100`,            COLOR.indigo, COLOR.accentBand],
  ].forEach(([label, val, col, bg], i) => {
    const cx = margin + i * (statW + 5);
    card(doc, cx, builder.y, statW, 22, bg);
    accentStripe(doc, cx, builder.y, 22, col);
    light(doc, 6.5, COLOR.textMuted);
    doc.text(label.toUpperCase(), cx + statW / 2 + 1, builder.y + 8, { align: "center" });
    bold(doc, 10.5, col);
    doc.text(val, cx + statW / 2 + 1, builder.y + 17, { align: "center" });
  });
  builder.y += 28;

  if (my.marriage_type) {
    card(doc, margin, builder.y, contentW, 16, COLOR.accentBand);
    accentStripe(doc, margin, builder.y, 16, COLOR.purple);
    light(doc, 7, COLOR.textMuted);
    doc.text("MARRIAGE TYPE", margin + 9, builder.y + 7);
    bold(doc, 9.5, COLOR.purple);
    doc.text(escapePdfText(my.marriage_type), margin + 9, builder.y + 14);
    builder.y += 22;
  }

  if (my.reasons && my.reasons.length) {
    bold(doc, 8.5, COLOR.success);
    doc.text("Auspicious Indicators", margin, builder.y);
    builder.y += 7;
    my.reasons.forEach(r => {
      builder.need(7, name);
      fill(doc, COLOR.successBg);
      roundedRect(doc, margin, builder.y - 2, contentW, 6, 2);
      light(doc, 7, COLOR.success);
      doc.text(`- ${escapePdfText(r)}`, margin + 6, builder.y + 2.5);
      builder.y += 7;
    });
    builder.gap(4);
  }

  if (my.favorable_periods && my.favorable_periods.length) {
    bold(doc, 8.5, COLOR.gold);
    doc.text("Favorable Periods", margin, builder.y);
    builder.y += 7;
    my.favorable_periods.forEach(fp => {
      builder.need(14, name);
      card(doc, margin, builder.y, contentW, 13, COLOR.goldBg);
      accentStripe(doc, margin, builder.y, 13, COLOR.gold);
      bold(doc, 8.5, COLOR.textDark);
      doc.text(escapePdfText(fp.period), margin + 9, builder.y + 9);
      if (fp.isRunning) badge(doc, "ACTIVE NOW", margin + 82, builder.y + 8.5, COLOR.successBg, COLOR.success);
      builder.y += 16;
    });
    builder.gap(4);
  }

  if (my.delay_indications && my.delay_indications.length) {
    bold(doc, 8.5, COLOR.warning);
    doc.text("Delay Considerations", margin, builder.y);
    builder.y += 7;
    my.delay_indications.forEach(d => {
      builder.need(7, name);
      fill(doc, COLOR.warningBg);
      roundedRect(doc, margin, builder.y - 2, contentW, 6, 2);
      light(doc, 7, COLOR.warning);
      doc.text(`- ${escapePdfText(d)}`, margin + 6, builder.y + 2.5);
      builder.y += 7;
    });
  }
  builder.gap(6);
}

// ========== CHART PAGE ==========
function drawChartPage(builder, kundali, name) {
  builder.y = builder.margin + 6;
  builder.sectionTitle("Birth Chart");
  builder.gap(4);
  drawKundaliChart(builder, kundali);
  light(builder.doc, 6.5, COLOR.textMuted);
  builder.doc.text("North Indian Style  |  Lahiri Ayanamsa  |  Sidereal", builder.pageW / 2, builder.y, { align: "center" });
  builder.gap(8);
  builder.footer(name);
}

// ========== MAIN EXPORT ==========
export async function downloadKundaliPDF(name, kundali) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const b = new PDFBuilder(doc, 13);
  const safeName = escapePdfText(name);

  drawCover(b, safeName, kundali);

  doc.addPage(); b.page++; b.paintBg();
  drawChartPage(b, kundali, safeName);

  doc.addPage(); b.page++; b.paintBg();
  b.y = b.margin + 6;
  drawPlanets(b, kundali, safeName);
  b.gap(12);
  drawPanchang(b, kundali, safeName);
  b.footer(safeName);

  doc.addPage(); b.page++; b.paintBg();
  b.y = b.margin + 6;
  drawDasha(b, kundali, safeName);
  b.gap(10);
  drawScores(b, kundali, safeName);
  b.footer(safeName);

  if (kundali.yogas && kundali.yogas.length) {
    doc.addPage(); b.page++; b.paintBg();
    b.y = b.margin + 6;
    drawYogas(b, kundali, safeName);
    b.footer(safeName);
  }

  if (kundali.doshas && kundali.doshas.length) {
    doc.addPage(); b.page++; b.paintBg();
    b.y = b.margin + 6;
    drawDoshas(b, kundali, safeName);
    b.footer(safeName);
  }

  if (kundali.marriage_yoga) {
    doc.addPage(); b.page++; b.paintBg();
    b.y = b.margin + 6;
    drawMarriage(b, kundali, safeName);
    b.footer(safeName);
  }

  doc.save(`${safeName.replace(/[^a-z0-9]/gi, '_')}_Kundali.pdf`);
}
