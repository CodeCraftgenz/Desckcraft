# Glossário

Entenda os termos e conceitos utilizados no DeskCraft.

**Regra**: Uma instrução do tipo SE → ENTÃO que define como um arquivo deve ser organizado. Cada regra possui uma ou mais condições e uma ação. Exemplo: "SE a extensão for `.pdf`, ENTÃO mover para `Documentos/PDFs`".

**Condição**: A parte "SE" de uma regra. Define os critérios que um arquivo deve atender para que a regra seja aplicada. Pode ser baseada em extensão, nome, tamanho, data de criação ou modificação, e expressões regulares.

**Ação**: A parte "ENTÃO" de uma regra. Define o que será feito com os arquivos que atendem à condição. As ações disponíveis incluem mover para pasta, mover para subpasta dinâmica, renomear e adicionar tag.

**Simulação**: Uma execução virtual (dry-run) das regras que mostra exatamente o que aconteceria sem mover nenhum arquivo. Permite revisar e aprovar as operações antes de executá-las.

**Execução (Run)**: O ato de aplicar regras efetivamente, movendo e renomeando arquivos de acordo com as configurações. Cada execução é registrada no histórico com detalhes completos para possibilitar rollback.

**Rollback**: O recurso de desfazer uma execução, revertendo todos os movimentos e renomeações realizados. Move cada arquivo de volta para sua posição original.

**Watcher**: O serviço de monitoramento automático que observa pastas em tempo real. Quando detecta novos arquivos ou alterações, aplica as regras automaticamente sem intervenção manual.

**Agendamento**: A funcionalidade de programar execuções automáticas em horários ou intervalos específicos. Pode ser diário, semanal ou personalizado.

**Perfil**: Um conjunto nomeado de regras e configurações agrupadas para um contexto específico. Exemplos: "Trabalho", "Estudos", "Pessoal". Apenas um perfil pode estar ativo por vez.

**Conflito**: Situação que ocorre quando um arquivo seria movido para um destino onde já existe outro arquivo com o mesmo nome. O DeskCraft oferece estratégias automáticas para resolver conflitos: sufixo, substituição ou pulo.

**Pasta Monitorada**: Uma pasta do sistema de arquivos que foi configurada para ser analisada pelo DeskCraft. As regras são aplicadas apenas aos arquivos dentro das pastas monitoradas.

**Dry-run**: Sinônimo de simulação. Termo técnico que significa "execução seca" — uma execução que não produz efeitos reais, usada para teste e validação.

**Tag**: Um rótulo que pode ser atribuído a arquivos ou regras para facilitar a organização e filtragem. Tags são metadados internos do DeskCraft e não alteram os arquivos em si.

**Atalho**: Uma configuração de acesso rápido que permite executar ações comuns com menos cliques. Por exemplo, um atalho de teclado para iniciar a simulação.

**Engine**: O motor de processamento interno do DeskCraft responsável por avaliar condições, resolver conflitos e executar ações. Opera de forma otimizada para processar milhares de arquivos em segundos.

**Preview**: A visualização prévia gerada pela simulação que mostra todas as operações que serão realizadas. Inclui detalhes de origem, destino, regra aplicada e possíveis conflitos.

**Regex (Expressão Regular)**: Um padrão de texto avançado usado para fazer correspondências complexas em nomes de arquivos. Permite criar condições sofisticadas como "todos os arquivos que começam com números seguidos de underscore".

**Sufixo**: A estratégia padrão de resolução de conflitos que adiciona um número ao final do nome do arquivo para evitar sobreposição. Exemplo: `documento.pdf` → `documento_1.pdf`.

---

> Este glossário é atualizado conforme novos recursos são adicionados ao DeskCraft.
