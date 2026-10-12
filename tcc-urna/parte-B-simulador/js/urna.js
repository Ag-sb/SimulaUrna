// ===== urna.js : dados, estado e interface da votação =====

// ---------- DADOS FICTÍCIOS ----------
const CANDIDATOS = {
  "13": "Candidato A (Partido Alfa)",
  "22": "Candidata B (Partido Beta)",
  "45": "Candidato C (Partido Gama)"
};
const SECOES = [1, 2, 3];

// Estado em memória. IMPORTANTE: guarda só CONTAGENS, nunca quem votou (voto secreto).
const urnas = {};
SECOES.forEach(s => urnas[s] = {contagem: {}, total: 0, encerrada: false});
const bus = []; // {secao, texto, hash, assinatura}

let digitado = "";

// ---------- INTERFACE DA URNA ----------
const sel = document.getElementById("secao");
SECOES.forEach(s => sel.add(new Option("Seção " + s, s)));
sel.onchange = atualizaTela;

document.getElementById("numero").addEventListener("input", e => {
  digitado = e.target.value.replace(/\D/g, "").slice(0, 2);
  e.target.value = digitado;
  atualizaTela();
});

function atualizaTela() {
  const t = document.getElementById("tela");
  const u = urnas[sel.value];
  document.getElementById("qtd").textContent = u.total;
  if (u.encerrada) { t.textContent = "Seção encerrada."; return; }
  if (digitado.length < 2) { t.textContent = "Número: " + (digitado || "__"); return; }
  t.innerHTML = "Número: <b>" + digitado + "</b><br>" +
    (CANDIDATOS[digitado] || "<b>NÚMERO ERRADO (voto nulo)</b>");
}

function corrige() { digitado = ""; document.getElementById("numero").value = ""; atualizaTela(); }

function confirma() {
  if (digitado.length < 2) return alert("Digite os 2 dígitos ou use BRANCO.");
  votar(CANDIDATOS[digitado] ? digitado : "NULO");
}

function votar(opcao) {
  const u = urnas[sel.value];
  if (u.encerrada) return alert("Esta seção já foi encerrada.");
  u.contagem[opcao] = (u.contagem[opcao] || 0) + 1;
  u.total++;
  corrige();
  document.getElementById("tela").textContent = "FIM — voto registrado.";
  document.getElementById("qtd").textContent = u.total;
}

atualizaTela();
