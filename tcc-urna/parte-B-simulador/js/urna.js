// ===== urna.js : dados, estado e interface da votação =====

// ---------- DADOS FICTÍCIOS ----------
const CANDIDATOS = {
  "67": "Reels da Silva(Partido Alfa)",
  "11": "Zé do Povo (Partido Beta)",
  "45": "Dona Maria (Partido Gama)",
  "76": "Espigão (Partido Delta)",
  "88": "Tizil (Partido Epsilon)"
};
const COR_CANDIDATO = {"67": "#b03a2e", "11": "#1f6fb2", "45": "#2e7d4f", "76": "#9c6b1f", "88": "#6b1f9c"};
const FOTO_CANDIDATO = {
  "67": "img/candidato67.jpg",
  "11": "img/candidato11.png",
  "45": "img/candidato45.jpg",
  "76": "img/candidato76.jpeg",
  "88": "img/candidato88.jpg"
};

const SOM_CLIQUE = new Audio("audio/clique.mp4");
const SOM_CONFIRMA = new Audio("audio/confirmar.mp4");
SOM_CLIQUE.preload = SOM_CONFIRMA.preload = "auto";

function tocar(som) {
  try { som.currentTime = 0; som.play().catch(() => {}); } catch (e) { /* sem áudio: segue sem som */ }
}
const SECOES = [1, 2, 3];

// Estado em memória. IMPORTANTE: guarda só CONTAGENS, nunca quem votou (voto secreto).
const urnas = {};
SECOES.forEach(s => urnas[s] = {contagem: {}, total: 0, encerrada: false});
const bus = []; // {secao, texto, hash, assinatura}

// Estado da tela do eleitor
let digitado = "";   // dígitos já digitados (0 a 2)
let branco = false;  // eleitor apertou BRANCO e ainda não confirmou
let fim = false;     // mostrando a tela "FIM" depois do voto
let aviso = "";      // mensagem de erro curta na tela
let fimTimer = null;

const sel = document.getElementById("secao");
SECOES.forEach(s => sel.add(new Option("Seção " + s, s)));
sel.onchange = () => { clearTimeout(fimTimer); fim = false; corrige(); };

// ---------- TELA ----------
function infoCandidato(n) {
  const c = CANDIDATOS[n];
  if (!c) return null;
  const m = c.match(/^(.*?) \((.*)\)$/);
  const nome = m ? m[1] : c;
  return {nome, partido: m ? m[2] : "", letra: nome.trim().slice(-1)};
}

function atualizaTela() {
  const t = document.getElementById("tela");
  const u = urnas[sel.value];
  document.getElementById("qtd").textContent = u.total;

  if (u.encerrada) {
    t.innerHTML = "<div class='t-titulo'>Seção encerrada</div>" +
      "<p>O boletim de urna foi impresso. Escolha outra seção para continuar.</p>";
    return;
  }
  if (fim) {
    t.innerHTML = "<div class='t-fim'>FIM<small>Voto registrado</small></div>";
    return;
  }
  if (branco) {
    t.innerHTML = "<div class='t-titulo'>Seu voto</div><div class='t-branco'>VOTO EM BRANCO</div>" +
      "<div class='t-dica'>Aperte CONFIRMA para votar ou CORRIGE para voltar.</div>";
    return;
  }

  let html = "<div class='t-titulo'>Seu voto</div><div class='num'>";
  for (let i = 0; i < 2; i++) html += "<span class='slot'>" + (digitado[i] || "") + "</span>";
  html += "</div>";

  if (digitado.length === 2) {
    const c = infoCandidato(digitado);
    if (c) {
            const url = FOTO_CANDIDATO[digitado];
      const estilo = "background:" + COR_CANDIDATO[digitado] + (url ? " url(" + url + ") center/cover no-repeat" : "");
      html += "<div class='cand'><div class='foto' style='" + estilo + "'>" + (url ? "" : c.letra) + "</div>" +
        "<div><div class='cand-nome'>" + c.nome + "</div><div class='cand-partido'>" + c.partido + "</div></div></div>";
    } else {
      html += "<div class='t-nulo'>Número errado. Se confirmar, o voto será nulo.</div>";
    }
    html += "<div class='t-dica'>Aperte CONFIRMA para votar ou CORRIGE para refazer.</div>";
  } else if (aviso) {
    html += "<div class='t-erro'>" + aviso + "</div>";
  } else {
    html += "<div class='t-dica'>Digite o número do candidato.</div>";
  }
  t.innerHTML = html;
}

// ---------- TECLAS ----------
function bloqueada() { return fim || urnas[sel.value].encerrada; }

function tecla(d) {
  if (bloqueada()) return;
  tocar(SOM_CLIQUE);
  aviso = ""; branco = false;
  if (digitado.length < 2) digitado += d;
  atualizaTela();
}

function brancoTecla() {
  if (bloqueada()) return;
  tocar(SOM_CLIQUE);
  aviso = ""; digitado = ""; branco = true;
  atualizaTela();
}

function corrige() {
  if (urnas[sel.value].encerrada) { atualizaTela(); return; }
  clearTimeout(fimTimer); fim = false;
  digitado = ""; branco = false; aviso = "";
  atualizaTela();
}

function confirma() {
  if (bloqueada()) return;
  if (branco) return votar("BRANCO");
  if (digitado.length < 2) {
    aviso = "Digite os 2 números ou aperte BRANCO.";
    atualizaTela();
    return;
  }
  votar(CANDIDATOS[digitado] ? digitado : "NULO");
}

function bip() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.08;
    o.start(); o.stop(ctx.currentTime + 0.25);
    setTimeout(() => ctx.close(), 400);
  } catch (e) { /* sem áudio: segue sem som */ }
}

function votar(opcao) {
  const u = urnas[sel.value];
  if (u.encerrada) return alert("Esta seção já foi encerrada.");
  u.contagem[opcao] = (u.contagem[opcao] || 0) + 1;
  u.total++;
  digitado = ""; branco = false; aviso = "";
  fim = true;
  tocar(SOM_CONFIRMA);
  atualizaTela();
  clearTimeout(fimTimer);
  fimTimer = setTimeout(() => { fim = false; atualizaTela(); }, 1600);
}

// Teclado do computador: números, Backspace, Esc/Delete e Enter
document.addEventListener("keydown", e => {
  const alvo = e.target.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(alvo)) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^\d$/.test(e.key)) tecla(e.key);
  else if (e.key === "Backspace") { if (!bloqueada()) { digitado = digitado.slice(0, -1); aviso = ""; atualizaTela(); } }
  else if (e.key === "Escape" || e.key === "Delete") corrige();
  else if (e.key === "Enter" && alvo !== "BUTTON") confirma();
});

atualizaTela();
