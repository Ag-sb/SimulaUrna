// ===== boletim.js : BU, hash, assinatura e exportação =====
// Formato: compartilhado/formato_bu.md (corpo = linhas 1..TOTAL; rodapé = HASH e ASSINATURA)
// Depende de ../parte-A-assinatura/assinatura.js (gerarChaves, assinar, verificar).

const NAO_ASSINADO = "(não assinado)";
const ASSINATURA_ATIVA = typeof gerarChaves === "function"
                      && typeof assinar === "function"
                      && typeof verificar === "function";

// ---------- HASH (SHA-256 via Web Crypto) ----------
// Só define se assinatura.js não tiver definido (evita conflito de nomes).
window.sha256 = window.sha256 || async function (texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
};

// ---------- CHAVES (geradas uma vez, na abertura; só em memória) ----------
let chaves = null;
const chavesPronta = ASSINATURA_ATIVA
  ? gerarChaves().then(c => (chaves = c))
  : Promise.resolve(null);

// ---------- MONTAGEM DO BU ----------
function montaTextoBU(secao, contagem, total) {
  const opcoes = [...Object.keys(CANDIDATOS), "BRANCO", "NULO"];
  const linhas = ["BOLETIM DE URNA (SIMULADO)", "Seção: " + secao];
  opcoes.forEach(o => linhas.push(o + ": " + (contagem[o] || 0)));
  linhas.push("TOTAL: " + total);
  return linhas.join("\n"); // sem \n no final (formato_bu.md, seção 2)
}

function rodapeBU(b) {
  return "HASH SHA-256: " + b.hash + "\nASSINATURA: " + (b.assinatura || NAO_ASSINADO);
}

async function encerrar() {
  const s = sel.value, u = urnas[s];
  if (u.encerrada) return alert("Já encerrada.");
  if (u.total === 0) return alert("Nenhum voto nesta seção.");
  u.encerrada = true;
  await chavesPronta;
  const texto = montaTextoBU(s, u.contagem, u.total);
  bus.push({
    secao: s,
    texto,
    hash: await sha256(texto),
    assinatura: ASSINATURA_ATIVA ? await assinar(texto, chaves.chavePrivada) : null
  });
  atualizaTela();
  renderBUs();
}

function renderBUs() {
  const div = document.getElementById("bus");
  if (!bus.length) return;
  div.innerHTML = bus.map((b, i) =>
    "<pre>" + b.texto + "\n" + rodapeBU(b) + "</pre>" +
    "<button onclick='exportarBU(" + i + ")'>Exportar BU da seção " + b.secao + " (.txt)</button>").join("");
}

// ---------- EXPORTAR ----------
function exportarBU(i) {
  const b = bus[i];
  const conteudo = b.texto + "\n" + rodapeBU(b);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([conteudo], {type: "text/plain;charset=utf-8"}));
  a.download = "BU_secao_" + b.secao + ".txt";
  a.click();
  URL.revokeObjectURL(a.href);
}

// Mostra se a assinatura digital está ativa
document.getElementById("statusAss").innerHTML = ASSINATURA_ATIVA
  ? "<span class='ok'>Assinatura digital ativa</span> (chaves geradas ao abrir a página; ficam só em memória)"
  : "<span class='erro'>Assinatura digital inativa</span> (assinatura.js não carregou; BUs saem como \"" + NAO_ASSINADO + "\")";
