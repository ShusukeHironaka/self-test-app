function diagnose() {
  const get = (id) => Number(document.getElementById(id).value);

  // 能力値スコア
  const vision = get("q1") + get("q2") + get("q3");
  const execution = get("q4") + get("q5") + get("q6");
  const analysis = get("q7") + get("q8") + get("q9") + get("q10");

  let type = "";
  let detail = "";
  let character = "";

  if (vision >= execution && vision >= analysis) {
    type = "PMタイプ";
    detail = "構想力が高く、全体を見渡しながら意思決定する力があります。";
    character = "織田信長 / ルルーシュ（コードギアス）";
  } else if (execution >= vision && execution >= analysis) {
    type = "エンジニアタイプ";
    detail = "実行力が高く、手を動かして価値を生み出すことに強みがあります。";
    character = "ナポレオン / リヴァイ（進撃の巨人）";
  } else if (analysis >= vision && analysis >= execution) {
    type = "データタイプ";
    detail = "分析力が高く、構造化・仮説検証を得意とします。";
    character = "諸葛亮 / L（デスノート）";
  } else {
    type = "ストラテジータイプ";
    detail = "全体と細部のバランスに優れ、戦略設計に向いています。";
    character = "徳川家康 / 夜神月（初期）";
  }

  document.getElementById("result").innerHTML = `
    <h2>診断結果：${type}</h2>
    <p>${detail}</p>

    <h3>能力値</h3>
    <ul>
      <li>構想力：${vision}</li>
      <li>実行力：${execution}</li>
      <li>分析力：${analysis}</li>
    </ul>

    <h3>能力が似ている人物・キャラクター</h3>
    <p>${character}</p>
  `;
}
