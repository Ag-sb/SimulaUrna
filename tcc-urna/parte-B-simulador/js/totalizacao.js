// ===== totalizacao.js : apuração, adulteração e modo partido fiscal =====

const REGEX_LINHA_VOTO = /^(\d{2}|BRANCO|NULO): (\d+)$/;

// Verifica hash + assinatura de um corpo de BU. Devolve {hashOk, assOk, ok}
async function conferirBU(texto, hash, assinatura) {
  const hashOk = (await sha256(texto)) === hash;
  let assOk = true;
  if (ASSINATURA_ATIVA) {
    await chavesPronta;
    try { assOk = !!assinatura && await verificar(texto, assinatura, chaves.chavePublica); }
    catch (e) { assOk = false; }
  }
  return {hashOk, assOk, ok: hashOk && assOk};
}

function somaConfere(corpo) {
  let soma = 0, total = null;
  corpo.split("\n").forEach(l => {
    const m = l.match(REGEX_LINHA_VOTO);
    if (m) soma += Number(m[2]);
    const t = l.match(/^TOTAL: (\d+)$/);
    if (t) total = Number(t[1]);
  });
  return total !== null && soma === total;
}

// ---------- TOTALIZAÇÃO ----------
async function totalizar() {
  if (!bus.length) return alert("Encerre ao menos uma seção.");
  const soma = {};
  let html = "<table><tr><th>BU</th><th>Hash</th><th>Assinatura</th><th>Situação</th></tr>";
  for (const b of bus) {
    const r = await conferirBU(b.texto, b.hash, b.assinatura);
    const cel = ok => "<td class='" + (ok ? "ok'>✔" : "erro'>✘") + "</td>";
    html += "<tr><td>Seção " + b.secao + "</td>" + cel(r.hashOk) +
            (ASSINATURA_ATIVA ? cel(r.assOk) : "<td>—</td>") +
            "<td class='" + (r.ok ? "ok'>Íntegro" : "erro'>REJEITADO (fora da soma)") + "</td></tr>";
    if (!r.ok) continue; // BU adulterado não entra na soma
    b.texto.split("\n").forEach(l => {
      const m = l.match(REGEX_LINHA_VOTO);
      if (m) soma[m[1]] = (soma[m[1]] || 0) + Number(m[2]);
    });
  }
  html += "</table><h2 style='margin-top:12px'>Resultado</h2><table>";
  Object.keys(soma).forEach(k =>
    html += "<tr><td>" + (CANDIDATOS[k] ? k + " - " + CANDIDATOS[k] : k) + "</td><td>" + soma[k] + "</td></tr>");
  document.getElementById("totais").innerHTML = html + "</table>";
}

// Altera o texto do primeiro BU SEM recalcular hash nem assinatura: a conferência detecta.
function adulterar() {
  if (!bus.length) return alert("Gere um BU primeiro.");
  bus[0].texto = bus[0].texto.replace(/(45: )(\d+)/, (m, a, n) => a + (Number(n) + 100));
  renderBUs();
  alert("BU da seção " + bus[0].secao + " adulterado. Clique em 'Totalizar' para ver a detecção.");
}

// ---------- MODO PARTIDO FISCAL ----------
// O fiscal cola o BU impresso; o sistema confere com o BU que está registrado.
async function conferirFiscal() {
  const saida = document.getElementById("fiscalSaida");
  const linhas = document.getElementById("fiscalEntrada").value
    .replace(/\r/g, "").trim().split("\n").map(l => l.trimEnd());
  const iH = linhas.findIndex(l => l.startsWith("HASH SHA-256:"));
  if (iH < 1) { saida.innerHTML = "<span class='erro'>BU inválido: linha HASH SHA-256 não encontrada.</span>"; return; }

  const corpo = linhas.slice(0, iH).join("\n");
  const hashInf = linhas[iH].slice("HASH SHA-256:".length).trim();
  const lAss = linhas.find(l => l.startsWith("ASSINATURA:"));
  const assInf = lAss ? lAss.slice("ASSINATURA:".length).trim() : "";
  const assValida = assInf && assInf !== NAO_ASSINADO ? assInf : null;
  const secao = (corpo.match(/^Seção: (\d+)$/m) || [])[1];
  const registrado = bus.find(b => String(b.secao) === secao);

  const r = await conferirBU(corpo, hashInf, assValida);
  const itens = [
    ["Soma das linhas = TOTAL", somaConfere(corpo)],
    ["Hash do papel confere com o texto", r.hashOk],
    ["Assinatura digital válida", ASSINATURA_ATIVA ? r.assOk : null],
    ["Texto idêntico ao BU registrado no sistema", registrado ? registrado.texto === corpo : false]
  ];
  saida.innerHTML = "<table>" + itens.map(([nome, ok]) =>
    "<tr><td>" + nome + "</td><td class='" + (ok === null ? "'>n/a" : ok ? "ok'>✔" : "erro'>✘") + "</td></tr>").join("") + "</table>" +
    (registrado ? "" : "<p class='erro'>Seção " + (secao || "?") + " não encontrada entre os BUs registrados.</p>");
}
