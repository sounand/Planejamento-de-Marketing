# Nand Motion — Genjutsu

Aplicativo web baseado em [wide-trace/open-higgsfield](https://github.com/wide-trace/open-higgsfield), adaptado para usar somente **Genjutsu Motion Transfer**.

A interface recebe um vídeo MP4 e uma imagem JPG, PNG ou WebP, ou URLs públicas HTTPS. As instruções são opcionais. Você pode escolher 480p, 720p ou 1080p, acompanhar a fila e salvar o vídeo concluído. O histórico das últimas 30 gerações fica neste navegador; as URLs de resultado podem expirar no provedor.

## Executar

Requisitos: Node.js 24 e pnpm 11.25.0 (versões verificadas neste ambiente).

A partir de `/workspace/Planejamento-de-Marketing/video-studio`:

```bash
pnpm install --frozen-lockfile --store-dir /workspace/.cloud-setup/pnpm-store
pnpm dev --hostname 127.0.0.1
```

Para produção:

```bash
pnpm build
pnpm start --hostname 127.0.0.1 --port 3000
```

Use o checkout existente. As tarefas de nuvem já são isoladas; não crie um Git worktree sem pedido explícito.

## Configuração do servidor

Configure os valores nas configurações do ambiente, nunca em conversas, código ou variáveis `NEXT_PUBLIC_`. Para desenvolvimento local, também é possível usar `.env.local`, que é ignorado pelo Git.

| Nome | Uso |
| --- | --- |
| `HF_CREDENTIALS` | Chave Higgsfield no formato `KEY_ID:KEY_SECRET`. Necessária para gerar. `HF_KEY` existente também é aceito. |
| `OPEN_HIGGSFIELD_READ_WRITE_TOKEN` | Token real de leitura/escrita do Vercel Blob. Necessário para enviar arquivos. O SDK assina tokens de upload localmente; um placeholder de proxy não substitui esse valor. |
| `HF_API_BASE_URL` | Opcional. O padrão é `https://api.higgsfield.ai`. Um servidor local é usado exclusivamente nos testes simulados. |

A chave Higgsfield fica no servidor, inclusive quando a plataforma a injeta pelo proxy de HTTPS. A interface não pede nem guarda essa chave em cookies ou armazenamento do navegador. `/api/config` informa apenas se as configurações estão presentes; isso não prova que a conta tem saldo ou acesso ao modelo.

O upload é direto para o Vercel Blob com um token temporário assinado no servidor. Os arquivos têm URLs públicas, necessárias ao processamento. URLs já hospedadas permitem gerar sem Vercel Blob.

## Modelo e limites

- Modelo: `higgsfield/genjutsu/motion-transfer/v1.0`.
- Endpoint: `POST https://api.higgsfield.ai/higgsfield/genjutsu/motion-transfer/v1.0`.
- Corpo: `{video_url, image_urls: [imagem], prompt, resolution}`.
- Consulta: `GET /requests/{request_id}/status`, a cada 4 segundos.
- Vídeo mínimo: 4 segundos. Acima de 30 segundos, o provedor usa os primeiros 30 segundos.
- O aplicativo usa uma imagem por geração. A API permite até oito, mas essa opção não faz parte deste fluxo.
- Resolução padrão: 720p. Instruções: até 10.000 caracteres.
- Preços fornecidos na documentação: US$ 0,318/s em 480p, US$ 0,681/s em 720p e US$ 1,632/s em 1080p, antes de descontos. A duração é arredondada para cima.
- A duração e o custo total são verificados no navegador para arquivos MP4 locais. Para URLs, a tela mostra o preço por segundo; a duração é verificada pelo provedor.
- Depois de 10 minutos ou de uma falha na consulta, o acompanhamento pausa. Retomar consulta a mesma geração, sem enviá-la novamente.

Documentação usada: [Genjutsu](https://dash.higgsfield.ai/models/higgsfield/genjutsu/motion-transfer/v1.0/llms.txt).

## Verificação

```bash
pnpm exec tsc --noEmit
node --experimental-strip-types --test tests/genjutsu.test.mjs
pnpm build
```

Os quatro testes de contrato verificam campos e endpoint, entradas obrigatórias, limites/URLs e preço. Neste ambiente também foi executado um teste de navegador com provedor local simulado: fila, consulta, conclusão, link de download, histórico, erro de cobrança, bloqueio e falha do provedor; layouts desktop/mobile; prévia de MP4 e duração mínima.

**Geração real e upload real ainda exigem credenciais válidas.** Testes simulados não comprovam qualidade do vídeo nem conectividade autenticada ao provedor.

A página original `../nand_design_landing_react_tailwind_starter.jsx` permanece preservada.
