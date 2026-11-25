# Bule Azul

Bule Azul is a fictional neighbourhood café. This repository is its ordering-app website: a small, bilingual (pt-BR by default, English under `/en/`) static site with plain HTML, CSS and a little JS, and no build step.

It is the public demo target of [Alpha Tester](https://alphatester.app): the page carries the Alpha Tester feedback widget, so testers can report what they see, and the agents turn those reports into issues and pull requests against this repository.

## Known rough edges (on purpose)

The page ships three deliberate defects for testers to find and report. Please do not fix them in unrelated changes; they are the point of the demo.

1. **A typo in the headline.** Portuguese: "Seu café do jetio certo, sem fila." English: "Your coffee at the rigth time, no queue."
2. **A button that does nothing.** The "Baixar o app" / "Get the app" button in the hero has no behaviour.
3. **A low-contrast block.** The "Dica da barista" / "Barista tip" section has text that fails the contrast guidelines.

## Run locally

```sh
python3 -m http.server 4130
```

Run it from the repository root and open <http://127.0.0.1:4130/> (Portuguese) or <http://127.0.0.1:4130/en/> (English). Asset paths are root-relative, so the site must be served from the root. Avoid ports 4100, 3000, 8787 and 4200, which other local tools use.

## Edit the copy

All text lives in `assets/i18n/pt-BR.json` and `assets/i18n/en.json`, which must have identical keys. The markup in `index.html` carries `data-i18n` (text), `data-i18n-html` (trusted markup) and `data-i18n-attr` (attributes), and `index.html` itself shows the Portuguese text.

1. Edit the two locale files (and `index.html` if the structure changes).
2. Regenerate the English page: `node scripts/i18n-pages.mjs`.
3. Commit `en/index.html` together with the change: it is generated, but it is committed.

Checks (Node 22 or newer, no dependencies):

```sh
npm test         # pages parse, keys exist, en/index.html is fresh, local links resolve
npm run check    # both locale files have the same keys
```

## Deploy

The site is deployed by `.github/workflows/deploy.yml` on every push to `main` (and on demand). The workflow runs the tests, runs `npm run build` (which copies the deployable files into `dist/` and injects the widget key), and publishes `dist/` to Cloudflare with `wrangler deploy` (`wrangler.toml`).

- The widget's publishable key is the repository **variable** `ALPHA_T_PUBLIC_KEY` (Settings > Secrets and variables > Actions > Variables). The page in the repository only carries the placeholder `__ALPHA_T_PUBLIC_KEY__`; the build refuses an empty value, a value that does not start with `at_pub_`, and any `at_sec_` value. The repository never contains a key: a pull request that adds one is wrong by definition.
- Cloudflare credentials are the repository **secrets** `CLOUDFLARE_API_TOKEN` (a token with Workers Scripts edit on the account) and `CLOUDFLARE_ACCOUNT_ID`.
- The Cloudflare git-connected build must be disconnected in the Cloudflare dashboard, so that only the workflow deploys.
- To preview the built site locally: `ALPHA_T_PUBLIC_KEY=at_pub_example npm run build`, then serve `dist/`.

## Agent access

`.mcp.json` registers the Alpha Tester MCP server (`at-mcp`) for coding agents. `ALPHA_T_API_KEY` is read from the developer's own shell environment and is never stored in the repository.

## License

MIT, see `LICENSE`.

---

# Bule Azul (pt-BR)

O Bule Azul é um café de bairro fictício. Este repositório é o site do aplicativo de pedidos: um site estático bilíngue (pt-BR por padrão, inglês em `/en/`), feito com HTML, CSS e um pouco de JS, sem etapa de build.

Ele é o alvo de demonstração público do [Alpha Tester](https://alphatester.app): a página traz o widget de feedback do Alpha Tester, para que testadores relatem o que veem e os agentes transformem esses relatos em issues e pull requests neste repositório.

## Defeitos conhecidos (de propósito)

A página traz três defeitos deliberados para os testadores encontrarem e relatarem. Não os corrija em mudanças não relacionadas: eles são o objetivo da demonstração.

1. **Um erro de digitação no título.** Em português: "Seu café do jetio certo, sem fila." Em inglês: "Your coffee at the rigth time, no queue."
2. **Um botão que não faz nada.** O botão "Baixar o app" / "Get the app" da seção principal não tem comportamento.
3. **Um bloco de baixo contraste.** A seção "Dica da barista" / "Barista tip" tem texto que não atende às diretrizes de contraste.

## Rodar localmente

```sh
python3 -m http.server 4130
```

Rode na raiz do repositório e abra <http://127.0.0.1:4130/> (português) ou <http://127.0.0.1:4130/en/> (inglês). Os caminhos dos arquivos partem da raiz, então o site precisa ser servido pela raiz. Evite as portas 4100, 3000, 8787 e 4200, usadas por outras ferramentas locais.

## Editar os textos

Todo o texto fica em `assets/i18n/pt-BR.json` e `assets/i18n/en.json`, que precisam ter exatamente as mesmas chaves. O `index.html` mostra o texto em português e marca cada trecho com `data-i18n`, `data-i18n-html` ou `data-i18n-attr`.

1. Edite os dois arquivos de idioma (e o `index.html`, se a estrutura mudar).
2. Gere de novo a página em inglês: `node scripts/i18n-pages.mjs`.
3. Faça o commit de `en/index.html` junto com a mudança: ele é gerado, mas fica versionado.

Verificações: `npm test` e `npm run check` (Node 22 ou mais novo, sem dependências).

## Publicação

O site é publicado pelo `.github/workflows/deploy.yml` a cada push na `main` (e sob demanda). O workflow roda os testes, roda `npm run build` (que copia os arquivos publicáveis para `dist/` e injeta a chave do widget) e publica `dist/` no Cloudflare com `wrangler deploy` (`wrangler.toml`).

- A chave pública do widget é a **variável** de repositório `ALPHA_T_PUBLIC_KEY` (Settings > Secrets and variables > Actions > Variables). A página no repositório traz só o marcador `__ALPHA_T_PUBLIC_KEY__`. O repositório nunca contém uma chave: um pull request que adicione uma está errado por definição.
- As credenciais do Cloudflare são os **secrets** `CLOUDFLARE_API_TOKEN` (token com Workers Scripts edit na conta) e `CLOUDFLARE_ACCOUNT_ID`.
- O build conectado ao git no painel do Cloudflare precisa ser desconectado, para que só o workflow publique.

## Acesso para agentes

O `.mcp.json` registra o servidor MCP do Alpha Tester (`at-mcp`) para agentes de código. A `ALPHA_T_API_KEY` vem do ambiente do shell de quem desenvolve e nunca fica no repositório.
