# Parte A — Demonstração de assinatura digital

**Responsável:** (escrever o nome da Pessoa A)
**Branch do Git:** `parte-a`

> Regra de ouro: **só edite arquivos desta pasta.**
> Se precisar mudar algo na pasta da Parte B ou em `compartilhado/`, combine com a Pessoa B.

---

## O que esta parte mostra

Que a **assinatura digital** detecta qualquer alteração em um arquivo.
A demonstração segue estes passos:

1. Um "programa fictício da urna" é criado.
2. O "TSE" gera um par de chaves (pública e privada).
3. O "TSE" assina o programa com a chave privada.
4. Verificamos a assinatura com a chave pública: **válida**.
5. Alteramos **1 byte** do programa.
6. Verificamos de novo: **inválida**.
7. Mostramos que o hash SHA-256 muda muito com uma alteração mínima (efeito avalanche).

> **Lembrete:** é uma simulação didática. Não é o software real da urna nem o processo real do TSE.

---

## Arquivos desta pasta

| Arquivo | Função |
|---|---|
| `demo_assinatura.py` | Demonstração em Python (RSA-PSS + SHA-256) |
| `assinatura.js` | Versão em JavaScript, que a Parte B vai usar no simulador |
| `requirements.txt` | Bibliotecas Python necessárias |
| `exemplos/` | Arquivo de exemplo e assinatura gerada (`.sig`) |

---

## Como rodar

```bash
cd parte-A-assinatura
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux ou Mac
pip install -r requirements.txt
python demo_assinatura.py
```

**Resultado esperado:** o programa original aparece com `Assinatura OK? True`, e o adulterado com `Assinatura OK? False`.

---

## Lista de tarefas

Marque `[x]` conforme for concluindo.

**Entender**
- [ ] Rodar a demo e confirmar que funciona
- [ ] Saber explicar com palavras simples: o que é hash, chave pública, chave privada e assinatura

**Melhorar a demo em Python**
- [ ] Ler um arquivo real da pasta `exemplos/` em vez do texto fixo
- [ ] Salvar a assinatura em um arquivo `.sig`
- [ ] Mostrar o resultado no terminal com ✔ e ✘
- [ ] Salvar a chave pública em arquivo (**nunca** subir a chave privada para o GitHub)

**Entregar para a Parte B**
- [ ] Criar `assinatura.js` com ECDSA P-256 e SHA-256 (Web Crypto API)
- [ ] Testar o `assinatura.js` sozinho antes de entregar

**Documentação**
- [ ] Tirar prints (nome: `A_01_...png`, na pasta `prints/`)
- [ ] Escrever o texto da seção "Demonstração de assinatura digital" em `docs/`

---

## Contrato com a Parte B (o que o `assinatura.js` deve oferecer)

Funções combinadas (os nomes podem mudar se vocês decidirem juntos):

```js
gerarChaves()                              // devolve { chavePublica, chavePrivada }
assinar(texto, chavePrivada)               // devolve a assinatura em base64 (string)
verificar(texto, assinaturaBase64, chavePublica)  // devolve true ou false
```

- O `texto` é o **corpo do BU**, como definido em `compartilhado/formato_bu.md`.
- Todas as funções são `async` (a Web Crypto API trabalha assim).

---

## Cuidados

- **Nunca** suba chaves privadas (`.key`, `.pem`) para o GitHub. O `.gitignore` já ajuda, mas confira antes do `git push`.
- A Web Crypto API (JavaScript) e a biblioteca `cryptography` (Python) escrevem assinaturas ECDSA em formatos diferentes. Se quiserem verificar no Python uma assinatura feita no JS (ou o contrário), será preciso converter. Se não for necessário, ignorem este ponto.
- Faça commits pequenos, com mensagens claras (`git commit -m "salva assinatura em .sig"`).

---

## Anotações da Pessoa A

(Espaço livre para dúvidas, descobertas e coisas para lembrar na banca.)
