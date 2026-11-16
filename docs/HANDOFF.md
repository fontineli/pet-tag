# Handoff: pet-tag (16/11/2026)

## Contents

- [Estado atual](#estado-atual)
- [Mudanças em relação ao spec](#mudanças-em-relação-ao-spec)
- [Roteiro de teste](#roteiro-de-teste)
- [Próximos passos](#próximos-passos)
- [Pegadinhas já encontradas](#pegadinhas-já-encontradas)

## Estado atual

Está no ar e com dados reais.

| Peça | Onde | Status |
|---|---|---|
| Página da tag | https://fontineli.github.io/pet-tag/?pet=luck (também `olivia` e `perola`) | GitHub Pages, branch `main` |
| Planilha "Pet Tag" | Drive de gabriel0fontineli@gmail.com, abas `Pets` e `Vacinas` | `Pets` publicada como CSV; `Vacinas` **não** é publicada |
| Formulário "Vacinas do pet" | Drive, ligado à aba `Vacinas` | Tem a pergunta `Comprovante` (upload) |
| Carteira privada | https://script.google.com/macros/s/AKfycbzuxF2NrYN1psCMPoXxEl_LQby_94Fb7bTI_fe25-B5RGiceQU4wydpLiLNxQcpjwWa/exec | App da Web com acesso "Somente eu". O link sem `?pet=` mostra todos os pets |
| Script | `setup.gs` = projeto do Apps Script (`setup`, `corrigirRaiva`, `doGet`) | O editor precisa estar com a mesma versão do repositório |

## Mudanças em relação ao spec

- **As vacinas saíram da tag pública.** A tag mostra só identificação, botões, a linha "Antirrábica: válida até …" e um link 🔒 para a carteira. O histórico e os alertas ficam na carteira privada (`doGet` em `setup.gs`) e na planilha.
- `raiva_ate` (coluna K de `Pets`) usa fórmula por linha: `MAXIFS` da `Próxima dose` com `Vacina = "Raiva"`.
- As opções de vacina ficaram separadas (`V8`, `V10`, `V4`, `V5`), não "V8/V10". O motivo é que o agrupamento compara o nome.
- `lib.js` perdeu `vaccineStatus`, `latestByVaccine` e `firstUrl`, que agora vivem só no `doGet`.

## Roteiro de teste

- [ ] Abrir `?pet=luck` no celular pelo 4G. Deve aparecer a foto, o nome, a mensagem, os botões WhatsApp, Ligar e Enviar localização, "Antirrábica: válida até 11/11/2027" e o link 🔒.
- [ ] Abrir `?pet=olivia` e `?pet=perola`. Deve aparecer a foto e não deve aparecer a linha de antirrábica, porque elas ainda não têm Raiva registrada.
- [ ] Abrir `?pet=rex`. Deve aparecer "Pet não encontrado" com os botões de reserva.
- [ ] Tocar em WhatsApp. Deve abrir conversa com o 84 98800-1207.
- [ ] Tocar em Ligar. Deve abrir o discador.
- [ ] Tocar em Enviar localização. Deve pedir permissão e abrir o WhatsApp com "Achei o Luck! Estou aqui: maps…".
- [ ] Marcar `perdido` do Luck e esperar uns 5 min. Deve aparecer a faixa vermelha "ESTOU PERDIDO". Depois desmarcar.
- [ ] Tocar no 🔒 logado como gabriel0fontineli@gmail.com. A carteira do Luck deve abrir com o Antipulgas em vermelho.
- [ ] Abrir o 🔒 numa aba anônima. O Google deve pedir login ou negar o acesso.
- [ ] Registrar uma vacina com foto pelo formulário, no iPhone. Anotar se o formulário oferece "tirar foto" ou só a galeria. O registro deve aparecer na carteira com 📷, e o 📷 deve abrir a foto no Drive.
- [ ] Registrar uma Raiva para a Olivia. Depois de uns 5 min, a tag dela deve mostrar a antirrábica.
- [ ] Na aba `Vacinas`, uma linha atrasada deve ficar vermelha e a que vence em até 30 dias, amarela. As regras foram escritas com `,`, então podem ter quebrado na planilha pt-BR. Se não houver cor, reescreva com `;`.

## Próximos passos

1. Rodar o roteiro de teste acima.
2. Devolver os checkboxes em `Pets!J2:J4` (Inserir → Caixa de seleção). Eles se perderam quando a validação de dados foi limpa.
3. Gravar as tags no NFC Tools, em Escrever → URL, uma por pet. **Não trancar a tag.** Testar com iPhone e Android.
4. Salvar o link `/exec` e o link de responder o formulário na tela inicial do celular.
5. Opcional: o link de responder o formulário ficou exposto no commit `b7cb96c`, que está no histórico do repositório público. Para fechar isso, gere um link novo do formulário ou reescreva o histórico.

## Pegadinhas já encontradas

- **A planilha está em pt-BR.** Fórmulas gravadas por `setFormula` precisam de `;`. Com `,`, a célula dá `#ERROR!`.
- **A aba de respostas do Forms vira Tabela.** Não aceita congelar linhas nem apagar colunas com dados do formulário, só ocultar. A coluna H está oculta e vazia, e o comprovante fica na coluna I.
- **"Interromper publicação" despublica a planilha inteira** e derruba a tag. Para trocar o que está publicado, use "Conteúdo publicado e configurações".
- **A publicação demora uns 5 minutos** para refletir as edições.
- **Para conferir o CSV, use o parser** (`lib.js`), não `cut -d,`, porque as mensagens têm vírgula.
- **O Apps Script não cria pergunta de upload.** A pergunta `Comprovante` foi criada à mão.
- **Uma coluna inserida ao lado de J herda o checkbox.**
