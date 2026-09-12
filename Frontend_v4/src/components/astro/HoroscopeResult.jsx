import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

  .hr-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .hr-wrap {
    min-height: 100vh;
    background: radial-gradient(ellipse at 70% 0%, #0a1628 0%, #050d1a 50%, #02070f 100%);
    padding: 32px 16px 60px;
    font-family: 'Lato', sans-serif;
    color: #ddeeff;
    position: relative;
    overflow: hidden;
  }
  .hr-wrap::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      radial-gradient(1px 1px at 10% 20%, rgba(180,220,255,0.8) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 80% 10%, rgba(255,220,150,0.7) 0%, transparent 100%),
      radial-gradient(1px 1px at 55% 30%, rgba(180,220,255,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 25% 65%, rgba(255,220,150,0.4) 0%, transparent 100%),
      radial-gradient(2px 2px at 90% 55%, rgba(180,220,255,0.6) 0%, transparent 100%),
      radial-gradient(1px 1px at 40% 85%, rgba(255,220,150,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 70% 75%, rgba(180,220,255,0.4) 0%, transparent 100%);
  }

  .hr-inner { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; }

  .hr-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(150,200,255,0.8); font-family: 'Lato', sans-serif;
    font-size: 13px; padding: 8px 16px; border-radius: 20px;
    cursor: pointer; margin-bottom: 28px; letter-spacing: 0.5px;
    transition: all 0.2s;
  }
  .hr-back:hover { background: rgba(100,180,255,0.1); color: #96c8ff; }

  /* Hero */
  .hr-hero {
    text-align: center; padding: 36px 20px 28px;
    background: linear-gradient(135deg, rgba(10,30,70,0.8) 0%, rgba(5,15,40,0.9) 100%);
    border: 1px solid rgba(100,180,255,0.2); border-radius: 24px;
    margin-bottom: 20px; position: relative; overflow: hidden;
    animation: hrFadeUp 0.5s ease both;
  }
  .hr-hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(100,180,255,0.08) 0%, transparent 70%);
  }
  .hr-sign-icon {
    font-size: 52px; margin-bottom: 10px;
    filter: drop-shadow(0 0 16px rgba(100,180,255,0.5));
    animation: hrFloat 4s ease-in-out infinite;
  }
  @keyframes hrFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  .hr-sign-name {
    font-family: 'Cinzel', serif; font-size: 28px; font-weight: 700;
    color: #fff; letter-spacing: 3px; margin-bottom: 4px;
  }
  .hr-date-label {
    font-size: 12px; letter-spacing: 3px; color: rgba(150,200,255,0.6);
    text-transform: uppercase; margin-bottom: 20px;
  }
  .hr-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
  .hr-pill {
    background: rgba(100,180,255,0.08); border: 1px solid rgba(100,180,255,0.2);
    padding: 5px 14px; border-radius: 20px; font-size: 12px;
    color: rgba(180,220,255,0.8); letter-spacing: 0.5px;
  }

  /* Score ring strip */
  .hr-score-strip {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    margin-bottom: 20px; animation: hrFadeUp 0.5s ease 0.1s both;
  }
  @media (min-width: 480px) { .hr-score-strip { grid-template-columns: repeat(6, 1fr); } }
  .hr-score-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(100,180,255,0.12);
    border-radius: 14px; padding: 12px 6px; text-align: center;
    transition: transform 0.2s, border-color 0.2s;
  }
  .hr-score-card:hover { transform: translateY(-3px); border-color: rgba(100,180,255,0.35); }
  .hr-score-icon { font-size: 20px; margin-bottom: 4px; }
  .hr-score-name { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: rgba(150,200,255,0.5); margin-bottom: 6px; }
  .hr-stars { display: flex; justify-content: center; gap: 2px; }
  .hr-star { font-size: 10px; transition: color 0.3s; }
  .hr-star.lit { color: #D4AF37; }
  .hr-star.half { color: #D4AF37; opacity: 0.5; }
  .hr-star.dim { color: rgba(255,255,255,0.12); }

  /* Sections */
  .hr-section { margin-bottom: 16px; animation: hrFadeUp 0.5s ease both; }
  .hr-section-head {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Cinzel', serif; font-size: 12px; font-weight: 600;
    letter-spacing: 2px; color: rgba(150,200,255,0.9);
    text-transform: uppercase; margin-bottom: 12px;
    padding-bottom: 8px; border-bottom: 1px solid rgba(100,180,255,0.15);
  }

  .hr-text-card {
    background: rgba(255,255,255,0.035); border: 1px solid rgba(100,180,255,0.1);
    border-radius: 14px; padding: 16px 18px;
  }
  .hr-domain-card {
    border-radius: 14px; padding: 16px 18px; border: 1px solid;
  }
  .hr-domain-stars { margin-bottom: 10px; display: flex; gap: 3px; align-items: center; }
  .hr-domain-star { font-size: 13px; }
  .hr-body-text { font-size: 13px; line-height: 1.75; color: rgba(210,235,255,0.75); }

  /* Lucky */
  .hr-lucky-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .hr-lucky-card {
    background: linear-gradient(135deg, rgba(100,180,255,0.06), rgba(50,100,200,0.04));
    border: 1px solid rgba(100,180,255,0.15); border-radius: 14px; padding: 14px 10px; text-align: center;
  }
  .hr-lucky-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(150,200,255,0.5); margin-bottom: 6px; }
  .hr-lucky-val { font-family: 'Cinzel', serif; font-size: 16px; color: #D4AF37; font-weight: 600; }

  /* Compat signs */
  .hr-signs-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .hr-sign-chip {
    background: rgba(100,180,255,0.07); border: 1px solid rgba(100,180,255,0.2);
    padding: 5px 16px; border-radius: 20px; font-size: 12px; color: rgba(200,230,255,0.8);
  }

  /* Transits */
  .hr-transit {
    padding: 10px 14px; background: rgba(255,255,255,0.03);
    border-left: 2px solid rgba(100,180,255,0.3); border-radius: 0 8px 8px 0;
    font-size: 13px; color: rgba(210,235,255,0.7); margin-bottom: 8px; line-height: 1.5;
  }

  /* Mantra */
  .hr-mantra {
    background: linear-gradient(135deg, rgba(212,175,55,0.06), rgba(150,100,0,0.06));
    border: 1px solid rgba(212,175,55,0.2); border-radius: 16px;
    padding: 20px; text-align: center;
  }
  .hr-om { font-size: 32px; color: #D4AF37; margin-bottom: 8px; opacity: 0.8; }
  .hr-mantra-text { font-size: 14px; line-height: 1.7; color: rgba(232,220,180,0.85); font-style: italic; }

  @keyframes hrFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
`;

const SIGN_EMOJIS = {
  Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',Virgo:'♍',
  Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',Aquarius:'♒',Pisces:'♓'
};
const DOMAINS = [
  { key:'overall',icon:'🌟',label:'Overall',color:'#D4AF37' },
  { key:'love',icon:'💕',label:'Love',color:'#FF69B4' },
  { key:'career',icon:'💼',label:'Career',color:'#6496FF' },
  { key:'health',icon:'🌿',label:'Health',color:'#50C878' },
  { key:'finance',icon:'💰',label:'Finance',color:'#FFD700' },
  { key:'luck',icon:'🍀',label:'Luck',color:'#9B59B6' },
];

function Stars({ score, color }) {
  return (
    <div className="hr-stars">
      {[1,2,3,4,5].map(i => {
        const lit = i <= Math.floor(score);
        const half = !lit && i - 0.5 === score;
        return <span key={i} className={`hr-star ${lit?'lit':half?'half':'dim'}`} style={lit||half?{color}:{}}>★</span>;
      })}
      <span style={{fontSize:10,color:'rgba(150,200,255,0.5)',marginLeft:4}}>{score}/5</span>
    </div>
  );
}

export default function HoroscopeResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data;

  if (!data) return (
    <div style={{minHeight:'100vh',background:'#050d1a',display:'flex',alignItems:'center',justifyContent:'center',color:'#96c8ff',fontFamily:'Cinzel,serif'}}>
      No horoscope data found.
    </div>
  );

  const h = data.horoscope;
  const signEmoji = SIGN_EMOJIS[h.sign] || '⭐';

  const domainStyles = {
    love:   { background:'rgba(255,105,180,0.07)', borderColor:'rgba(255,105,180,0.2)' },
    career: { background:'rgba(65,105,225,0.07)', borderColor:'rgba(65,105,225,0.2)' },
    health: { background:'rgba(46,139,87,0.07)',  borderColor:'rgba(46,139,87,0.2)' },
  };

  return (
    <>
      <style>{style}</style>
      <div className="hr-wrap">
        <div className="hr-inner">
          <button className="hr-back" onClick={() => navigate(-1)}>← Back</button>

          {/* Hero */}
          <div className="hr-hero">
            <div className="hr-sign-icon">{signEmoji}</div>
            <div className="hr-sign-name">{h.sign}</div>
            <div className="hr-date-label">Daily Horoscope · {h.date}</div>
            <div className="hr-pills">
              <span className="hr-pill">📅 {h.tithi}</span>
              <span className="hr-pill">🌙 {h.paksha} Paksha</span>
              <span className="hr-pill">⭐ {h.moon_nakshatra}</span>
            </div>
          </div>

          {/* Score grid */}
          <div className="hr-score-strip">
            {DOMAINS.map(d => (
              <div key={d.key} className="hr-score-card">
                <div className="hr-score-icon">{d.icon}</div>
                <div className="hr-score-name">{d.label}</div>
                <Stars score={h.star_scores[d.key]} color={d.color} />
              </div>
            ))}
          </div>

          {/* Overview */}
          <div className="hr-section" style={{animationDelay:'0.15s'}}>
            <div className="hr-section-head">🔮 Overview</div>
            <div className="hr-text-card"><p className="hr-body-text">{h.overview}</p></div>
          </div>

          {/* Domain sections */}
          {[
            { key:'love', icon:'💕', title:'Love & Relationships', color:'#FF69B4' },
            { key:'career', icon:'💼', title:'Career & Work', color:'#6496FF' },
            { key:'health', icon:'🌿', title:'Health & Vitality', color:'#50C878' },
          ].map((s, idx) => (
            <div key={s.key} className="hr-section" style={{animationDelay:`${0.2+idx*0.08}s`}}>
              <div className="hr-section-head">{s.icon} {s.title}</div>
              <div className="hr-domain-card" style={domainStyles[s.key]}>
                <div className="hr-domain-stars">
                  <Stars score={h.star_scores[s.key]} color={s.color} />
                </div>
                <p className="hr-body-text">{h.sections[s.key]}</p>
              </div>
            </div>
          ))}

          {/* Lucky */}
          <div className="hr-section" style={{animationDelay:'0.45s'}}>
            <div className="hr-section-head">🍀 Lucky Indicators</div>
            <div className="hr-lucky-row">
              <div className="hr-lucky-card">
                <div className="hr-lucky-label">Lucky Number</div>
                <div className="hr-lucky-val">{h.lucky_number}</div>
              </div>
              <div className="hr-lucky-card">
                <div className="hr-lucky-label">Lucky Color</div>
                <div className="hr-lucky-val">{h.lucky_color}</div>
              </div>
              <div className="hr-lucky-card">
                <div className="hr-lucky-label">Best Time</div>
                <div className="hr-lucky-val">{h.best_time}</div>
              </div>
            </div>
          </div>

          {/* Compatible signs */}
          <div className="hr-section" style={{animationDelay:'0.5s'}}>
            <div className="hr-section-head">💞 Compatible Signs Today</div>
            <div className="hr-signs-wrap">
              {h.compatible_signs.map(s => (
                <span key={s} className="hr-sign-chip">{SIGN_EMOJIS[s] || ''} {s}</span>
              ))}
            </div>
          </div>

          {/* Planetary */}
          {h.key_transits?.length > 0 && (
            <div className="hr-section" style={{animationDelay:'0.55s'}}>
              <div className="hr-section-head">🌌 Planetary Influences</div>
              {h.key_transits.slice(0,4).map((t,i) => (
                <div key={i} className="hr-transit">✦ {t}</div>
              ))}
            </div>
          )}

          {/* Mantra */}
          <div className="hr-section" style={{animationDelay:'0.6s'}}>
            <div className="hr-section-head">🕉 Today's Mantra</div>
            <div className="hr-mantra">
              <div className="hr-om">ॐ</div>
              <p className="hr-mantra-text">{h.mantra}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}