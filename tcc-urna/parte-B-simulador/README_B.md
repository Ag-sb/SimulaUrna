# Parte B — Simulador didático de urna e apuração

**Responsável:** (escrever o nome da Pessoa B)
**Branch do Git:** `parte-b`

> Regra de ouro: **só edite arquivos desta pasta.**
> Se precisar mudar algo na pasta da Parte A ou em `compartilhado/`, combine com a Pessoa A.

---

## O que esta parte mostra

Um simulador que reproduz, de forma simplificada, o caminho de uma votação:

1. **Votação** em uma urna, com voto secreto (o sistema guarda só contagens, nunca quem votou).
2. **Encerramento** da seção e geração do **Boletim de Urna (BU)** com hash SHA-256.
3. **Totalização**, que confere a integridade de cada BU antes de somar.
4. **Adulteração simulada**: alteramos um BU e a conferência acusa o problema.

> **Lembrete:** candidatos e partidos são **fictícios**, e o aviso de simulação deve continuar visível na tela. Não é a urna real.

---

## Arquivos desta pasta

| Arquivo | Função |
|---|---|
| `simulador_urna.html` | Página principal (hoje com CSS e JS dentro do mesmo arquivo) |
| `css/estilo.css` | Estilo visual (para onde mover o CSS, se separarem) |
| `js/urna.js` | Lógica da votação (digitar, confirmar, branco, corrigir) |
| `js/boletim.js` | Montagem do BU e cálculo do hash |
| `js/totalizacao.js` | Soma dos BUs, conferência e modo "partido fiscal" |
| `bus_exportados/` | BUs salvos em `.txt` |

Separar o HTML em vários arquivos é **opcional**, mas deixa o código mais organizado.
Se separarem, o HTML deve carregar os scripts nesta ordem: `urna.js`, `boletim.js`, `totalizacao.js`.

---

## Como rodar

**Opção 1 (mais simples):** dar dois cliques no `simulador_urna.html`.

**Opção 2 (recomendada):** no VS Code, instalar a extensão **Live Server**, clicar com o botão direito no `simulador_urna.html` e escolher **Open with Live Server**.
Isso evita problemas com o cálculo do hash em alguns navegadores.

---

## Lista de tarefas

Marque `[x]` conforme for concluindo.

**Entender**
- [ ] Testar o fluxo completo: votar, encerrar, totalizar, adulterar
- [ ] Ler o código e saber explicar o que cada função faz

**Melhorar o simulador**
- [ ] Deixar a interface mais parecida com uma urna
- [ ] Permitir mais seções e mais candidatos
- [ ] Botão para **exportar o BU** como arquivo `.txt` (nome sugerido: `BU_secao_N.txt`)
- [ ] Modo **"partido fiscal"**: o usuário digita os números de um BU impresso e o sistema compara com o total
- [ ] Mostrar na tela um "lacre" com número de série (opcional)

**Preparar a integração com a Parte A**
- [ ] Seguir o formato de `compartilhado/formato_bu.md` ao montar o BU
- [ ] Criar o campo `ASSINATURA:` no BU, com o valor `(não assinado)` por enquanto
- [ ] Deixar um ponto claro no código onde a função `assinar()` será chamada
- [ ] Deixar um ponto claro no código onde a função `verificar()` será chamada

**Documentação**
- [ ] Tirar prints (nome: `B_01_...png`, na pasta `prints/`)
- [ ] Escrever o texto da seção "Simulador de urna e apuração" em `docs/`

---

## Contrato com a Parte A (o que o simulador espera do `assinatura.js`)

```js
gerarChaves()                              // devolve { chavePublica, chavePrivada }
assinar(texto, chavePrivada)               // devolve a assinatura em base64 (string)
verificar(texto, assinaturaBase64, chavePublica)  // devolve true ou false
```

- O `texto` que o simulador envia é o **corpo do BU** (linhas 1 a 8 de `formato_bu.md`), **sem** o rodapé.
- As funções são `async`: use `await` ao chamá-las.
- Na totalização, um BU só entra na soma se o **hash** e (depois da integração) a **assinatura** forem válidos.

---

## Cuidados

- **Não guarde dados do eleitor.** O objetivo é ilustrar o voto secreto: só contagens.
- **Não mude o formato do BU sozinho(a).** Qualquer mudança passa pela Pessoa A e por `formato_bu.md`.
- Antes de fazer uma mudança grande, **copie o arquivo** (`simulador_v1.html`) e trabalhe na cópia.
- Faça commits pequenos, com mensagens claras (`git commit -m "adiciona exportação de BU"`).

---

## Limitações (para citar no TCC)

- É uma simulação didática, sem hardware, sem criptografia do voto real e sem o fluxo completo do TSE.
- Os dados ficam só na memória do navegador. Ao recarregar a página, tudo é perdido.
- Candidatos, partidos e números são fictícios.

---

## Anotações da Pessoa B

(Espaço livre para dúvidas, descobertas e coisas para lembrar na banca.)
