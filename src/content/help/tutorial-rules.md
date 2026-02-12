# Tutorial: Criando Regras (IF → THEN)

As regras são o coração do DeskCraft. Cada regra funciona como uma instrução: **SE** um arquivo atende a uma condição, **ENTÃO** execute uma ação. Este tutorial vai te ensinar a criar regras poderosas para organizar seus arquivos.

## O que é uma regra?

Uma regra é composta por duas partes:

- **Condição (SE):** Define quais arquivos serão afetados. Exemplos: "se a extensão for `.pdf`", "se o nome contém `relatório`", "se o tamanho for maior que 10 MB".
- **Ação (ENTÃO):** Define o que será feito com os arquivos que atendem à condição. Exemplo: "mover para `Documentos/PDFs`".

Você pode combinar múltiplas condições em uma única regra usando **E** (todas devem ser verdadeiras) ou **OU** (pelo menos uma deve ser verdadeira).

## Acessando o Rule Builder

1. No menu lateral, clique em **"Regras"**
2. Clique no botão **"Criar Regra"** no canto superior direito
3. O **Rule Builder** será aberto em uma nova tela

O Rule Builder é uma interface visual que permite montar regras sem escrever código.

## Criando uma condição

### Por extensão de arquivo

A condição mais comum. Ideal para separar tipos de arquivo.

1. No campo **"Campo"**, selecione **"Extensão do arquivo"**
2. No campo **"Operador"**, selecione **"Igual a"**
3. No campo **"Valor"**, digite a extensão desejada (ex: `pdf`, `jpg`, `docx`)

> **Dica:** Não inclua o ponto na extensão. Use `pdf` e não `.pdf`.

### Por nome do arquivo

Útil para organizar arquivos com padrões de nomenclatura.

1. Selecione **"Nome do arquivo"** no campo
2. Use operadores como **"Contém"**, **"Começa com"** ou **"Termina com"**
3. Digite o padrão desejado (ex: `relatório`, `fatura_2024`)

### Por tamanho do arquivo

Perfeito para separar arquivos grandes de pequenos.

1. Selecione **"Tamanho do arquivo"** no campo
2. Use **"Maior que"** ou **"Menor que"**
3. Informe o tamanho em bytes, KB ou MB

### Por data de criação ou modificação

Organize arquivos antigos ou recentes.

1. Selecione **"Data de criação"** ou **"Data de modificação"**
2. Use **"Antes de"** ou **"Depois de"**
3. Escolha a data no seletor

## Definindo a ação

Após configurar a condição, defina o que acontecerá com os arquivos correspondentes:

### Mover para pasta

A ação mais utilizada. Move o arquivo para uma pasta de destino.

1. No campo **"Ação"**, selecione **"Mover para pasta"**
2. Clique em **"Selecionar pasta"** para escolher o destino
3. Opcionalmente, marque **"Criar pasta se não existir"**

### Mover para subpasta dinâmica

Cria subpastas automaticamente com base em propriedades do arquivo.

1. Selecione **"Mover para subpasta"**
2. Use variáveis como `{extensão}`, `{ano}`, `{mês}` no nome da subpasta

### Renomear

Altera o nome do arquivo seguindo um padrão.

1. Selecione **"Renomear"**
2. Defina o padrão de renomeação usando variáveis

## Testando com simulação

**Nunca** aplique regras novas sem testar antes!

1. Após salvar a regra, acesse **"Simulação"**
2. Selecione a regra criada e as pastas-alvo
3. Clique em **"Iniciar Simulação"**
4. Revise o preview para verificar se o resultado é o esperado
5. Se algo estiver errado, volte e ajuste a regra

## Exemplos práticos

### Organizar PDFs

- **SE:** Extensão **igual a** `pdf`
- **ENTÃO:** Mover para `Documentos/PDFs`

### Separar imagens por tipo

- **SE:** Extensão **igual a** `jpg` **OU** `png` **OU** `gif`
- **ENTÃO:** Mover para `Imagens`

### Documentos do Office

- **SE:** Extensão **igual a** `docx` **OU** `xlsx` **OU** `pptx`
- **ENTÃO:** Mover para `Documentos/Office`

### Arquivos grandes para backup

- **SE:** Tamanho **maior que** `100 MB`
- **ENTÃO:** Mover para `Backup/Arquivos Grandes`

### Relatórios mensais

- **SE:** Nome **começa com** `relatorio_` **E** extensão **igual a** `pdf`
- **ENTÃO:** Mover para `Trabalho/Relatórios`

---

> **Lembre-se:** O DeskCraft sempre faz uma simulação primeiro. Nenhum arquivo é movido sem sua confirmação explícita.
