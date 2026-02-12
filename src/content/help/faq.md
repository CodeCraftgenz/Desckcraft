# Perguntas Frequentes (FAQ)

Aqui estão as respostas para as dúvidas mais comuns sobre o DeskCraft.

## O DeskCraft apaga meus arquivos?

**Não!** O DeskCraft **nunca apaga** nenhum arquivo. Ele apenas **move** e **renomeia** arquivos de acordo com as regras que você configurou. Seus arquivos sempre continuam existindo, apenas em uma localização diferente e mais organizada.

Além disso, toda operação é registrada no histórico e pode ser revertida com o recurso de rollback a qualquer momento.

## Posso desfazer uma organização?

**Sim!** O DeskCraft mantém um histórico completo de todas as execuções. Você pode acessar o **Histórico** no menu lateral, selecionar qualquer execução e clicar em **"Desfazer (Rollback)"** para reverter todos os movimentos daquela execução.

Consulte o tutorial de [Rollback](tutorial-rollback) para instruções detalhadas.

## Funciona sem internet?

**Sim, 100% offline!** O DeskCraft funciona completamente sem conexão com a internet. Todos os dados, regras, configurações e histórico ficam armazenados localmente no seu computador. Nenhuma informação é enviada para servidores externos.

Isso significa que seus arquivos e suas regras de organização são completamente privados.

## Quais formatos de arquivo são suportados?

**Todos!** O DeskCraft trabalha com qualquer tipo de arquivo, independentemente da extensão ou formato. Ele não precisa abrir ou interpretar o conteúdo dos arquivos — apenas lê metadados como nome, extensão, tamanho e datas.

Você pode criar regras para qualquer extensão de arquivo: `.pdf`, `.docx`, `.jpg`, `.mp4`, `.zip`, `.exe`, `.py`, `.txt` e qualquer outra.

## E se dois arquivos tiverem o mesmo nome no destino?

Isso é chamado de **conflito de nomes**. O DeskCraft oferece três estratégias para lidar com essa situação:

1. **Adicionar sufixo** (padrão) — Adiciona um número ao final do nome: `arquivo.pdf` → `arquivo_1.pdf`
2. **Substituir** — O arquivo existente é substituído pelo novo (use com cuidado!)
3. **Pular** — O arquivo conflitante não é movido

Você pode configurar a estratégia padrão em **Configurações > Estratégia de Conflito**. Durante a simulação, os conflitos são destacados para que você possa revisá-los antes de confirmar.

## Como migrar regras entre computadores?

O recurso de **exportação/importação de regras** está sendo desenvolvido e estará disponível em uma atualização futura. Com ele, você poderá:

- Exportar todas as regras (ou regras selecionadas) para um arquivo JSON
- Importar regras de um arquivo JSON em outro computador
- Compartilhar conjuntos de regras com colegas

Por enquanto, as regras ficam armazenadas localmente no banco de dados do aplicativo.

## O Watcher consome muita memória?

**Não!** O Watcher foi projetado para ser extremamente leve. Em modo de espera, ele consome **menos de 20 MB de memória RAM** e praticamente zero de CPU.

O consumo aumenta brevemente apenas quando novos arquivos são detectados e as regras são aplicadas, retornando ao normal em seguida. Monitorar 3 a 5 pastas não tem impacto perceptível no desempenho do seu computador.

## Posso usar regex nas regras?

**Sim!** O DeskCraft suporta expressões regulares (regex) para condições avançadas. No Rule Builder, selecione o campo **"Regex Pattern"** e insira sua expressão regular.

Exemplos de uso:
- `^relatorio_\d{4}\.pdf$` — Corresponde a arquivos como `relatorio_2024.pdf`
- `\.(jpg|jpeg|png|gif)$` — Corresponde a qualquer imagem
- `backup_.*_final` — Corresponde a arquivos com "backup_" seguido de qualquer texto e "_final"

> **Dica:** Teste suas expressões regulares na simulação antes de aplicar para garantir que correspondem aos arquivos corretos.

## Como alterar o tema?

O DeskCraft suporta os temas **claro**, **escuro** e **sistema** (segue a configuração do Windows).

Para alterar:
1. Acesse **"Configurações"** no menu lateral
2. Na seção **"Aparência"**, selecione o tema desejado
3. A mudança é aplicada imediatamente

O tema **"Sistema"** é o padrão e alterna automaticamente entre claro e escuro conforme a configuração do seu Windows.

## Onde os logs ficam salvos?

Os logs do DeskCraft são armazenados localmente na pasta de dados do aplicativo:

- **Windows:** `%APPDATA%\com.deskcraft.app\logs\`

Os logs registram todas as operações realizadas, incluindo:
- Arquivos movidos e renomeados
- Erros e avisos
- Atividades do Watcher
- Eventos do sistema

Você pode ajustar o nível de detalhe dos logs em **Configurações > Nível de Log** (info, debug, warn, error).

## Posso criar pastas automaticamente?

**Sim!** Ao configurar uma ação de "Mover para pasta", você pode marcar a opção **"Criar pasta se não existir"**. O DeskCraft criará automaticamente a pasta de destino (incluindo subpastas) se ela ainda não existir.

Isso é especialmente útil com subpastas dinâmicas baseadas em variáveis como `{ano}` ou `{mês}`.

## O DeskCraft funciona com unidades de rede?

O DeskCraft pode organizar arquivos em unidades de rede mapeadas (ex: `Z:\Compartilhado`), desde que você tenha permissão de leitura e escrita. No entanto, o desempenho pode ser menor que em discos locais devido à latência de rede.

Para o Watcher, recomendamos usar apenas discos locais para garantir detecção confiável de novos arquivos.

---

> Não encontrou sua dúvida? Consulte a seção de **Solução de Problemas** ou entre em contato pelo menu **Configurações > Sobre > Feedback**.
