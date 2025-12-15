function diagnose() {
  const q1 = Number(document.getElementById("q1").value);
  let result = "";

  if (q1 <= 2) {
    result = "あなたは慎重派タイプです";
  } else if (q1 <= 4) {
    result = "あなたはバランス型です";
  } else {
    result = "あなたは学習意欲が高いタイプです";
  }

  document.getElementById("result").textContent = result;
}
