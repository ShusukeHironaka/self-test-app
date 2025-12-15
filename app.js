// 1〜10の選択肢を全selectに自動生成
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("select.scale").forEach(sel => {
    for (let i = 1; i <= 10; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = String(i);
      sel.appendChild(opt);
    }
    sel.value = "6"; // 初期値（中間より少し上）
  });
});

function diagnose() {
  const get = (id) => Number(document.getElementById(id).value);

  // 6軸（各2問、1〜10）
  const score = {
    vision: get("q1") + get("q2"),            // 2..20
    execution: get("q3") + get("q4"),         // 2..20
    analysis: get("q5") + get("q6"),          // 2..20
    collaboration: get("q7") + get("q8"),     // 2..20
    learning: get("q9") + get("q10"),         // 2..20
    creativity: get("q11") + get("q12"),      // 2..20
  };
  const MAX = 20;

  // 正規化（0..1）
  const n = Object.fromEntries(Object.entries(score).map(([k,v]) => [k, v / MAX]));

  // --- 職種スコア（重みづけ：複数出す） ---
  // ※「ITに寄りすぎ」を避けるため、職種は横断で定義（業界は別で提案）
  const roles = [
    { key:"pm", name:"プロダクトマネージャー", w:{ vision:0.25, collaboration:0.25, analysis:0.20, learning:0.15, execution:0.10, creativity:0.05 }},
    { key:"eng", name:"エンジニア / 開発",     w:{ execution:0.30, analysis:0.20, learning:0.20, vision:0.10, creativity:0.10, collaboration:0.10 }},
    { key:"data", name:"データアナリスト/サイエンス", w:{ analysis:0.35, learning:0.20, vision:0.15, execution:0.10, collaboration:0.10, creativity:0.10 }},
    { key:"consult", name:"コンサル / 戦略企画", w:{ vision:0.25, analysis:0.25, collaboration:0.20, learning:0.15, creativity:0.10, execution:0.05 }},
    { key:"ops", name:"事業運用 / オペレーション", w:{ execution:0.25, collaboration:0.20, analysis:0.20, learning:0.15, vision:0.10, creativity:0.10 }},
    { key:"design", name:"UX/デザイン/編集",    w:{ creativity:0.35, vision:0.20, collaboration:0.15, learning:0.15, analysis:0.10, execution:0.05 }},
    { key:"sales", name:"提案営業 / BizDev",    w:{ collaboration:0.35, execution:0.20, learning:0.15, vision:0.15, analysis:0.10, creativity:0.05 }},
    { key:"research", name:"研究 / R&D",        w:{ analysis:0.30, learning:0.30, vision:0.20, execution:0.10, creativity:0.10, collaboration:0.00 }},
  ];

  const roleScores = roles.map(r => ({
    ...r,
    score: weighted(n, r.w)
  })).sort((a,b)=>b.score-a.score);

  const topRoles = roleScores.slice(0, 3);

  // --- 業界おすすめ（IT偏り回避：能力“活き方”で出す） ---
  // ※業界は「向く/向かない」ではなく「活躍のしやすい環境傾向」程度にする
  const industries = [
    { name:"製造・サプライチェーン", w:{ execution:0.25, analysis:0.20, collaboration:0.20, vision:0.15, learning:0.10, creativity:0.10 }},
    { name:"金融・保険", w:{ analysis:0.35, learning:0.20, vision:0.15, execution:0.10, collaboration:0.10, creativity:0.10 }},
    { name:"ヘルスケア・製薬", w:{ analysis:0.30, learning:0.25, collaboration:0.15, vision:0.15, execution:0.10, creativity:0.05 }},
    { name:"小売・消費財", w:{ collaboration:0.20, execution:0.20, analysis:0.15, vision:0.15, learning:0.15, creativity:0.15 }},
    { name:"エンタメ・メディア", w:{ creativity:0.35, collaboration:0.15, vision:0.20, learning:0.15, analysis:0.05, execution:0.10 }},
    { name:"公共・教育・NPO", w:{ collaboration:0.25, vision:0.20, learning:0.20, execution:0.15, analysis:0.10, creativity:0.10 }},
    { name:"不動産・建設", w:{ execution:0.25, collaboration:0.20, vision:0.20, analysis:0.15, learning:0.10, creativity:0.10 }},
    { name:"IT・プロダクト", w:{ learning:0.20, execution:0.20, analysis:0.20, vision:0.15, collaboration:0.15, creativity:0.10 }},
  ];
  const industryScores = industries.map(x => ({...x, score: weighted(n, x.w)}))
                                   .sort((a,b)=>b.score-a.score)
                                   .slice(0,3);

  // --- 人物/キャラ（時代/作品で差し替え可能な棚：まずは例を入れる） ---
  // ※ここはあとで“あなたの好み”に合わせて差し替えるのが正解
  const library = {
    history: [
      { name:"織田信長", tag:["vision","execution"], era:"戦国" },
      { name:"徳川家康", tag:["vision","collaboration"], era:"戦国" },
      { name:"諸葛亮", tag:["analysis","vision"], era:"三国志" },
      { name:"ナポレオン", tag:["execution","vision"], era:"近代" },
      { name:"ダーウィン", tag:["analysis","learning"], era:"近代" },
      { name:"レオナルド・ダ・ヴィンチ", tag:["creativity","learning"], era:"ルネサンス" },
    ],
    anime: [
      { name:"ルルーシュ（コードギアス）", tag:["vision","collaboration"], work:"コードギアス" },
      { name:"L（デスノート）", tag:["analysis","learning"], work:"デスノート" },
      { name:"夜神月（初期・デスノート）", tag:["vision","analysis"], work:"デスノート" },
      { name:"リヴァイ（進撃の巨人）", tag:["execution","collaboration"], work:"進撃の巨人" },
      { name:"岡部倫太郎（シュタゲ）", tag:["learning","creativity"], work:"STEINS;GATE" },
      { name:"槙島聖護（PSYCHO-PASS）", tag:["vision","analysis"], work:"PSYCHO-PASS" },
    ],
  };

  const topAxes = Object.entries(score).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]); // 上位2軸
  const hist = pickByTags(library.history, topAxes).slice(0,3);
  const anim = pickByTags(library.anime, topAxes).slice(0,3);

  // --- 描画（カード＋棒＋6角レーダー） ---
  document.getElementById("result").innerHTML = `
    <div class="card">
      <div class="kicker">RESULT</div>

      <h2 class="result-title">おすすめ職種（上位3つ）</h2>
      <p class="result-desc">上位は「向き/不向き」ではなく、現時点の強みの出やすさです。</p>
      <ul>
        ${topRoles.map(r => `<li><strong>${r.name}</strong>（適性スコア ${toPct(r.score)}）</li>`).join("")}
      </ul>

      <div class="kicker">INDUSTRY</div>
      <div>
        ${industryScores.map(x => `<span class="badge">${x.name} ${toPct(x.score)}</span>`).join("")}
      </div>

      <div class="grid" style="margin-top:12px;">
        <div>
          <div class="kicker">STATS</div>
          <div class="bars">
            ${barRow("構想力", score.vision, 20, "vision")}
            ${barRow("実行力", score.execution, 20, "execution")}
            ${barRow("分析力", score.analysis, 20, "analysis")}
            ${barRow("巻き込み", score.collaboration, 20, "collaboration")}
            ${barRow("学習力", score.learning, 20, "learning")}
            ${barRow("創造力", score.creativity, 20, "creativity")}
          </div>
          <p class="small">上位軸：<strong>${axisJa(topAxes[0])}</strong> / <strong>${axisJa(topAxes[1])}</strong></p>

          <div class="kicker">LIKE YOU</div>
          <p><strong>歴史：</strong>${hist.map(x=>x.name).join(" / ") || "（該当なし）"}</p>
          <p><strong>アニメ：</strong>${anim.map(x=>x.name).join(" / ") || "（該当なし）"}</p>

          <p class="small">※作品/時代の棚はあとで増やせます（あなたの好みで“知的寄せ”しやすい）。</p>
        </div>

        <div>
          <div class="kicker">RADAR (6)</div>
          <canvas id="radar6" width="560" height="560"></canvas>
          <p class="small">6軸のバランス（六角形）。</p>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    setFill("fill-vision", pct(score.vision, 20));
    setFill("fill-execution", pct(score.execution, 20));
    setFill("fill-analysis", pct(score.analysis, 20));
    setFill("fill-collaboration", pct(score.collaboration, 20));
    setFill("fill-learning", pct(score.learning, 20));
    setFill("fill-creativity", pct(score.creativity, 20));
  });

  drawRadar6(score);
}

function weighted(n, w) {
  let s = 0;
  for (const k of Object.keys(w)) s += (n[k] ?? 0) * w[k];
  return s; // 0..1
}
function toPct(x){ return Math.round(x*100) + "%"; }
function pct(v,max){ return Math.round((v/max)*100); }

function barRow(label, value, max, key) {
  return `
    <div class="row">
      <div class="label">${label}</div>
      <div class="track"><div class="fill" id="fill-${key}"></div></div>
      <div class="value">${value}/${max}</div>
    </div>
  `;
}
function setFill(id, pct) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = Math.max(0, Math.min(100, pct)) + "%";
}

function axisJa(k){
  return ({
    vision:"構想力", execution:"実行力", analysis:"分析力",
    collaboration:"巻き込み力", learning:"学習力", creativity:"創造力"
  })[k] || k;
}

function pickByTags(list, topAxes){
  // 上位2軸にどれだけ合うかで並べる
  return list.map(x => ({
    ...x,
    fit: x.tag.filter(t => topAxes.includes(t)).length
  }))
  .filter(x => x.fit > 0)
  .sort((a,b)=>b.fit-a.fit);
}

// ---- Radar6 (Canvas) ----
function drawRadar6(score){
  const canvas = document.getElementById("radar6");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  const cx = w/2, cy = h/2;
  const r = Math.min(w,h) * 0.33;

  const axes = [
    {k:"vision", label:"構想"},
    {k:"analysis", label:"分析"},
    {k:"learning", label:"学習"},
    {k:"collaboration", label:"巻込"},
    {k:"execution", label:"実行"},
    {k:"creativity", label:"創造"},
  ];

  // 角度（上から時計回り）
  const angles = axes.map((_,i)=> -Math.PI/2 + (2*Math.PI*i/6));

  // 背景グリッド
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(147,164,184,0.25)";
  ctx.fillStyle = "rgba(17,24,38,0.35)";
  for (let k=1;k<=4;k++){
    polygonN(ctx,cx,cy,r*(k/4),angles,new Array(6).fill(1),true);
  }

  // 軸線
  ctx.strokeStyle = "rgba(147,164,184,0.35)";
  for (let i=0;i<6;i++){
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(cx + r*Math.cos(angles[i]), cy + r*Math.sin(angles[i]));
    ctx.stroke();
  }

  // データ（0..1）
  const values = axes.map(a => (score[a.k] ?? 0) / 20);

  // 面
  ctx.fillStyle = "rgba(94,234,212,0.18)";
  ctx.strokeStyle = "rgba(96,165,250,0.65)";
  ctx.lineWidth = 2;
  polygonN(ctx,cx,cy,r,angles,values,true);

  // 点
  for (let i=0;i<6;i++){
    const x = cx + r*values[i]*Math.cos(angles[i]);
    const y = cy + r*values[i]*Math.sin(angles[i]);
    ctx.fillStyle = "rgba(94,234,212,0.9)";
    ctx.beginPath(); ctx.arc(x,y,4.5,0,Math.PI*2); ctx.fill();
  }

  // ラベル
  ctx.fillStyle = "rgba(232,238,246,0.9)";
  ctx.font = '14px ui-sans-serif, system-ui, -apple-system, "Noto Sans JP"';
  for (let i=0;i<6;i++){
    const lx = cx + (r*1.18)*Math.cos(angles[i]);
    const ly = cy + (r*1.18)*Math.sin(angles[i]);
    ctx.fillText(axes[i].label, lx-14, ly+6);
  }
}

function polygonN(ctx,cx,cy,r,angles,values,fill){
  ctx.beginPath();
  for (let i=0;i<angles.length;i++){
    const rr = r*values[i];
    const x = cx + rr*Math.cos(angles[i]);
    const y = cy + rr*Math.sin(angles[i]);
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  if (fill) ctx.fill();
  ctx.stroke();
}
