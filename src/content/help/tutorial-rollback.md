# Tutorial: Desfazer (Rollback)

O rollback é a rede de segurança do DeskCraft. Se uma organização não saiu como esperado, você pode **reverter completamente** e restaurar seus arquivos para a posição original.

## Quando usar o rollback

O rollback é útil em diversas situações:

- Você executou uma regra e percebeu que ela moveu arquivos para o lugar errado
- Uma regra nova teve um comportamento inesperado
- Você quer testar uma organização temporariamente e depois desfazer
- Arquivos importantes foram movidos acidentalmente
- Você precisa restaurar a estrutura original de pastas

> **Lembre-se:** O rollback funciona por **execução** (run). Cada vez que você confirma uma organização, ela é registrada como uma execução independente.

## Acessando o histórico

Todas as execuções do DeskCraft são registradas no histórico com detalhes completos.

1. Acesse **"Histórico"** no menu lateral
2. Você verá uma lista de todas as execuções, ordenadas da mais recente para a mais antiga
3. Cada entrada mostra:
   - **Data e hora** da execução
   - **Número de arquivos** movidos
   - **Perfil** utilizado (se aplicável)
   - **Status** — sucesso, parcial ou com erros

## Selecionando um run para reverter

1. Na lista do histórico, clique na execução que deseja reverter
2. Revise os detalhes da execução:
   - Lista completa de arquivos movidos (origem → destino)
   - Regras que foram aplicadas
   - Conflitos que foram resolvidos
3. Clique no botão **"Desfazer (Rollback)"**

> **Dica:** Você pode reverter qualquer execução, não apenas a mais recente. O DeskCraft gerencia a ordem correta de reversão automaticamente.

## Confirmando o rollback

Após clicar em "Desfazer", o DeskCraft exibirá uma **prévia do rollback**:

1. Revise a lista de operações que serão revertidas
2. Verifique se todos os caminhos de origem estão acessíveis
3. Clique em **"Confirmar Rollback"**
4. Aguarde o processamento
5. Verifique o resultado no resumo

O DeskCraft moverá cada arquivo de volta para sua posição original. O progresso é exibido em tempo real.

## Limitações do rollback

O rollback é poderoso, mas tem algumas limitações que você deve conhecer:

- **Arquivos deletados externamente** — Se um arquivo foi movido pelo DeskCraft e depois deletado manualmente (ou por outro programa), o rollback não pode restaurá-lo
- **Arquivos modificados** — Se o arquivo foi renomeado ou movido por outro programa após a organização, o rollback pode não encontrá-lo no caminho esperado
- **Pastas removidas** — Se a pasta de destino foi removida, o DeskCraft tentará recriá-la, mas pode falhar se houver problemas de permissão
- **Conflitos reversos** — Se a pasta de origem agora contém um arquivo com o mesmo nome, o DeskCraft aplicará a estratégia de conflito configurada

### O que acontece em caso de erro parcial?

Se o rollback não conseguir reverter alguns arquivos, o DeskCraft:

1. Reverte todos os arquivos possíveis
2. Gera um relatório detalhado dos arquivos que não puderam ser revertidos
3. Mantém o registro no histórico para referência futura

---

> Sempre use a simulação antes de executar novas regras. Mas se algo der errado, o rollback está aqui para ajudar.
