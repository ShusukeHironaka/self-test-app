function diagnose() {
  const get = (id) => Number(document.getElementById(id).value);

  // 能力値（最大値）
  const MAX_VISION = 15;     // Q1-3 (5点×3)
  const MAX_EXEC = 15;       // Q4-6
  const MAX_ANALYSIS = 20;   // Q7-10 (5点×4)

  // スコア算出
  const vision = get("q1") + get("q2") + get("q3");
  const execution = get("q4") + get("q5") + get("q6");
  const analysis = get("q7") + get("q8") + get("q9") + get("q10");

  // タイプ判定（最も高い軸でざっくり）
  let typeKey = "strategy";
  if (vision >= execution && vision >= analysis) typeKey = "pm";
  else if (execution >= vision && execution >= analysis) typeKey = "eng";
  else if (analysis >= vision && analysis >= execution) typeKey = "data";

  const types = {
    pm: {
      title: "PMタイプ",
      badges: ["構想", "意思決定", "優先順位"],
      desc: "全体像を描き、曖昧さの中で方向性を決められるタイプ。複数の利害を整理して前に進めるのが強み。",
      next: [
        "ユーザー課題を1つに絞って、価値仮説を文章化する（A4 1枚）",
        "KPIを1つ決め、週次で『数字→仮説→打ち手』を回す",
        "ロードマップは“やらないこと”を先に書く"
      ],
      likeness: "織田信長 / ルルーシュ（コードギアス）"
    },
    eng: {
      title: "エンジニアタイプ",
      badges: ["実装", "試行錯誤", "積み上げ"],
      desc: "手を動かして形にし、改善を積み上げるタイプ。小さく作って早く回すのが得意。",
      next: [
        "小さな機能を毎日1つ『動く状態』にする",
        "エラーをログで追えるようにする（再現→原因→修正）",
        "設計は“変更に強い”分割（関数/責務）を意識"
      ],
      likeness: "ナポレオン / リヴァイ（進撃の巨人）"
    },
    data: {
      title: "データタイプ",
      badges: ["仮説検証", "構造化", "因果"],
      desc: "データから仮説を立て、検証して意思決定を支えるタイプ。因果をほどくのが強い。",
      next: [
        "『この数字が動く理由は何か？』を3仮説書く",
        "検証の最小単位を決める（期間・指標・比較対象）",
        "分析結果を“次の打ち手”に変換するテンプレを作る"
      ],
      likeness: "諸葛亮 / L（デスノート）"
    },
    strategy: {
      title: "ストラテジータイプ",
      badges: ["構造化", "戦略", "設計"],
      desc: "抽象と具体を行き来し、複雑な状況を整理して“勝ち筋”を作るタイプ。",
      next: [
        "論点をMECEに分け、優先順位を決める",
        "前提（市場/顧客/制約）を棚卸しして更新する",
        "『勝ち筋』を1行で言えるようにする"
      ],
      likeness: "徳川家康 / 夜神月（初期）"
    }
  };

  const t = types[typeKey];

  // 結果HTML（棒グラフ＋レーダー）
  document.getElementById("result").innerHTML = `
    <div class="card">
      <div class="kicker">RESULT</div>
      <h2 class="result-title">診断結果：${t.title}</h2>
      <div>
        ${t.badges.map(b => `<span class="badge">${b}</span>`).join("")}
      </div>
      <p class="result-desc">${t.desc}</p>

      <div class="grid">
        <div>
          <div class="kicker">STATS</div>

          <div class="bars">
            ${barRow("構想力", vision, MAX_VISION, "vision")}
            ${barRow("実行力", execution, MAX_EXEC, "execution")}
            ${barRow("分析力", analysis, MAX_ANALYSIS, "analysis")}
          </div>

          <p class="small">※ スコアは現時点の傾向。学習と経験で伸びます。</p>

          <div class="kicker">NEXT ACTION</div>
          <ul>
            ${t.next.map(x => `<li>${x}</li>`).join("")}
          </ul>

          <div class="kicker">LIKE YOU</div>
          <p>${t.likeness}</p>
        </div>

        <div>
          <div class="kicker">RADAR</div>
          <canvas id="radar" width="520" height="520"></canvas>
          <p class="small">3軸のバランスを可視化しています。</p>
        </div>
      </div>
    </div>
  `;

  // 棒グラフをアニメーションっぽく伸ばす
  requestAnimationFrame(() => {
    setFill("fill-vision", Math.round((vision / MAX_VISION) * 100));
    setFill("fill-execution", Math.round((execution / MAX_EXEC) * 100));
    setFill("fill-analysis", Math.round((analysis / MAX_ANALYSIS) * 100));
  });

  // レーダー描画（Canvas）
  drawRadar({
    vision, execution, analysis,
    max: { vision: MAX_VISION, execution: MAX_EXEC, analysis: MAX_ANALYSIS }
  });
}

