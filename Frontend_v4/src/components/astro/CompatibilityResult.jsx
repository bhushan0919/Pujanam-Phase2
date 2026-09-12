import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

  .cr-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .cr-wrap {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 10%, #1a0533 0%, #0d0118 40%, #050010 100%);
    padding: 32px 16px 60px;
    font-family: 'Lato', sans-serif;
    color: #e8d8ff;
    position: relative;
    overflow: hidden;
  }

  .cr-wrap::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 15% 25%, rgba(255,220,150,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 75% 15%, rgba(255,220,150,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 45% 60%, rgba(200,150,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 85% 70%, rgba(255,220,150,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 80%, rgba(200,150,255,0.4) 0%, transparent 100%),
      radial-gradient(2px 2px at 60% 40%, rgba(255,220,150,0.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 90% 50%, rgba(200,150,255,0.5) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }

  .cr-inner { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; }

  /* Back button */
  .cr-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(212,175,55,0.8); font-family: 'Lato', sans-serif;
    font-size: 13px; padding: 8px 16px; border-radius: 20px;
    cursor: pointer; margin-bottom: 28px; letter-spacing: 0.5px;
    transition: all 0.2s;
  }
  .cr-back:hover { background: rgba(212,175,55,0.1); color: #D4AF37; }

  /* Hero score */
  .cr-hero {
    text-align: center;
    padding: 40px 20px 32px;
    background: linear-gradient(135deg, rgba(80,20,120,0.4) 0%, rgba(30,5,60,0.6) 100%);
    border: 1px solid rgba(212,175,55,0.2);
    border-radius: 24px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    animation: fadeUp 0.6s ease both;
  }
  .cr-hero::after {
    content: '☯';
    position: absolute; right: 20px; top: 16px;
    font-size: 80px; opacity: 0.04; color: #D4AF37;
  }
  .cr-hero-label {
    font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 4px;
    color: rgba(212,175,55,0.6); text-transform: uppercase; margin-bottom: 16px;
  }
  .cr-score-ring {
    width: 140px; height: 140px; margin: 0 auto 16px;
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .cr-score-svg { position: absolute; inset: 0; transform: rotate(-90deg); }
  .cr-score-bg { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 8; }
  .cr-score-fill {
    fill: none; stroke-width: 8; stroke-linecap: round;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1);
  }
  .cr-score-num {
    font-family: 'Cinzel', serif; font-size: 36px; font-weight: 700;
    color: #D4AF37; line-height: 1;
  }
  .cr-score-pct { font-size: 14px; color: rgba(212,175,55,0.6); }
  .cr-match-label {
    font-family: 'Cinzel', serif; font-size: 20px; font-weight: 600;
    color: #f0e0ff; margin-bottom: 10px;
  }
  .cr-recommendation {
    font-size: 14px; line-height: 1.7; color: rgba(232,216,255,0.75);
    max-width: 480px; margin: 0 auto;
  }

  /* Guna milan */
  .cr-section { margin-bottom: 24px; animation: fadeUp 0.6s ease both; }
  .cr-section-head {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600;
    letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;
    margin-bottom: 14px; padding-bottom: 8px;
    border-bottom: 1px solid rgba(212,175,55,0.2);
  }
  .cr-section-head span { font-size: 16px; }

  .cr-guna-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  }
  @media (max-width: 500px) { .cr-guna-grid { grid-template-columns: repeat(2, 1fr); } }
  .cr-guna-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(212,175,55,0.15);
    border-radius: 12px; padding: 12px 8px; text-align: center;
    transition: transform 0.2s, border-color 0.2s;
  }
  .cr-guna-card:hover { transform: translateY(-2px); border-color: rgba(212,175,55,0.4); }
  .cr-guna-name {
    font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
    color: rgba(212,175,55,0.55); margin-bottom: 6px;
  }
  .cr-guna-val {
    font-family: 'Cinzel', serif; font-size: 18px; color: #D4AF37; font-weight: 600;
  }

  .cr-guna-total {
    margin-top: 12px; padding: 14px 20px;
    background: linear-gradient(90deg, rgba(212,175,55,0.08), rgba(212,175,55,0.04));
    border: 1px solid rgba(212,175,55,0.2); border-radius: 12px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .cr-guna-total-label { font-size: 13px; color: rgba(232,216,255,0.6); }
  .cr-guna-total-val { font-family: 'Cinzel', serif; font-size: 22px; color: #D4AF37; font-weight: 700; }

  /* Two-col compare */
  .cr-compare {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;
  }
  .cr-compare-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(200,150,255,0.15);
    border-radius: 12px; padding: 14px 12px;
  }
  .cr-compare-who { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(200,150,255,0.5); margin-bottom: 4px; }
  .cr-compare-val { font-size: 14px; color: #e8d8ff; font-weight: 600; }
  .cr-info-text { font-size: 13px; line-height: 1.7; color: rgba(232,216,255,0.7); }

  /* Glass card */
  .cr-card {
    background: rgba(255,255,255,0.035); border: 1px solid rgba(212,175,55,0.12);
    border-radius: 16px; padding: 18px 20px; margin-bottom: 12px;
  }

  /* Lists */
  .cr-list { list-style: none; }
  .cr-list li {
    padding: 8px 0 8px 20px; position: relative;
    font-size: 13px; line-height: 1.6; color: rgba(232,216,255,0.75);
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .cr-list li:last-child { border-bottom: none; }
  .cr-list li::before {
    content: '✦'; position: absolute; left: 0; top: 9px;
    color: rgba(212,175,55,0.6); font-size: 10px;
  }
  .cr-list.challenge li::before { content: '◈'; color: rgba(255,100,100,0.6); }
  .cr-list.remedy li::before { content: '🙏'; font-size: 11px; top: 8px; }

  /* Mangal badges */
  .cr-badge-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
  .cr-badge {
    padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
    letter-spacing: 0.5px;
  }
  .cr-badge.yes { background: rgba(200,50,50,0.2); border: 1px solid rgba(200,50,50,0.4); color: #ff9999; }
  .cr-badge.no { background: rgba(50,200,100,0.15); border: 1px solid rgba(50,200,100,0.3); color: #90ee90; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
`;

const getMatchLabel = (score) => {
  if (score >= 85) return { label: 'Exceptional Match', color: '#90EE90' };
  if (score >= 70) return { label: 'Excellent Match', color: '#7DF9AA' };
  if (score >= 55) return { label: 'Good Match', color: '#D4AF37' };
  if (score >= 40) return { label: 'Average Match', color: '#FFA500' };
  return { label: 'Challenging Match', color: '#FF6B6B' };
};

const getStrokeColor = (score) => {
  if (score >= 70) return '#7DF9AA';
  if (score >= 50) return '#D4AF37';
  return '#FF6B6B';
};

export default function CompatibilityResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result;
  const [animated, setAnimated] = useState(false);

  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0118', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontFamily: 'Cinzel, serif' }}>
        No compatibility data found.
      </div>
    );
  }

  const score = data.overall_score;
  const circumference = 2 * Math.PI * 54;
  const offset = animated ? circumference * (1 - score / 100) : circumference;
  const match = getMatchLabel(score);
  const strokeColor = getStrokeColor(score);

  return (
    <>
      <style>{style}</style>
      <div className="cr-wrap">
        <div className="cr-inner">
          <button className="cr-back" onClick={() => navigate(-1)}>← Back</button>

          {/* Hero Score */}
          <div className="cr-hero">
            <div className="cr-hero-label">Kundali Compatibility Analysis</div>
            <div className="cr-score-ring">
              <svg className="cr-score-svg" viewBox="0 0 120 120">
                <circle className="cr-score-bg" cx="60" cy="60" r="54" />
                <circle
                  className="cr-score-fill"
                  cx="60" cy="60" r="54"
                  stroke={strokeColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div>
                <div className="cr-score-num">{score}</div>
                <div className="cr-score-pct">%</div>
              </div>
            </div>
            <div className="cr-match-label" style={{ color: match.color }}>{match.label}</div>
            <div className="cr-recommendation">{data.recommendation}</div>
          </div>

          {/* Guna Milan */}
          <div className="cr-section" style={{ animationDelay: '0.1s' }}>
            <div className="cr-section-head"><span>✦</span> Guna Milan (Ashtakoota)</div>
            <div className="cr-guna-grid">
              {Object.entries(data.guna_milan.details)
                .filter(([k]) => k !== 'total')
                .map(([k, v]) => (
                  <div key={k} className="cr-guna-card">
                    <div className="cr-guna-name">{k}</div>
                    <div className="cr-guna-val">{v}</div>
                  </div>
                ))}
            </div>
            <div className="cr-guna-total">
              <span className="cr-guna-total-label">Total Gunas Matched</span>
              <span className="cr-guna-total-val">{data.guna_milan.total} <span style={{ fontSize: 14, color: 'rgba(212,175,55,0.5)' }}>/36</span></span>
            </div>
          </div>

          {/* Elemental */}
          <div className="cr-section" style={{ animationDelay: '0.2s' }}>
            <div className="cr-section-head"><span>🔥</span> Elemental Compatibility (Tattva)</div>
            <div className="cr-compare">
              <div className="cr-compare-card">
                <div className="cr-compare-who">Boy's Element</div>
                <div className="cr-compare-val">{data.tattva_compatibility.boy_element}</div>
              </div>
              <div className="cr-compare-card">
                <div className="cr-compare-who">Girl's Element</div>
                <div className="cr-compare-val">{data.tattva_compatibility.girl_element}</div>
              </div>
            </div>
            <div className="cr-card">
              <p className="cr-info-text">{data.tattva_compatibility.summary}</p>
            </div>
          </div>

          {/* Mangal Dosha */}
          <div className="cr-section" style={{ animationDelay: '0.3s' }}>
            <div className="cr-section-head"><span>♂</span> Mangal Dosha Analysis</div>
            <div className="cr-badge-row">
              <span className="cr-badge no">Boy: {data.mangal_dosha.boy ? 'Manglik ✗' : 'Non-Manglik ✓'}</span>
              <span className={`cr-badge ${data.mangal_dosha.girl ? 'yes' : 'no'}`}>Girl: {data.mangal_dosha.girl ? 'Manglik ✗' : 'Non-Manglik ✓'}</span>
            </div>
            <div className="cr-card">
              <p className="cr-info-text">{data.mangal_dosha.summary}</p>
            </div>
          </div>

          {/* Emotional */}
          <div className="cr-section" style={{ animationDelay: '0.35s' }}>
            <div className="cr-section-head"><span>💞</span> Emotional Compatibility</div>
            <div className="cr-card">
              <p className="cr-info-text">{data.emotional_compatibility}</p>
            </div>
          </div>

          {/* Strengths */}
          <div className="cr-section" style={{ animationDelay: '0.4s' }}>
            <div className="cr-section-head"><span>🌟</span> Relationship Strengths</div>
            <div className="cr-card">
              <ul className="cr-list">
                {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {/* Challenges */}
          <div className="cr-section" style={{ animationDelay: '0.45s' }}>
            <div className="cr-section-head"><span>⚡</span> Potential Challenges</div>
            <div className="cr-card">
              <ul className="cr-list challenge">
                {data.challenges.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {/* Remedies */}
          <div className="cr-section" style={{ animationDelay: '0.5s' }}>
            <div className="cr-section-head"><span>🙏</span> Suggested Remedies</div>
            <div className="cr-card">
              <ul className="cr-list remedy">
                {data.remedies.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}