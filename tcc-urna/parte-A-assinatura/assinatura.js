/*
 * assinatura.js — Assinatura digital para o simulador de urna (ECDSA P-256 + SHA-256)
 * Usa a Web Crypto API do navegador (nada para instalar).
 *
 * Funções (todas async), conforme o acordo com a Parte B:
 *   gerarChaves()                                   -> { chavePublica, chavePrivada }
 *   assinar(texto, chavePrivada)                    -> assinatura em base64 (string)
 *   verificar(texto, assinaturaBase64, chavePublica)-> true ou false
 *   exportarChavePublica(chavePublica)              -> texto JSON (JWK), para mostrar na tela
 *
 * SIMULAÇÃO DIDÁTICA: não é o processo real do TSE.
 */

const ALGORITMO = { name: "ECDSA", namedCurve: "P-256" };
const PARAMS_ASSINATURA = { name: "ECDSA", hash: "SHA-256" };
const codificador = new TextEncoder(); // texto -> bytes UTF-8

// ---- auxiliares: bytes <-> base64 ----
function bytesParaBase64(bytes) {
  let binario = "";
  for (const b of new Uint8Array(bytes)) binario += String.fromCharCode(b);
  return btoa(binario);
}

function base64ParaBytes(base64) {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

// ---- funções principais ----
async function gerarChaves() {
  const par = await crypto.subtle.generateKey(ALGORITMO, true, ["sign", "verify"]);
  return { chavePublica: par.publicKey, chavePrivada: par.privateKey };
}

async function assinar(texto, chavePrivada) {
  const assinatura = await crypto.subtle.sign(
    PARAMS_ASSINATURA, chavePrivada, codificador.encode(texto)
  );
  return bytesParaBase64(assinatura);
}

async function verificar(texto, assinaturaBase64, chavePublica) {
  try {
    return await crypto.subtle.verify(
      PARAMS_ASSINATURA,
      chavePublica,
      base64ParaBytes(assinaturaBase64),
      codificador.encode(texto)
    );
  } catch (e) {
    return false; // assinatura malformada também conta como inválida
  }
}

async function exportarChavePublica(chavePublica) {
  const jwk = await crypto.subtle.exportKey("jwk", chavePublica);
  return JSON.stringify(jwk);
}

// Permite testar no Node (npm não necessário): node assinatura.js
if (typeof module !== "undefined") {
  module.exports = { gerarChaves, assinar, verificar, exportarChavePublica };
}

if (typeof require !== "undefined" && require.main === module) {
  (async () => {
    const corpo = "BOLETIM DE URNA (SIMULADO)\nSeção: 1\n13: 5\nTOTAL: 5";
    const { chavePublica, chavePrivada } = await gerarChaves();
    const ass = await assinar(corpo, chavePrivada);
    console.log("Original  :", await verificar(corpo, ass, chavePublica));
    console.log("Adulterado:", await verificar(corpo.replace("13: 5", "13: 6"), ass, chavePublica));
  })();
}