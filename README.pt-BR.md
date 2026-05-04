# vibecodefriendly

> Você pediu pra IA um botão de logout. Recebeu um AuthContext refatorado, um hook de sessão novo e umas mudanças em middleware que você nunca pediu. O **vibecodefriendly** te avisa quando a IA saiu do roteiro — em português normal, sem jargão de linter.

Pra quem constrói com Cursor, Claude Code, GitHub Copilot, Replit Agent, v0, bolt.new, Lovable e cia.

[English](./README.md)

---

## O problema

A IA gera código rápido. Ela também gera *mais coisa* do que você pediu.

Você pede um botão. Ela refatora três pastas. Você não consegue dizer com certeza se o que ela mexeu está bom — então aceita. Seis semanas depois, você está pagando: bugs em código que você não lembra ter pedido, abstrações que você não sabe explicar, arquivos que nem sabia que existiam.

Linter não pega isso. Linter checa sintaxe e estilo, não se a IA fez o que você pediu. Revisar diff por diff na mão demora mais do que simplesmente deixar a IA gerar de novo — então você não revisa.

## O que o vibecodefriendly faz

Ele roda depois da IA escrever código e responde duas perguntas, em linguagem humana:

1. **A IA continuou no escopo do que você pediu, ou começou a fazer coisa tangencial?** — *detecção de desvio (drift)*
2. **Tem padrão estranho ou abstração desnecessária no que ela escreveu?** — *sanity check*

As mensagens são amigáveis, sem jargão. Zero config — o `vcf init` lê seu projeto e descobre as regras sozinho. Nenhum JSON pra editar.

## Como vai ser

> A ferramenta está em pré-release (veja [Status](#status)). Os exemplos abaixo são mockups da UX planejada.

### 1. Detecção de desvio — "você pediu X, a IA fez Y"

```
$ vcf check

Você pediu: "adiciona botão de logout no header"

O que a IA fez:
  ✓ Adicionou botão no Header.tsx — combina com seu pedido
  ⚠ Refatorou AuthContext.tsx (62 linhas mudadas)
  ⚠ Criou hooks/useSession.ts (arquivo novo)
  ⚠ Mudou middleware/auth.ts (lógica de redirect)

3 dessas mudanças não foram pedidas.
Costuma vir junto com bugs sutis. Quer revisar antes de continuar?

  [r] Revisar arquivo por arquivo
  [a] Aceitar tudo (não recomendado)
  [d] Pedir pra IA desfazer as mudanças extras
```

### 2. Sanity check — padrões que doem depois

```
$ vcf check

Encontrei 2 padrões que costumam virar dor de cabeça:

  src/domain/Order.ts
    Esse arquivo de regra de negócio está chamando o banco direto.
    Você sente isso no dia que troca de banco, ou quando quer
    testar sem subir Postgres. Sugestão: pedir pra IA mover essa
    chamada pra um repositório.

  src/components/Dashboard.tsx (487 linhas)
    Esse componente cresceu demais. Quando passa de ~350 linhas, a
    IA começa a errar mais ao editar — perde contexto. Sugestão:
    pedir pra ela quebrar em partes.

Quer que eu peça pra IA arrumar agora? [s/N]
```

### 3. Init zero-config — nenhum JSON pra editar

```
$ vcf init

Vou olhar seu projeto e sugerir umas regras...

  ✓ Detectei: Next.js 14 + TypeScript + Prisma
  ✓ Padrão típico desse stack: separar app/, lib/, components/

Pronto. Toda vez que a IA gerar código, rode:

  vcf check

E eu te digo se ela ficou no escopo ou se começou a fazer coisa
que você não pediu.

(zero arquivo de config pra editar — confia)
```

## E como isso é diferente de um linter?

Linter checa se seu código segue regras *que você já escreveu*. O vibecodefriendly checa se a IA **fez o que você efetivamente pediu** e se os padrões que ela produziu vão te morder depois — em linguagem que você não precisa ser dev sênior pra entender.

É uma segunda opinião sobre o que a IA gerou, não um enforce de estilo.

## Status

**Pré-release.** A Fase 1 é testar a ideia antes de eu queimar semanas implementando.

**Curtiu a ideia? Dê uma star no repo pra acompanhar.** Star é o único sinal que eu tenho nessa fase — é o que me diz se vale continuar. Quando a ferramenta estiver pronta, o primeiro release sai aqui.

Tem alguma história de IA fazendo demais, ou feedback no pitch acima? [Abre uma issue](https://github.com/DykstraBruno/vibecodefriendly/issues) — quero ouvir.

## Quem está construindo

[Bruno Dykstra](https://github.com/DykstraBruno) — graduando em Eng. de Computação, fullstack (TypeScript / Node / React / Java).

Eu já lancei o [arch-reviewer-cli](https://github.com/DykstraBruno/arch-reviewer-cli) — mesma família de problema, só que feito pra dev sênior fazendo Clean Architecture, com checagem rigorosa baseada em regras e config em JSON. **O vibecodefriendly pega esse motor e reposiciona pra quem não quer ler um livro sobre Clean Architecture e só quer que a IA não quebre a aplicação no surdina.**

## Licença

[MIT](./LICENSE) © 2026 Bruno Dykstra
