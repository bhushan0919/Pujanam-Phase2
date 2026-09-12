import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { downloadKundaliPDF } from './KundaliPDFExport';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

  .kr-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .kr-wrap {
    min-height: 100vh;
    background: radial-gradient(ellipse at 30% 0%, #1a0d00 0%, #0f0800 40%, #060400 100%);
    padding: 32px 16px 60px;
    font-family: 'Lato', sans-serif;
    color: #f0e6cc;
    position: relative; overflow: hidden;
  }
  .kr-wrap::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      radial-gradient(1px 1px at 20% 15%, rgba(255,200,100,0.7) 0%, transparent 100%),
      radial-gradient(2px 2px at 70% 8%, rgba(255,220,150,0.8) 0%, transparent 100%),
      radial-gradient(1px 1px at 45% 50%, rgba(255,200,100,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 88% 30%, rgba(255,220,150,0.5) 0%, transparent 100%),
      radial-gradient(1px 1px at 15% 70%, rgba(255,200,100,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 60% 80%, rgba(255,220,150,0.4) 0%, transparent 100%),
      radial-gradient(2px 2px at 35% 90%, rgba(255,200,100,0.6) 0%, transparent 100%);
  }
  .kr-inner { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; }

  .kr-back {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(212,175,55,0.8); font-family: 'Lato', sans-serif;
    font-size: 13px; padding: 8px 16px; border-radius: 20px;
    cursor: pointer; margin-bottom: 28px; transition: all 0.2s;
  }
  .kr-back:hover { background: rgba(212,175,55,0.1); color: #D4AF37; }

  /* Header */
  .kr-header {
    text-align: center; padding: 32px 20px 24px;
    background: linear-gradient(135deg, rgba(80,40,0,0.6) 0%, rgba(30,15,0,0.8) 100%);
    border: 1px solid rgba(212,175,55,0.25); border-radius: 24px;
    margin-bottom: 20px; position: relative; overflow: hidden;
    animation: krUp 0.5s ease both;
  }
  .kr-header::after { content:'🌟'; position:absolute;right:16px;top:12px;font-size:70px;opacity:0.05; }
  .kr-header-label { font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(212,175,55,0.5);margin-bottom:10px; }
  .kr-name { font-family:'Cinzel',serif;font-size:26px;font-weight:700;color:#fff;margin-bottom:8px; }
  .kr-subtitle { font-size:12px;color:rgba(212,175,55,0.6);line-height:1.6; }

  /* Tabs */
  .kr-tabs { display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px; }
  .kr-tab {
    padding:7px 14px;border-radius:20px;font-size:12px;font-weight:600;
    border:1px solid rgba(212,175,55,0.15);background:rgba(255,255,255,0.03);
    color:rgba(212,175,55,0.55);cursor:pointer;transition:all 0.2s;letter-spacing:0.3px;
    display:flex;align-items:center;gap:4px;
  }
  .kr-tab:hover { border-color:rgba(212,175,55,0.35);color:rgba(212,175,55,0.8); }
  .kr-tab.active {
    background:rgba(212,175,55,0.15);border-color:rgba(212,175,55,0.5);
    color:#D4AF37;
  }
  .kr-badge-count { font-size:10px;padding:1px 5px;border-radius:10px;background:rgba(212,175,55,0.15); }
  .kr-badge-count.green { background:rgba(50,200,100,0.2);color:#90EE90; }
  .kr-badge-count.red { background:rgba(200,50,50,0.2);color:#FF9999; }

  /* Info grid */
  .kr-info-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px; }
  @media(max-width:480px){ .kr-info-grid{grid-template-columns:1fr 1fr;} }
  .kr-info-card {
    background:rgba(255,255,255,0.035);border:1px solid rgba(212,175,55,0.12);
    border-radius:12px;padding:12px 10px;text-align:center;
  }
  .kr-info-label { font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(212,175,55,0.45);margin-bottom:5px; }
  .kr-info-val { font-family:'Cinzel',serif;font-size:14px;color:#e8d5a3;font-weight:600; }
  .kr-info-sub { font-size:10px;color:rgba(212,175,55,0.4);margin-top:2px; }

  .kr-section-title {
    font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;
    color:rgba(212,175,55,0.6);margin:16px 0 10px;padding-bottom:6px;
    border-bottom:1px solid rgba(212,175,55,0.1);
  }

  /* Chart */
  .kr-chart-table { width:100%;border-collapse:collapse;margin:0 auto; }
  .kr-chart-table td {
    border:1px solid rgba(212,175,55,0.18);
    width:25%;aspect-ratio:1;padding:6px;
    vertical-align:top;background:rgba(20,10,0,0.5);
    min-height:70px;
  }
  .kr-chart-table td.lagna-cell { background:rgba(212,175,55,0.08);border-color:rgba(212,175,55,0.4); }
  .kr-chart-table td.center-cell {
    background:linear-gradient(135deg,rgba(212,175,55,0.03),rgba(100,50,0,0.08));
    text-align:center;vertical-align:middle;border-color:rgba(212,175,55,0.2);
  }
  .kr-cell-house { font-size:9px;color:rgba(212,175,55,0.4);margin-bottom:1px; }
  .kr-cell-sign { font-size:8px;color:rgba(212,175,55,0.3);margin-bottom:3px; }
  .kr-cell-planet { font-size:11px;line-height:1.4; }
  .kr-cell-planet span { font-size:9px; }
  .kr-chart-note { text-align:center;margin-top:8px;font-size:11px;color:rgba(212,175,55,0.3);letter-spacing:0.5px; }

  /* Planet rows */
  .kr-planet-header {
    display:grid;grid-template-columns:44px 1fr 60px 44px 70px;gap:4px;
    padding:6px 10px;font-size:9px;letter-spacing:1px;text-transform:uppercase;
    color:rgba(212,175,55,0.4);border-bottom:1px solid rgba(212,175,55,0.1);margin-bottom:6px;
  }
  .kr-planet-row {
    display:grid;grid-template-columns:44px 1fr 60px 44px 70px;gap:4px;
    padding:10px;background:rgba(255,255,255,0.025);border:1px solid rgba(212,175,55,0.08);
    border-radius:10px;margin-bottom:6px;align-items:center;
    transition:border-color 0.2s;
  }
  .kr-planet-row:hover { border-color:rgba(212,175,55,0.25); }
  .kr-planet-sym { font-size:18px;line-height:1; }
  .kr-planet-name { font-size:10px;color:rgba(240,230,200,0.55);margin-top:2px; }
  .kr-planet-sign { color:#e8d5a3;font-size:13px; }
  .kr-planet-nak { color:rgba(212,175,55,0.45);font-size:10px;margin-top:2px; }
  .kr-planet-d9 { color:rgba(212,175,55,0.3);font-size:9px;margin-top:2px; }
  .kr-planet-deg { color:rgba(212,175,55,0.6);font-size:11px; }
  .kr-planet-house { color:#fff;font-size:15px;font-weight:700;text-align:center; }
  .kr-strength-badge {
    display:inline-block;padding:2px 8px;border-radius:8px;font-size:9px;font-weight:700;letter-spacing:0.5px;
  }
  .kr-retro { color:#FF9933;font-size:9px;margin-top:3px; }
  .kr-combust { color:#FF4444;font-size:9px;margin-top:2px; }

  /* Dasha */
  .kr-ad-row {
    display:flex;justify-content:space-between;align-items:center;
    padding:10px 14px;border-radius:10px;margin-bottom:6px;
    background:rgba(255,255,255,0.025);border:1px solid rgba(212,175,55,0.08);
  }
  .kr-ad-row.current { background:rgba(212,175,55,0.08);border-color:rgba(212,175,55,0.3); }
  .kr-ad-label { font-size:13px; }
  .kr-ad-current-tag { font-size:10px;color:rgba(212,175,55,0.5);margin-top:2px; }
  .kr-ad-dates { font-size:11px;color:rgba(212,175,55,0.5);text-align:right; }

  /* Yoga/Dosha cards */
  .kr-yoga-card {
    padding:14px;border-radius:12px;margin-bottom:8px;
    border:1px solid rgba(212,175,55,0.1);background:rgba(255,255,255,0.025);
    transition:border-color 0.2s;
  }
  .kr-yoga-card.present { border-color:rgba(50,200,100,0.2);background:rgba(50,200,100,0.04); }
  .kr-yoga-card.absent { opacity:0.5; }
  .kr-dosha-card {
    padding:14px;border-radius:12px;margin-bottom:8px;
    border:1px solid rgba(212,175,55,0.1);background:rgba(255,255,255,0.025);
  }
  .kr-dosha-card.present { border-color:rgba(200,50,50,0.25);background:rgba(200,50,50,0.05); }
  .kr-card-head { display:flex;justify-content:space-between;align-items:center;margin-bottom:8px; }
  .kr-card-name { font-size:13px;font-weight:600; }
  .kr-card-desc { font-size:12px;line-height:1.6;color:rgba(240,230,200,0.65); }
  .kr-remedies-head { color:#D4AF37;font-size:11px;font-weight:700;margin:8px 0 5px; }
  .kr-remedy-item { color:rgba(240,230,200,0.55);font-size:11px;padding-left:10px;margin-bottom:3px; }

  /* Score bars */
  .kr-score-row { margin-bottom:14px; }
  .kr-score-bar-wrap { height:6px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;margin-top:4px; }
  .kr-score-bar { height:100%;border-radius:3px;transition:width 1s ease; }
  .kr-score-bar.high { background:linear-gradient(90deg,#2E8B57,#90EE90); }
  .kr-score-bar.med { background:linear-gradient(90deg,#D4AF37,#FFD700); }
  .kr-score-bar.low { background:linear-gradient(90deg,#8B0000,#FF4444); }

  /* Info box */
  .kr-note-box {
    background:rgba(212,175,55,0.04);border:1px solid rgba(212,175,55,0.1);
    border-radius:10px;padding:12px 14px;font-size:11px;color:rgba(212,175,55,0.5);
    margin-top:12px;line-height:1.7;
  }

  @keyframes krUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes spin { to { transform: rotate(360deg); } }

  .kr-dl-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(160,120,20,0.25) 100%);
    border: 1px solid rgba(212,175,55,0.45);
    color: #D4AF37; font-family: 'Lato', sans-serif; font-weight: 700;
    font-size: 13px; padding: 9px 20px; border-radius: 22px;
    cursor: pointer; transition: all 0.25s; letter-spacing: 0.4px;
    box-shadow: 0 0 14px rgba(212,175,55,0.08);
  }
  .kr-dl-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(212,175,55,0.28) 0%, rgba(160,120,20,0.38) 100%);
    border-color: rgba(212,175,55,0.7); box-shadow: 0 0 20px rgba(212,175,55,0.18);
    transform: translateY(-1px);
  }
  .kr-dl-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .kr-dl-btn .spin { display:inline-block; animation: spin 0.9s linear infinite; }
  .kr-top-bar { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; flex-wrap:wrap; gap:10px; }
`;

const PLANET_SYMBOLS = { Sun:'☉',Moon:'☽',Mercury:'☿',Venus:'♀',Mars:'♂',Jupiter:'♃',Saturn:'♄',Rahu:'☊',Ketu:'☋' };
const PLANET_COLORS = { Sun:'#FF9933',Moon:'#C0C0C0',Mercury:'#90EE90',Venus:'#FFB6C1',Mars:'#FF4444',Jupiter:'#FFD700',Saturn:'#6496FF',Rahu:'#CD853F',Ketu:'#A0A0A0' };
const STRENGTH_STYLES = {
  Exalted: { background:'rgba(46,139,87,0.3)',color:'#90EE90' },
  'Own Sign': { background:'rgba(65,105,225,0.3)',color:'#96b4ff' },
  Neutral: { background:'rgba(128,128,128,0.3)',color:'#ccc' },
  Debilitated: { background:'rgba(200,50,50,0.3)',color:'#ff9999' },
};
const NI_POSITIONS = [
  {house:12,r:0,c:0},{house:1,r:0,c:1},{house:2,r:0,c:2},{house:3,r:0,c:3},
  {house:11,r:1,c:0},{house:4,r:1,c:3},
  {house:10,r:2,c:0},{house:5,r:2,c:3},
  {house:9,r:3,c:0},{house:8,r:3,c:1},{house:7,r:3,c:2},{house:6,r:3,c:3},
];
const RASHI = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_ENG = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function KundaliChart({ houses, lagna }) {
  const lagnaIdx = RASHI.indexOf(lagna);
  const signForHouse = h => RASHI_ENG[(lagnaIdx + h - 1) % 12];
  const rows = [[0,1,2,3],[1,null,null,3],[2,null,null,3],[3,3,3,3]];
  return (
    <table className="kr-chart-table">
      <tbody>
        {[0,1,2,3].map(row => (
          <tr key={row}>
            {[0,1,2,3].map(col => {
              if ((row===1||row===2)&&(col===1||col===2)) {
                if (row===1&&col===1) return (
                  <td key={col} rowSpan={2} colSpan={2} className="center-cell kr-chart-table" style={{textAlign:'center',verticalAlign:'middle',border:'1px solid rgba(212,175,55,0.18)',background:'rgba(212,175,55,0.03)'}}>
                    <div style={{color:'rgba(212,175,55,0.5)',fontSize:28}}>☯</div>
                    <div style={{color:'rgba(212,175,55,0.3)',fontSize:9,letterSpacing:2,marginTop:4}}>KUNDALI</div>
                  </td>
                );
                return null;
              }
              const cell = NI_POSITIONS.find(p=>p.r===row&&p.c===col);
              if (!cell) return <td key={col} style={{border:'1px solid rgba(212,175,55,0.18)',background:'rgba(20,10,0,0.5)'}} />;
              const h = cell.house;
              const planetsInHouse = (houses[h]||[]).filter(p=>p!=='Lagna');
              return (
                <td key={col} className={h===1?'lagna-cell':''} style={{border:`1px solid ${h===1?'rgba(212,175,55,0.4)':'rgba(212,175,55,0.18)'}`,background:h===1?'rgba(212,175,55,0.08)':'rgba(20,10,0,0.5)',padding:6,verticalAlign:'top',width:'25%'}}>
                  <div className="kr-cell-house">{h===1?'1 ✦':h}</div>
                  <div className="kr-cell-sign">{signForHouse(h)}</div>
                  {planetsInHouse.map(p=>(
                    <div key={p} className="kr-cell-planet" style={{color:PLANET_COLORS[p]||'#ccc'}}>
                      {PLANET_SYMBOLS[p]||''} <span>{p}</span>
                    </div>
                  ))}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const TABS = [
  {id:'chart',label:'🗺 Chart'},
  {id:'planets',label:'🪐 Planets'},
  {id:'panchang',label:'📅 Panchang'},
  {id:'dasha',label:'⏱ Dasha'},
  {id:'yogas',label:'✨ Yogas'},
  {id:'marriage',label:'💍 Marriage'},
  {id:'doshas',label:'⚠ Doshas'},
  {id:'scores',label:'📊 Scores'},
];

export default function KundaliResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data;
  const [activeTab, setActiveTab] = useState('chart');
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!data) return (
    <div style={{minHeight:'100vh',background:'#060400',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Cinzel,serif'}}>
      No Kundali data found.
    </div>
  );

  const { name, kundali } = data;

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadKundaliPDF(name, kundali);
    } catch (e) {
      console.error('PDF error:', e);
      alert('PDF generation failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };
  const activeYogas = (kundali.yogas||[]).filter(y=>y.present).length;
  const activeDoshas = (kundali.doshas||[]).filter(d=>d.present).length;
  const ss = STRENGTH_STYLES;

  return (
    <>
      <style>{style}</style>
      <div className="kr-wrap">
        <div className="kr-inner">
          <div className="kr-top-bar">
            <button className="kr-back" style={{margin:0}} onClick={()=>navigate(-1)}>← Back</button>
            <button className="kr-dl-btn" onClick={handleDownloadPDF} disabled={pdfLoading}>
              {pdfLoading
                ? <><span className="spin">⟳</span> Generating PDF...</>
                : <>⬇ Download Kundali PDF</>
              }
            </button>
          </div>

          {/* Header */}
          <div className="kr-header">
            <div className="kr-header-label">Vedic Birth Chart Analysis</div>
            <div className="kr-name">🌟 {name}'s Kundali</div>
            <div className="kr-subtitle">
              Lagna: {kundali.lagna} ({kundali.lagnaEnglish}) · {kundali.lagnaDegree}<br/>
              {kundali.lagnaNakshatra} Nakshatra, Pada {kundali.lagnaPada}
            </div>
          </div>

          {/* Tabs */}
          <div className="kr-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`kr-tab ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>
                {t.label}
                {t.id==='yogas'&&activeYogas>0&&<span className="kr-badge-count green">{activeYogas}</span>}
                {t.id==='doshas'&&activeDoshas>0&&<span className="kr-badge-count red">{activeDoshas}</span>}
              </button>
            ))}
          </div>

          {/* CHART TAB */}
          {activeTab==='chart' && (
            <div>
              <div className="kr-info-grid">
                {[
                  ['Lagna','kr-info-val',kundali.lagna,kundali.lagnaEnglish],
                  ['Moon Sign','kr-info-val',kundali.planets?.find(p=>p.name==='Moon')?.sign,`${kundali.nakshatra} P${kundali.nakshatra_pada}`],
                  ['Sun Sign','kr-info-val',kundali.planets?.find(p=>p.name==='Sun')?.sign,kundali.planets?.find(p=>p.name==='Sun')?.english],
                ].map(([label,,val,sub])=>(
                  <div key={label} className="kr-info-card">
                    <div className="kr-info-label">{label}</div>
                    <div className="kr-info-val">{val}</div>
                    {sub&&<div className="kr-info-sub">{sub}</div>}
                  </div>
                ))}
              </div>
              <KundaliChart houses={kundali.houses} lagna={kundali.lagna} />
              <p className="kr-chart-note">North Indian Style · Lahiri Ayanamsa · Sidereal</p>
            </div>
          )}

          {/* PLANETS TAB */}
          {activeTab==='planets' && (
            <div>
              <div className="kr-planet-header">
                <div>Planet</div><div>Sign / Nakshatra</div><div>Degree</div><div>House</div><div>Strength</div>
              </div>
              {(kundali.planets||[]).map(p=>{
                const strStyle = ss[p.strength]||{background:'rgba(128,128,128,0.3)',color:'#ccc'};
                return (
                  <div key={p.name} className="kr-planet-row">
                    <div>
                      <div className="kr-planet-sym" style={{color:PLANET_COLORS[p.name]||'#ccc'}}>{PLANET_SYMBOLS[p.name]}</div>
                      <div className="kr-planet-name">{p.name}</div>
                    </div>
                    <div>
                      <div className="kr-planet-sign">{p.sign}</div>
                      <div className="kr-planet-nak">{p.nakshatra} P{p.pada}</div>
                      <div className="kr-planet-d9">D9: {p.navamsa}</div>
                    </div>
                    <div className="kr-planet-deg">{p.degreeDMS}</div>
                    <div className="kr-planet-house">{p.house}</div>
                    <div>
                      <span className="kr-strength-badge" style={strStyle}>{p.strength}</span>
                      {p.retrograde&&<div className="kr-retro">℞ Retro</div>}
                      {p.combust&&<div className="kr-combust">🔥 Combust</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PANCHANG TAB */}
          {activeTab==='panchang' && (
            <div>
              <div className="kr-section-title">Birth Panchang (पञ्चाङ्ग)</div>
              <div className="kr-info-grid">
                {[
                  ['Tithi',`${kundali.tithi_name} (${kundali.tithi_number})`],
                  ['Paksha',kundali.paksha],
                  ['Nakshatra',`${kundali.nakshatra} Pada ${kundali.nakshatra_pada}`],
                  ['Yoga (पञ्चाङ्ग)',kundali.yoga_name],
                  ['Karana',kundali.karana_name],
                  ['Ayanamsa',`${kundali.ayanamsa}°`],
                ].map(([label,val])=>(
                  <div key={label} className="kr-info-card">
                    <div className="kr-info-label">{label}</div>
                    <div className="kr-info-val">{val}</div>
                  </div>
                ))}
              </div>
              <div className="kr-section-title">Lagna & D9 Details</div>
              <div className="kr-info-grid">
                {[
                  ['Lagna Nakshatra',`${kundali.lagnaNakshatra} Pada ${kundali.lagnaPada}`],
                  ['Navamsa (D9) Lagna',kundali.d9_lagna],
                  ['Lagna Degree',kundali.lagnaDegree],
                  ['Julian Day',kundali.julian_day?.toFixed(2)],
                ].map(([label,val])=>(
                  <div key={label} className="kr-info-card">
                    <div className="kr-info-label">{label}</div>
                    <div className="kr-info-val">{val}</div>
                  </div>
                ))}
              </div>
              <div className="kr-note-box">
                <strong style={{color:'rgba(212,175,55,0.7)'}}>Yoga</strong> is the combined sum of Sun + Moon longitudes divided into 27 parts.<br/>
                <strong style={{color:'rgba(212,175,55,0.7)'}}>Karana</strong> is half a Tithi — there are 11 Karanas, 7 movable and 4 fixed.
              </div>
            </div>
          )}

          {/* DASHA TAB */}
          {activeTab==='dasha' && (
            <div>
              <div className="kr-info-grid">
                {[
                  ['Current Mahadasha', kundali.mahadasha, null],
                  ['Balance at Birth', kundali.dasha_balance, null],
                  ['Moon Nakshatra', kundali.nakshatra, `Pada ${kundali.nakshatra_pada}`],
                ].map(([label,val,sub])=>(
                  <div key={label} className="kr-info-card">
                    <div className="kr-info-label">{label}</div>
                    <div className="kr-info-val">{val}</div>
                    {sub&&<div className="kr-info-sub">{sub}</div>}
                  </div>
                ))}
              </div>
              <div className="kr-section-title">Antardasha within {kundali.mahadasha} Mahadasha</div>
              {(kundali.antardasha_list||[]).map((ad,i)=>(
                <div key={i} className={`kr-ad-row ${i===0?'current':''}`}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{color:PLANET_COLORS[ad.lord]||'#ccc',fontSize:20}}>{PLANET_SYMBOLS[ad.lord]||'•'}</span>
                    <div>
                      <div className="kr-ad-label" style={{color:i===0?'#D4AF37':'#e8d5a3',fontWeight:i===0?700:400}}>
                        {kundali.mahadasha} / {ad.lord}
                      </div>
                      {i===0&&<div className="kr-ad-current-tag">Currently Running</div>}
                    </div>
                  </div>
                  <div className="kr-ad-dates">{ad.start}<br/>{ad.end}</div>
                </div>
              ))}
            </div>
          )}

          {/* MARRIAGE TAB */}
          {activeTab==='marriage' && kundali.marriage_yoga && (
            <div>
              <div className="kr-info-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
                <div className="kr-info-card">
                  <div className="kr-info-label">Marriage Yoga</div>
                  <div className="kr-info-val" style={{color:kundali.marriage_yoga.present?'#90EE90':'#FF9999'}}>
                    {kundali.marriage_yoga.present?'✓ Present':'✗ Not Present'}
                  </div>
                </div>
                <div className="kr-info-card">
                  <div className="kr-info-label">Strength</div>
                  <div className="kr-info-val">{kundali.marriage_yoga.strength||'N/A'}</div>
                </div>
                <div className="kr-info-card">
                  <div className="kr-info-label">Marriage Type</div>
                  <div className="kr-info-val" style={{fontSize:12}}>{kundali.marriage_yoga.marriage_type||'N/A'}</div>
                </div>
                <div className="kr-info-card">
                  <div className="kr-info-label">Score</div>
                  <div className="kr-info-val">{kundali.marriage_yoga.score||0}/100</div>
                </div>
              </div>
              {kundali.marriage_yoga.note && (
                <div style={{background:'rgba(212,175,55,0.07)',border:'1px solid rgba(212,175,55,0.2)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:12,color:'rgba(255,255,255,0.6)',lineHeight:1.6}}>
                  ℹ️ {kundali.marriage_yoga.note}
                </div>
              )}
              <div className="kr-section-title">Upcoming Favorable Dasha Periods</div>
              {(kundali.marriage_yoga.favorable_periods||[]).length===0
                ? <div style={{color:'rgba(255,255,255,0.5)',padding:'10px',fontSize:13}}>No strong marriage periods in next 10 years.</div>
                : (kundali.marriage_yoga.favorable_periods||[]).map((p,i)=>(
                  <div key={i} className="kr-yoga-card present" style={{position:'relative'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <div style={{color:'#90EE90',fontWeight:700}}>{p.period}</div>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        {p.isRunning && <span style={{background:'#90EE90',color:'#000',fontSize:10,fontWeight:700,borderRadius:4,padding:'2px 6px'}}>RUNNING NOW</span>}
                        {p.years && <span style={{color:'rgba(212,175,55,0.8)',fontSize:12}}>{p.years}</span>}
                      </div>
                    </div>
                    <div className="kr-card-desc">{p.reason}</div>
                  </div>
                ))
              }
              <div className="kr-section-title">Delay Indicators</div>
              {(kundali.marriage_yoga.delay_indications||[]).length===0
                ? <div style={{color:'#90EE90',padding:'10px',fontSize:13}}>No major delay factors found.</div>
                : (kundali.marriage_yoga.delay_indications||[]).map((d,i)=>(
                  <div key={i} className="kr-dosha-card present">
                    <div className="kr-card-desc">⚠ {d}</div>
                  </div>
                ))
              }
              <div className="kr-section-title">Positive Indicators</div>
              {(kundali.marriage_yoga.reasons||[]).length===0
                ? <div style={{color:'rgba(255,255,255,0.4)',padding:'10px',fontSize:13}}>No exceptional placement found — marriage possible through normal dasha timing.</div>
                : (kundali.marriage_yoga.reasons||[]).map((r,i)=>(
                  <div key={i} className="kr-yoga-card present">
                    <div className="kr-card-desc">✨ {r}</div>
                  </div>
                ))
              }
            </div>
          )}

          {/* YOGAS TAB */}
          {activeTab==='yogas' && (
            <div>
              <div style={{fontSize:12,color:'rgba(212,175,55,0.55)',marginBottom:14}}>{activeYogas} yoga(s) active in your chart</div>
              {[...(kundali.yogas||[])].sort((a,b)=>Number(b.present)-Number(a.present)).map((y,i)=>(
                <div key={i} className={`kr-yoga-card ${y.present?'present':'absent'}`}>
                  <div className="kr-card-head">
                    <div className="kr-card-name" style={{color:y.present?'#90EE90':'rgba(255,255,255,0.35)'}}>{y.name}</div>
                    <span className="kr-strength-badge" style={{background:y.present?'rgba(50,200,100,0.2)':'rgba(128,128,128,0.2)',color:y.present?'#90EE90':'#aaa'}}>
                      {y.present?'✓ Active':'Absent'}
                    </span>
                  </div>
                  <div className="kr-card-desc" style={{opacity:y.present?1:0.5}}>{y.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* DOSHAS TAB */}
          {activeTab==='doshas' && (
            <div>
              <div style={{fontSize:12,color:'rgba(212,175,55,0.55)',marginBottom:14}}>{activeDoshas} dosha(s) present in your chart</div>
              {[...(kundali.doshas||[])].sort((a,b)=>Number(b.present)-Number(a.present)).map((d,i)=>(
                <div key={i} className={`kr-dosha-card ${d.present?'present':'absent'}`}>
                  <div className="kr-card-head">
                    <div className="kr-card-name" style={{color:d.present?'#FF6B6B':'#90EE90'}}>{d.name}</div>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      {d.present&&d.severity&&(
                        <span className="kr-strength-badge" style={{background:d.severity==='High'?'rgba(200,50,50,0.35)':d.severity==='Medium'?'rgba(220,120,0,0.35)':'rgba(128,128,128,0.35)',color:d.severity==='High'?'#ff9999':d.severity==='Medium'?'#ffb366':'#ccc'}}>
                          {d.severity}
                        </span>
                      )}
                      <span className="kr-strength-badge" style={{background:d.present?'rgba(150,0,0,0.35)':'rgba(50,150,80,0.25)',color:d.present?'#ff9999':'#90EE90'}}>
                        {d.present?'Present':'Clear'}
                      </span>
                    </div>
                  </div>
                  <div className="kr-card-desc">{d.description}</div>
                  {d.present&&(d.remedies||[]).length>0&&(
                    <div style={{marginTop:10}}>
                      <div className="kr-remedies-head">🙏 Remedies:</div>
                      {d.remedies.map((r,j)=>(
                        <div key={j} className="kr-remedy-item">• {r}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SCORES TAB */}
          {activeTab==='scores' && (
            <div>
              <div className="kr-section-title">Astrological Strength Scores</div>
              {Object.entries(kundali.scores||{}).map(([key,val])=>(
                <div key={key} className="kr-score-row">
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <div style={{fontSize:13,color:'#e8d5a3',textTransform:'capitalize'}}>{key.replace(/_/g,' ').replace('score','').trim()}</div>
                    <div style={{fontSize:13,color:'#D4AF37',fontWeight:700}}>{val}%</div>
                  </div>
                  <div className="kr-score-bar-wrap">
                    <div className={`kr-score-bar ${val>=70?'high':val>=40?'med':'low'}`} style={{width:`${val}%`}} />
                  </div>
                </div>
              ))}
              <div className="kr-note-box">
                Scores are calculated based on planetary positions, house placements, exaltation/debilitation, and aspect interactions using classical Vedic principles.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}