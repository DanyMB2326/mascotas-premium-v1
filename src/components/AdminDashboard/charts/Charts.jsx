/* =====================================================
   CHART COMPONENTS — SVG, zero dependencias externas
   ===================================================== */

// ── Bar Chart ──────────────────────────────────────────
export const BarChart = ({ data = [], color = '#F59E0B', height = 120 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 100 / data.length;

  return (
    <svg viewBox={`0 0 ${data.length * 40} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barH = (d.value / max) * (height - 20);
        const x    = i * 40 + 4;
        const y    = height - barH - 4;
        return (
          <g key={i}>
            <rect x={x} y={y} width={32} height={barH} rx={4} fill="url(#barGrad)" />
            <title>{d.label}: {d.value}</title>
          </g>
        );
      })}
    </svg>
  );
};

// ── Line / Area Chart ──────────────────────────────────
export const LineChart = ({ data = [], color = '#F59E0B', height = 120 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value));
  const W   = 300;
  const H   = height;
  const pad = 10;

  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.value - min) / (max - min || 1)) * (H - pad * 2);
    return [x, y];
  });

  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1][0]},${H - pad} L${pts[0][0]},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`areaGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#areaGrad-${color.replace('#','')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={color} opacity={i === pts.length - 1 ? 1 : 0.6}>
          <title>{data[i].label}: {data[i].value}</title>
        </circle>
      ))}
    </svg>
  );
};

// ── Donut / Pie Chart ──────────────────────────────────
export const DonutChart = ({ segments = [], size = 120 }) => {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const r  = 40;
  const cx = size / 2;
  const cy = size / 2;
  const strokeW = 20;

  let cumAngle = -90;

  const arcs = segments.map(seg => {
    const pct  = seg.value / total;
    const span = pct * 360;
    const start = cumAngle;
    cumAngle += span;

    const toRad = a => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(start + span - 0.5));
    const y2 = cy + r * Math.sin(toRad(start + span - 0.5));
    const large = span > 180 ? 1 : 0;

    return {
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      color: seg.color,
      pct: Math.round(pct * 100),
      label: seg.label,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1C2333" strokeWidth={strokeW} />
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth={strokeW - 2} strokeLinecap="round">
          <title>{arc.label}: {arc.pct}%</title>
        </path>
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#F1F5F9" fontSize="12" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#94A3B8" fontSize="8">total</text>
    </svg>
  );
};

// ── Spark Line (tiny inline trend) ───────────────────
export const SparkLine = ({ values = [], color = '#F59E0B', width = 60, height = 24 }) => {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};
