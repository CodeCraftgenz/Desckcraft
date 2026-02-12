# Solução de Problemas

Encontrou um problema? Confira as soluções abaixo para os cenários mais comuns.

### Permissão negada ao mover arquivo

**Problema:** O DeskCraft exibe erro de "Permissão negada" ou "Access denied" ao tentar mover um arquivo.

**Causa:** O arquivo ou a pasta de destino possuem restrições de permissão do sistema operacional. Isso pode ocorrer com arquivos em pastas do sistema, arquivos protegidos por políticas de grupo corporativas ou arquivos marcados como somente leitura.

**Solução:**
1. Verifique se você tem permissão de leitura e escrita na pasta de destino
2. Clique com o botão direito no arquivo → Propriedades → desmarque "Somente leitura"
3. Se o arquivo estiver em uma pasta protegida, execute o DeskCraft como administrador
4. Para arquivos em unidades de rede, verifique suas permissões com o administrador de TI

### Arquivo em uso por outro programa

**Problema:** O DeskCraft não consegue mover um arquivo porque ele está sendo usado por outro programa.

**Causa:** O Windows bloqueia arquivos que estão abertos por outros aplicativos. Isso é comum com documentos do Office, bancos de dados, arquivos de log e aplicativos em execução.

**Solução:**
1. Feche o programa que está usando o arquivo
2. Se não souber qual programa, use o **Gerenciador de Tarefas** (Ctrl+Shift+Esc) para verificar
3. Reinicie o DeskCraft e tente novamente
4. Se o problema persistir, reinicie o computador para liberar todos os bloqueios
5. O DeskCraft registrará o arquivo como "ignorado" e continuará com os demais

### Conflito de nomes no destino

**Problema:** Múltiplos arquivos com o mesmo nome precisam ser movidos para a mesma pasta de destino.

**Causa:** Duas ou mais regras direcionam arquivos com nomes iguais para o mesmo destino, ou a pasta de destino já contém um arquivo com esse nome.

**Solução:**
1. Acesse **Configurações > Estratégia de Conflito** e escolha a melhor opção:
   - **Sufixo** — adiciona `_1`, `_2`, etc. ao nome (recomendado)
   - **Substituir** — sobrescreve o arquivo existente
   - **Pular** — ignora o arquivo conflitante
2. Use a simulação para identificar conflitos antes de executar
3. Considere criar regras mais específicas para evitar conflitos recorrentes

### Simulação não encontrou nenhum arquivo

**Problema:** Ao executar a simulação, o resultado mostra "0 arquivos encontrados" mesmo com arquivos nas pastas.

**Causa:** As condições das regras não correspondem a nenhum arquivo nas pastas selecionadas. Isso pode ocorrer por erro de digitação na extensão, condições muito restritivas ou pastas configuradas incorretamente.

**Solução:**
1. Verifique se as **pastas corretas** estão selecionadas na simulação
2. Revise as condições das regras — confira se a extensão está escrita corretamente (ex: `pdf` e não `.pdf`)
3. Teste com condições mais amplas para verificar se os arquivos são detectados
4. Verifique se as regras estão **ativas** (não desativadas)
5. Confira se o perfil ativo contém as regras que você espera

### Watcher não detecta mudanças

**Problema:** Novos arquivos são adicionados às pastas monitoradas, mas o Watcher não reage.

**Causa:** O Watcher pode estar desativado, a pasta pode não estar na lista de monitoramento, ou pode haver um atraso no sistema de notificação de arquivos do Windows.

**Solução:**
1. Verifique se o Watcher está **ativo** em Configurações > Watcher
2. Confirme que a pasta está na lista de **pastas monitoradas**
3. Verifique se o indicador do Watcher está visível na barra de status
4. Tente **pausar e reativar** o Watcher
5. Reinicie o DeskCraft se o problema persistir
6. Evite monitorar pastas em unidades de rede — o sistema de notificação do Windows pode não funcionar corretamente em pastas remotas

### O app está lento

**Problema:** O DeskCraft demora para carregar, executar simulações ou mover arquivos.

**Causa:** Monitorar muitas pastas, ter regras com expressões regulares complexas, processar pastas com milhares de arquivos ou pouca memória RAM disponível.

**Solução:**
1. **Reduza as pastas monitoradas** — mantenha apenas 3-5 pastas essenciais
2. **Simplifique regras regex** — expressões regulares complexas podem ser lentas em grandes volumes
3. **Feche outros programas** que consomem memória
4. **Limpe o histórico antigo** — um histórico muito grande pode impactar o desempenho
5. Verifique se o **antivírus** não está interferindo com as operações de arquivo do DeskCraft
6. Desative temporariamente o Watcher se não estiver usando

### Regra não está funcionando como esperado

**Problema:** Uma regra parece não estar sendo aplicada corretamente ou está movendo arquivos errados.

**Causa:** Condições incorretas, conflito entre regras, ordem de prioridade errada ou a regra está associada a outro perfil.

**Solução:**
1. **Use a simulação** para verificar exatamente quais arquivos a regra está capturando
2. Revise as condições da regra com atenção — verifique operadores e valores
3. Verifique a **ordem de prioridade** — se duas regras se aplicam ao mesmo arquivo, a primeira na lista vence
4. Confirme que a regra está no **perfil ativo**
5. Teste a regra **isoladamente** desativando as demais temporariamente
6. Se estiver usando regex, teste a expressão com exemplos de nomes de arquivo

### Como exportar logs para suporte

**Problema:** Você precisa compartilhar logs para diagnóstico ou suporte técnico.

**Causa:** Problemas que não são resolvidos pelas soluções acima podem necessitar de análise mais detalhada através dos logs do aplicativo.

**Solução:**
1. Acesse **Configurações > Sobre**
2. Clique em **"Abrir pasta de logs"**
3. Os logs estarão na pasta `%APPDATA%\com.deskcraft.app\logs\`
4. Copie os arquivos de log mais recentes (geralmente `deskcraft.log` e `deskcraft.log.1`)
5. Antes de compartilhar, revise os logs para garantir que não contêm informações sensíveis
6. Se necessário, aumente o nível de log para **"debug"** em Configurações > Nível de Log para capturar mais detalhes

> **Dica:** Defina o nível de log como "debug" apenas temporariamente, pois gera arquivos de log maiores.

---

> Se o problema persistir após tentar as soluções acima, verifique se há atualizações disponíveis do DeskCraft que possam incluir correções.
