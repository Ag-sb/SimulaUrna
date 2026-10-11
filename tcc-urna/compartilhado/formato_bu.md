# Formato do Boletim de Urna (BU) simulado

> **Arquivo compartilhado.** Só altere este arquivo se a Pessoa A e a Pessoa B concordarem.
> Se mudar algo aqui, avise a outra pessoa e atualize a tabela de histórico no final.

**Status:** rascunho (versão 1)
**Aviso:** este BU é uma **simulação didática**. Não é o formato real do TSE.

---

## 1. Para que serve este arquivo

A Pessoa A cria a assinatura digital. A Pessoa B cria o simulador que gera o BU.
Para as duas partes se encaixarem no fim, as duas precisam concordar em **como o BU é escrito**.
Este arquivo é essa combinação.

---

## 2. Regras gerais

- O BU é um **texto simples** (`.txt`).
- Codificação: **UTF-8**.
- Quebra de linha: apenas `\n` (sem `\r`).
- **Sem linha em branco** no meio do BU.
- **Sem `\n` depois da última linha** do texto assinado (isso evita que um hash dê diferente por causa de uma quebra de linha a mais).
- Cada linha tem o formato `CHAVE: valor`.
- Os dados do eleitor **nunca** aparecem no BU (voto secreto). O BU só tem contagens.

---

## 3. Estrutura do BU

O BU tem **duas partes**:

1. **Corpo**: os dados da votação. É o texto que será protegido.
2. **Rodapé**: o hash e a assinatura, que protegem o corpo.

### 3.1 Corpo (ordem fixa)

| Ordem | Linha | Exemplo | Observação |
|---|---|---|---|
| 1 | `BOLETIM DE URNA (SIMULADO)` | — | Título fixo |
| 2 | `Seção: N` | `Seção: 2` | Número da seção |
| 3 | `13: N` | `13: 15` | Votos do candidato 13 |
| 4 | `22: N` | `22: 9` | Votos do candidato 22 |
| 5 | `45: N` | `45: 4` | Votos do candidato 45 |
| 6 | `BRANCO: N` | `BRANCO: 2` | Votos em branco |
| 7 | `NULO: N` | `NULO: 1` | Votos nulos |
| 8 | `TOTAL: N` | `TOTAL: 31` | Soma de todas as linhas acima |

Regra de conferência: `TOTAL` deve ser igual à soma de todos os candidatos + `BRANCO` + `NULO`.

### 3.2 Rodapé

| Linha | Exemplo | Quem implementa |
|---|---|---|
| `HASH SHA-256: <64 caracteres hexadecimais>` | `HASH SHA-256: 9f86d0...` | Pessoa B (já existe) |
| `ASSINATURA: <texto em base64>` | `ASSINATURA: MEUCIQD...` | Pessoa A gera, Pessoa B exibe |

- O **hash** é calculado sobre o **corpo** (linhas 1 a 8), em UTF-8, **sem** o rodapé.
- A **assinatura** é calculada sobre o **mesmo corpo**.
- Enquanto a assinatura não estiver integrada, a linha `ASSINATURA:` pode ficar com o valor `(não assinado)`.

---

## 4. Exemplo completo

```
BOLETIM DE URNA (SIMULADO)
Seção: 2
13: 15
22: 9
45: 4
BRANCO: 2
NULO: 1
TOTAL: 31
HASH SHA-256: <preenchido pelo simulador>
ASSINATURA: <preenchida após a integração>
```

---

## 5. Como cada parte usa o formato

**Pessoa B (simulador)**
- Monta o corpo exatamente como na seção 3.1.
- Calcula o hash do corpo e escreve o rodapé.
- Na totalização, confere o hash (e, depois, a assinatura) antes de somar.

**Pessoa A (assinatura)**
- Recebe o **texto do corpo** (string) e devolve a assinatura em **base64**.
- Também recebe corpo + assinatura + chave pública e devolve `true` ou `false`.

---

## 6. Pontos a decidir juntos

Marquem com `[x]` quando decidirem.

- [ ] Vamos incluir uma linha `Data/hora: ...` no corpo? (Se sim, entra **dentro** do corpo, antes do `TOTAL`.)
- [ ] Vamos incluir uma linha `Versão do formato: 1` no corpo?
- [ ] Algoritmo de assinatura final: **ECDSA P-256 com SHA-256** (sugerido, funciona no navegador) ou RSA-PSS (como na demo em Python)?
- [ ] Onde a chave pública fica guardada no simulador? (Sugestão: gerada na abertura da página e mostrada na tela.)
- [ ] Nome do arquivo ao exportar o BU. (Sugestão: `BU_secao_N.txt`.)

---

## 7. Histórico de mudanças

| Data | Quem alterou | O que mudou |
|---|---|---|
| (preencher) | (nome) | Versão inicial do rascunho |
