const RASHI_NAMES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrischika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const SIGN_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon',
  'Sun', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

const BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const MALEFICS = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

const DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10,
  Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

/**
 * Build a flat timeline of all mahadasha + antardasha periods
 * starting from birthYear with the first dasha having `balanceYears` remaining.
 * Returns array of { mahadasha, antardasha, startYear, endYear (fractional) }
 */
function buildDashaTimeline(birthYear, firstDasha, balanceYears) {
  const timeline = [];

  // Find where in the dasha sequence the birth dasha sits
  const firstIdx = DASHA_SEQUENCE.indexOf(firstDasha);
  const currentYear = new Date().getFullYear();
  const lookAheadYears = 15; // show periods up to 15 years ahead

  let cursor = birthYear; // fractional year cursor

  // The first mahadasha has only `balanceYears` remaining (already partially elapsed)
  for (let i = 0; i < 9; i++) {
    const mdLord = DASHA_SEQUENCE[(firstIdx + i) % 9];
    const mdYears = i === 0 ? balanceYears : DASHA_YEARS[mdLord];
    const mdStart = cursor;
    const mdEnd = cursor + mdYears;

    // Stop building if we are way past the look-ahead window
    if (mdStart > currentYear + lookAheadYears) break;

    // Antardasha within this mahadasha
    // Sub-period sequence starts from mdLord itself
    const adStartIdx = DASHA_SEQUENCE.indexOf(mdLord);
    let adCursor = mdStart;

    for (let j = 0; j < 9; j++) {
      const adLord = DASHA_SEQUENCE[(adStartIdx + j) % 9];
      // Proportional antardasha duration
      const adYears = parseFloat(((mdYears * DASHA_YEARS[adLord]) / 120).toFixed(4));
      const adStart = adCursor;
      const adEnd = adCursor + adYears;

      timeline.push({
        mahadasha: mdLord,
        antardasha: adLord,
        startYear: parseFloat(adStart.toFixed(2)),
        endYear: parseFloat(adEnd.toFixed(2)),
      });

      adCursor = adEnd;
      if (adCursor > currentYear + lookAheadYears) break;
    }

    cursor = mdEnd;
  }

  return timeline;
}

/**
 * From the timeline, find upcoming favorable marriage periods
 * (Venus/Jupiter/7thLord mahadasha or antardasha, within next 10 years)
 */
function getFavorablePeriods(timeline, marriagePlanets) {
  const now = new Date();
  const currentFractionalYear = now.getFullYear() + (now.getMonth() / 12);
  const cutoff = currentFractionalYear + 10;

  const favorable = [];

  for (const period of timeline) {
    // Only future or currently running periods
    if (period.endYear < currentFractionalYear) continue;
    if (period.startYear > cutoff) break;

    const isMahaFav = marriagePlanets.includes(period.mahadasha);
    const isAntarFav = marriagePlanets.includes(period.antardasha);

    if (isMahaFav || isAntarFav) {
      const startYr = Math.max(period.startYear, currentFractionalYear);
      const label = `${period.mahadasha} MD / ${period.antardasha} AD`;
      const approxStart = Math.floor(startYr);
      const approxEnd = Math.ceil(period.endYear);

      let reason = '';
      if (isMahaFav && isAntarFav) {
        reason = `Both ${period.mahadasha} Mahadasha and ${period.antardasha} Antardasha are marriage-significant planets — very strong period`;
      } else if (isMahaFav) {
        reason = `${period.mahadasha} Mahadasha supports marriage`;
      } else {
        reason = `${period.antardasha} Antardasha within ${period.mahadasha} Mahadasha is favorable for marriage`;
      }

      favorable.push({
        period: label,
        years: `${approxStart}–${approxEnd}`,
        reason,
        isRunning: period.startYear <= currentFractionalYear && period.endYear >= currentFractionalYear,
      });
    }
  }

  return favorable;
}

