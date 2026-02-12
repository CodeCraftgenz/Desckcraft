# Tutorial: Simulação (Preview antes de mover)

A simulação é uma das funcionalidades mais importantes do DeskCraft. Ela permite que você **visualize exatamente o que acontecerá** antes de mover qualquer arquivo. Pense nela como um "ensaio geral" — nada é alterado no seu sistema de arquivos.

## O que é simulação (dry-run)?

A simulação, também chamada de **dry-run**, é uma execução virtual das suas regras. O DeskCraft analisa todos os arquivos nas pastas selecionadas, aplica as regras configuradas e gera um **relatório detalhado** mostrando:

- Quais arquivos seriam movidos e para onde
- Quais arquivos seriam renomeados
- Quais conflitos existem (arquivos com mesmo nome no destino)
- Quais arquivos não correspondem a nenhuma regra

**Nenhum arquivo é movido, renomeado ou alterado durante a simulação.** É 100% seguro executar quantas simulações quiser.

## Como iniciar uma simulação

1. Acesse **"Simulação"** no menu lateral
2. Selecione as **pastas** que deseja analisar (Desktop, Downloads, etc.)
3. Escolha quais **regras** aplicar (todas ativas ou apenas algumas específicas)
4. Opcionalmente, selecione um **perfil** para usar o conjunto de regras associado
5. Clique em **"Iniciar Simulação"**

O processamento leva poucos segundos, dependendo da quantidade de arquivos.

> **Dica:** Você pode executar simulações parciais, selecionando apenas uma pasta ou uma regra específica para testar.

## Entendendo o preview

Após a simulação, o DeskCraft apresenta um **preview interativo** organizado em seções:

### Arquivos que serão movidos

Uma lista com cada arquivo, mostrando:
- **Nome do arquivo** — nome original completo
- **Origem** — pasta onde o arquivo está atualmente
- **Destino** — pasta para onde será movido
- **Regra aplicada** — qual regra determinou a ação

### Arquivos ignorados

Arquivos que não correspondem a nenhuma regra. Isso é normal e esperado — significa que esses arquivos não serão afetados.

### Resumo estatístico

No topo do preview, um resumo com números:
- Total de arquivos analisados
- Arquivos que serão movidos
- Arquivos ignorados
- Conflitos detectados

## Conflitos e como são resolvidos

Um **conflito** ocorre quando um arquivo seria movido para um destino onde já existe outro arquivo com o mesmo nome. O DeskCraft oferece três estratégias:

1. **Adicionar sufixo** (padrão) — Renomeia o arquivo adicionando um número: `relatorio.pdf` → `relatorio_1.pdf`
2. **Substituir** — O arquivo existente no destino é sobrescrito pelo novo
3. **Pular** — O arquivo conflitante não é movido

Você pode configurar a estratégia padrão em **Configurações > Conflitos**.

No preview, conflitos são destacados com um ícone de alerta amarelo para fácil identificação.

## Confirmar ou cancelar

Após revisar o preview:

- **Confirmar:** Clique em **"Confirmar e Executar"** para aplicar todas as operações mostradas no preview. Os arquivos serão efetivamente movidos.
- **Cancelar:** Clique em **"Cancelar"** para descartar a simulação. Nenhum arquivo será alterado.
- **Ajustar:** Se perceber que algo não está correto, volte para **"Regras"**, ajuste e execute uma nova simulação.

> **Importante:** Mesmo após confirmar, todas as operações são registradas no histórico e podem ser revertidas com o recurso de **Rollback**.

---

> A simulação é a sua rede de segurança. Use-a sempre antes de executar novas regras ou modificar regras existentes.
