# Tutorial: Monitoramento Automático (Watcher)

O Watcher é o recurso que transforma o DeskCraft em um organizador **automático e contínuo**. Em vez de executar manualmente, o Watcher monitora suas pastas em tempo real e organiza novos arquivos assim que eles aparecem.

## O que é o Watcher?

O **Watcher** (observador) é um serviço em segundo plano que monitora as pastas configuradas. Quando um novo arquivo é criado, movido ou modificado nessas pastas, o Watcher automaticamente aplica as regras ativas e organiza o arquivo.

Pense nele como um assistente silencioso que mantém suas pastas organizadas o tempo todo, sem precisar de intervenção manual.

## Ativando o monitoramento em tempo real

1. Acesse **"Configurações"** no menu lateral
2. Na seção **"Watcher"**, ative o toggle **"Monitoramento em tempo real"**
3. Selecione quais pastas serão monitoradas
4. Defina quais regras ou perfil será utilizado
5. Clique em **"Salvar"**

A partir desse momento, qualquer arquivo novo que aparecer nas pastas monitoradas será automaticamente organizado.

> **Dica:** O Watcher usa o perfil ativo no momento. Ao trocar de perfil, as regras do Watcher também mudam.

## Configurando o agendamento

Se preferir que a organização aconteça em horários específicos (em vez de tempo real), use o agendamento:

### Agendamento diário

1. Na seção **"Watcher"**, selecione **"Agendado"** em vez de **"Tempo real"**
2. Escolha **"Diário"**
3. Defina o horário (ex: 18:00)
4. Salve

O DeskCraft executará as regras automaticamente todos os dias no horário definido.

### Agendamento semanal

1. Selecione **"Semanal"**
2. Escolha os dias da semana (ex: segunda, quarta e sexta)
3. Defina o horário
4. Salve

### Agendamento personalizado

Para cenários mais específicos, use o agendamento personalizado com intervalos em horas (ex: a cada 4 horas).

## Comportamento em segundo plano

Quando o Watcher está ativo:

- O DeskCraft exibe um **indicador** na barra de status mostrando que o monitoramento está ativo
- O aplicativo pode rodar **minimizado na bandeja do sistema** (System Tray)
- Quando um arquivo é organizado automaticamente, uma **notificação discreta** é exibida
- Todas as operações automáticas são registradas no **Histórico**, assim como as manuais
- Você pode **pausar** o Watcher temporariamente sem desativá-lo

> **Importante:** O Watcher respeita as mesmas regras de conflito configuradas nas suas preferências.

## Dicas de performance

O Watcher foi projetado para ser leve e eficiente, mas algumas práticas ajudam a manter o desempenho ideal:

- **Monitore apenas as pastas necessárias** — evite monitorar a raiz do disco (C:\) ou pastas com milhares de subdiretórios
- **Pastas recomendadas** — Desktop, Downloads, Documentos e pastas de projeto
- **Evite pastas do sistema** — pastas como `Windows`, `Program Files` e `AppData` não devem ser monitoradas
- **Limite o número de pastas** — 3 a 5 pastas é o ideal para a maioria dos casos
- **Verifique o histórico** — se o Watcher estiver processando muitos arquivos, revise suas regras para garantir que não há regras conflitantes

### Consumo de recursos

O Watcher consome **menos de 20 MB de memória** e quase zero de CPU quando em espera. O consumo aumenta brevemente apenas quando novos arquivos são detectados e processados.

---

> O Watcher é ideal para quem quer manter pastas sempre organizadas sem precisar lembrar de executar o DeskCraft manualmente.