function calcMarriageYoga({
  planets,
  houses,
  lagnaIdx,
  mahadasha,
  antardasha_list,
  birthYear,       // NEW: passed in from buildKundali (the year of birth)
  dashaBalance,    // NEW: balance years remaining in current mahadasha at birth
}) {
  const getPlanet = (name) => planets.find(p => p.name === name);

  // ─── 7th House analysis ────────────────────────────────────────────────────
  const seventhSignIdx = (lagnaIdx + 6) % 12;
  const seventhLord = SIGN_LORDS[seventhSignIdx];
  const seventhLordPlanet = getPlanet(seventhLord);
  const planetsIn7th = (houses[7] || []).filter(p => p !== 'Lagna');

  const venus = getPlanet('Venus');
  const jupiter = getPlanet('Jupiter');

  // ─── Score calculation (realistic baseline) ────────────────────────────────
  // Start at 45 — most charts will have at least Average potential
  let score = 45;
  const reasons = [];

  // 7th lord strength
  if (seventhLordPlanet?.strength === 'Exalted') {
    score += 20;
    reasons.push(`${seventhLord} (7th lord) is exalted — very strong marriage indicator`);
  } else if (seventhLordPlanet?.strength === 'Own Sign') {
    score += 15;
    reasons.push(`${seventhLord} (7th lord) is in own sign`);
  }

  // 7th lord placement — kendra or trikona is positive
  if (seventhLordPlanet) {
    const h = seventhLordPlanet.house;
    if ([1, 4, 7, 10].includes(h)) {
      score += 10;
      reasons.push(`${seventhLord} (7th lord) placed in kendra house ${h}`);
    } else if ([5, 9].includes(h)) {
      score += 8;
      reasons.push(`${seventhLord} (7th lord) placed in trikona house ${h}`);
    } else if ([2, 11].includes(h)) {
      score += 5;
      reasons.push(`${seventhLord} (7th lord) in house ${h} — supportive for relationships`);
    } else if ([6, 8, 12].includes(h)) {
      score -= 8;
      reasons.push(`${seventhLord} (7th lord) in dusthana house ${h} — some challenges in marriage`);
    }
  }

  // Venus strength
  if (venus?.strength === 'Exalted') {
    score += 15;
    reasons.push('Venus is exalted — excellent for marriage and relationships');
  } else if (venus?.strength === 'Own Sign') {
    score += 10;
    reasons.push('Venus is in own sign — positive for love and marriage');
  }

  // Venus house placement
  if (venus) {
    const vh = venus.house;
    if ([5, 7].includes(vh)) {
      score += 12;
      reasons.push(`Venus in house ${vh} — strong romantic and marriage energy`);
    } else if ([2, 4, 11].includes(vh)) {
      score += 7;
      reasons.push(`Venus in house ${vh} — supportive for stable partnerships`);
    } else if ([6, 8, 12].includes(vh)) {
      score -= 5;
      // No reason push — dusthana Venus is a challenge not an absence of yoga
    }
  }

  // Jupiter's role
  if (jupiter) {
    const jh = jupiter.house;
    if ([1, 5, 7, 9].includes(jh)) {
      score += 8;
      reasons.push(`Jupiter in house ${jh} — blesses marriage prospects`);
    }
    if (jupiter.strength === 'Exalted' || jupiter.strength === 'Own Sign') {
      score += 5;
      reasons.push(`Jupiter is ${jupiter.strength} — strengthens dharmic partnerships`);
    }
    // Jupiter aspects 7th house (from 1st, 3rd, or 11th house it aspects 7th via 7th aspect etc.)
    // Jupiter aspects: 5th, 7th, 9th from its position
    const jupAspects = [
      ((jh - 1 + 4) % 12) + 1,  // 5th aspect
      ((jh - 1 + 6) % 12) + 1,  // 7th aspect
      ((jh - 1 + 8) % 12) + 1,  // 9th aspect
    ];
    if (jupAspects.includes(7)) {
      score += 8;
      reasons.push(`Jupiter aspects the 7th house — auspicious for marriage`);
    }
  }

  // Benefics in 7th house
  const beneficsIn7 = planetsIn7th.filter(p => BENEFICS.includes(p));
  if (beneficsIn7.length > 0) {
    score += beneficsIn7.length * 6;
    reasons.push(`Benefic planet(s) in 7th house: ${beneficsIn7.join(', ')}`);
  }

  // Malefics in 7th house
  const maleficsIn7 = planetsIn7th.filter(p => MALEFICS.includes(p));
  if (maleficsIn7.length > 0) {
    score -= maleficsIn7.length * 7;
    // Not pushing as a "reason" (positive indicator) — handled in delays
  }

  // Venus–Jupiter conjunction or mutual aspect
  if (venus && jupiter) {
    if (venus.house === jupiter.house) {
      score += 10;
      reasons.push('Venus and Jupiter are conjunct — highly auspicious for marriage');
    }
  }

  // Moon in 7th
  const moon = getPlanet('Moon');
  if (moon?.house === 7) {
    score += 8;
    reasons.push('Moon in 7th house — strong emotional desire for partnership');
  }

  // ─── Strength label ────────────────────────────────────────────────────────
  let strength;
  if (score >= 85)      strength = 'Very Strong';
  else if (score >= 70) strength = 'Strong';
  else if (score >= 55) strength = 'Moderate';
  else if (score >= 40) strength = 'Average';
  else                  strength = 'Delayed/Challenging';

  // present = chart has at least average marriage potential
  const present = score >= 50;

  // ─── Marriage type ─────────────────────────────────────────────────────────
  let marriageType = 'Possibility of arranged marriage';
  if (venus && [5, 7].includes(venus.house)) {
    marriageType = 'Strong possibility of love marriage';
  } else if (venus && [3, 11].includes(venus.house)) {
    marriageType = 'Love marriage possible through social connections';
  } else if (planetsIn7th.includes('Rahu')) {
    marriageType = 'Intercaste or unconventional marriage possible';
  }

  // ─── Delay indications ────────────────────────────────────────────────────
  const delays = [];
  if (planetsIn7th.includes('Saturn')) delays.push('Saturn in 7th may delay marriage — patience required');
  if (planetsIn7th.includes('Rahu'))   delays.push('Rahu in 7th may create unconventional or delayed relationships');
  if (planetsIn7th.includes('Ketu'))   delays.push('Ketu in 7th may create detachment or spiritual approach to marriage');
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) {
    delays.push(`${seventhLord} (7th lord) in dusthana — may delay or complicate marriage`);
  }

  // ─── Favorable dasha periods (current + upcoming) ─────────────────────────
  const marriagePlanets = ['Venus', seventhLord, 'Jupiter'];
  // Deduplicate (e.g. if 7th lord IS Venus or Jupiter)
  const uniqueMarriagePlanets = [...new Set(marriagePlanets)];

  let favorableDashas = [];

  if (birthYear && dashaBalance !== undefined) {
    // Build full timeline and find real upcoming periods
    const timeline = buildDashaTimeline(birthYear, mahadasha, dashaBalance);
    favorableDashas = getFavorablePeriods(timeline, uniqueMarriagePlanets);
  } else {
    // Fallback: just list natal dasha/antardasha (old behavior)
    if (uniqueMarriagePlanets.includes(mahadasha)) {
      favorableDashas.push({
        period: `${mahadasha} Mahadasha`,
        reason: `${mahadasha} Mahadasha supports marriage`,
      });
    }
    antardasha_list.forEach(ad => {
      if (uniqueMarriagePlanets.includes(ad.lord)) {
        favorableDashas.push({
          period: `${mahadasha} / ${ad.lord}`,
          reason: `${ad.lord} Antardasha within ${mahadasha} Mahadasha is favorable`,
        });
      }
    });
  }

  // ─── Note about what this represents ──────────────────────────────────────
  const note =
    'Marriage Yoga is a natal chart indicator — it reflects the inherent potential and timing for marriage based on birth chart. ' +
    'Favorable periods shown are actual upcoming Vimshottari Dasha periods (next 10 years) when marriage is cosmically supported.';

  return {
    present,
    score: Math.max(0, Math.min(100, score)),
    strength,
    reasons,
    marriage_type: marriageType,
    favorable_periods: favorableDashas,
    delay_indications: delays,
    note,
  };
}

module.exports = { calcMarriageYoga };
