# vibecodefriendly

> **Mantém o vibe da sua IA.** Um guardrail amigável para código gerado por IA — detecção de desvio (drift) e sanity check em linguagem humana.

Você pediu pra IA um botão de logout. Recebeu um AuthContext refatorado, um hook de sessão novo e umas mudanças em middleware que você nunca pediu. O **vibecodefriendly** te avisa quando a IA saiu do roteiro — sem o jargão de linter.

Pra quem constrói com Cursor, Claude Code, GitHub Copilot, Replit Agent, v0, bolt.new, Lovable e cia.

[English](./README.md)

---

## O problema

A IA gera código rápido. Ela também gera *mais coisa* do que você pediu.

Você pede um botão. Ela refatora três pastas. Você não consegue dizer com certeza se o que ela mexeu está bom — então aceita. Seis semanas depois, você está pagando: bugs em código que você não lembra ter pedido, abstrações que você não sabe explicar, arquivos que nem sabia que existiam.

Linter não pega isso. Linter checa sintaxe e estilo, não se a IA fez o que você pediu. Revisar diff por diff na mão demora mais do que simplesmente deixar a IA gerar de novo — então você não revisa.

## O que o vibecodefriendly faz

Rode `vcf review` depois da IA escrever código. Ele responde duas perguntas, em linguagem humana:

1. **Tem padrão estranho ou abstração desnecessária no que ela escreveu?** — *sanity check*
2. **A IA mudou mais coisa do que você pediu?** — *detecção de intenção*

As mensagens são legíveis, sem jargão de linter. Use no terminal ou no CI. Zero config — nenhum JSON pra editar.

## Instalação

```bash
npm install -g vibecodefriendly
```

## Uso

```bash
# Revisar um arquivo
vcf review src/auth/login.ts

# Revisar código inline
vcf review --input "var x = 1; debugger;"

# Pipe via stdin
cat meuArquivo.ts | vcf review

# Modo CI — sai com código 1 em risco médio ou alto
vcf review src/auth/login.ts --ci

# Saída JSON (para integração com ferramentas)
vcf review src/auth/login.ts --format json
```

## Como parece na prática

```
$ vcf review tests/fixtures/mixed.ts

Score: 1.3/10
Risk: HIGH ❌
❌ High risk: 2 critical issues detected. Not safe for production.

Issues: 2 high, 3 medium, 1 low

[HIGH] [bug] (line 12) Empty catch block silently swallows errors.
  > } catch (err) {}
[HIGH] [bug] (line 34) debugger statement found — remove before shipping.
  > debugger;
[MEDIUM] [smell] (line 1) Avoid var — use const or let instead.
  > var boot = console.log("boot");
[MEDIUM] [smell] (line 8) Function has too many parameters (6). Consider using an object or splitting the function.
  > function handleLogin(email, password, rememberMe, captcha, locale, timezone) {
[MEDIUM] [smell] (line 8) Low cohesion in "handleLogin": mixes HTTP, database, logging.
  > function handleLogin(email, password, rememberMe, captcha, locale, timezone) {
[LOW] [smell] (line 1) Avoid console statements in production code.
  > var boot = console.log("boot");

By category:
  SECURITY (1)
    [high] debugger statement found — remove before shipping.
  ARCHITECTURE (1)
    [medium] Low cohesion in "handleLogin": mixes HTTP, database, logging.
  DESIGN (2)
    [high] Empty catch block silently swallows errors.
    [medium] Function has too many parameters (6). Consider using an object or splitting the function.
  STYLE (2)
    [medium] Avoid var — use const or let instead.
    [low] Avoid console statements in production code.

Suggestions:
- Remove console statements or replace with a proper logging library.
- Replace var with const (preferred) or let to use block-scoped declarations.
- Remove all debugger statements before shipping to production.
- Handle errors meaningfully or rethrow them.
- Use an object parameter or split the function into smaller pieces.
- Split into smaller, focused functions with a single responsibility.
```

<!-- Output acima é verificado contra tests/fixtures/mixed.ts por tests/fixture-baseline.test.ts -->


## Regras

13 regras em 5 categorias, desenhadas especificamente para código gerado por IA:

| Categoria | Regras |
|---|---|
| **security** | `no-debugger` |
| **design** | `shallow-error-handling`, `function-too-long`, `too-many-params`, `overengineering-detection`, `duplicate-code`, `defensive-overkill` |
| **architecture** | `low-cohesion`, `multiple-responsibilities`, `file-too-large` |
| **intent** | `unexpected-refactor` |
| **style** | `no-console`, `no-var` |

### Regras de intenção — o diferencial

Regras como `unexpected-refactor` não sinalizam código ruim — elas sinalizam **mudanças não solicitadas**. Se a IA renomeou 6+ identificadores ou adicionou 5+ re-exports que você não pediu, isso é violação de escopo, não bug de código.

Para excluir um arquivo da checagem de intenção, adicione um comentário:

```ts
// vcf: allow-refactor
```

## Uso com Node.js

```ts
import { reviewCode } from "vibecodefriendly";

const result = reviewCode(code);
// { score, risk, issues, suggestions, warnings }

// Com opções
const result = reviewCode(code, {
  excludeRuleIds: ["no-console"],
});
```

## E como isso é diferente de um linter?

Linter checa se seu código segue regras *que você já escreveu*. O vibecodefriendly checa se a IA **fez o que você efetivamente pediu** e se os padrões que ela produziu vão te morder depois — em linguagem que você não precisa ser dev sênior pra entender.

É uma segunda opinião sobre o que a IA gerou, não um enforce de estilo.

## Status

**Alpha.** O engine central e o CLI estão funcionando. Adicionando regras e melhorando o output ativamente.

**Curtiu a ideia? Dê uma star no repo pra acompanhar.** Stars me dizem se vale continuar e ajudam outras pessoas a encontrar o projeto.

Tem um padrão que a IA fica gerando e deveria ser detectado? [Abre uma issue](https://github.com/DykstraBruno/vibecodefriendly/issues) — sugestões de regras são bem-vindas.

## Quem está construindo

[Bruno Dykstra](https://github.com/DykstraBruno) — graduando em Eng. de Computação, fullstack (TypeScript / Node / React / Java).

Eu já lancei o [arch-reviewer-cli](https://github.com/DykstraBruno/arch-reviewer-cli) — mesma família de problema, só que feito pra dev sênior fazendo Clean Architecture, com checagem rigorosa baseada em regras e config em JSON. **O vibecodefriendly pega esse motor e reposiciona pra quem não quer ler um livro sobre Clean Architecture e só quer que a IA não quebre a aplicação no surdina.**

## Licença

[MIT](./LICENSE) © 2026 Bruno Dykstra