// 棒グラフの1行
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

// --- Radar chart (canvas) ---
function drawRadar({ vision, execution, analysis, max }) {
  const canvas = document.getElementById("radar");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.34;

  // 正規化（0..1）
  const v = vision / max.vision;
  const e = execution / max.execution;
  const a = analysis / max.analysis;

  // 3点（上:構想 右下:実行 左下:分析）
  const angles = [
    -Math.PI / 2,           // vision
    -Math.PI / 2 + (2 * Math.PI / 3), // execution
    -Math.PI / 2 + (4 * Math.PI / 3)  // analysis
  ];

  const labels = ["構想力", "実行力", "分析力"];
  const values = [v, e, a];

  // 背景のグリッド（3段）
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(147,164,184,0.25)";
  ctx.fillStyle = "rgba(17,24,38,0.35)";
  for (let k = 1; k <= 3; k++) {
    const rr = (r * k) / 3;
    polygon(ctx, cx, cy, rr, angles, [1, 1, 1], true);
  }

  // 軸
  ctx.strokeStyle = "rgba(147,164,184,0.35)";
  for (let i = 0; i < 3; i++) {
    const x = cx + r * Math.cos(angles[i]);
    const y = cy + r * Math.sin(angles[i]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // データ面
  ctx.fillStyle = "rgba(94,234,212,0.18)";
  ctx.strokeStyle = "rgba(96,165,250,0.65)";
  ctx.lineWidth = 2;
  polygon(ctx, cx, cy, r, angles, values, true);

  // 点
  for (let i = 0; i < 3; i++) {
    const x = cx + r * values[i] * Math.cos(angles[i]);
    const y = cy + r * values[i] * Math.sin(angles[i]);
    ctx.fillStyle = "rgba(94,234,212,0.9)";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ラベル
  ctx.fillStyle = "rgba(232,238,246,0.9)";
  ctx.font = '14px ui-sans-serif, system-ui, -apple-system, "Noto Sans JP"';
  for (let i = 0; i < 3; i++) {
    const lx = cx + (r * 1.15) * Math.cos(angles[i]);
    const ly = cy + (r * 1.15) * Math.sin(angles[i]);
    ctx.fillText(labels[i], lx - 18, ly + 5);
  }

  // スコア表示
  ctx.fillStyle = "rgba(147,164,184,0.9)";
  ctx.font = '12px ui-sans-serif, system-ui, -apple-system, "Noto Sans JP"';
  ctx.fillText(`構想力: ${vision}/${max.vision}`, 18, h - 50);
  ctx.fillText(`実行力: ${execution}/${max.execution}`, 18, h - 32);
  ctx.fillText(`分析力: ${analysis}/${max.analysis}`, 18, h - 14);
}

function polygon(ctx, cx, cy, r, angles, values, fill) {
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const rr = r * values[i];
    const x = cx + rr * Math.cos(angles[i]);
    const y = cy + rr * Math.sin(angles[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (fill) ctx.fill();
  ctx.stroke();
}
