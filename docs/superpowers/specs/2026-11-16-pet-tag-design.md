# Tag NFC dos pets: identificação + carteira de vacinação

## Intenção

O tutor quer uma tag NFC na coleira de cada pet. Ao encostar um celular, abre uma página do pet com duas funções:

1. **Carteira de vacinação**, o motivo principal. O tutor acompanha o que foi aplicado e o que vence em breve. A veterinária consulta na consulta, só lendo.
2. **Identificação para quem achar o pet**: nome, foto, botões de WhatsApp, ligar e enviar localização, e o aviso de "estou perdido". É o mesmo que a tag comercial do Mercado Livre oferece; o perfil dela não tem vacinas, e foi por isso que o projeto nasceu.

Só o tutor registra e edita. Isso precisa funcionar pelo celular, inclusive dentro da clínica, com foto do comprovante.

## Objetivos

- A tag é gravada **uma vez**. Depois, o tutor só atualiza dados, sem regravar a tag.
- Adicionar uma vacina pelo celular em menos de 1 minuto, com foto do comprovante.
- A página mostra no topo o que está **atrasado** ou **vence em até 30 dias**.
- Funciona para N pets com uma página só (`?pet=<id>`).

## Fora de escopo

- Veterinária ou terceiros registrando vacinas.
- Lembretes por e-mail ou push.
- Login, contas e banco de dados próprios.
- Funcionar offline.

## Anti-objetivos (falha mesmo se "funcionar")

- Ter que regravar a tag para atualizar alguma coisa.
- Ter servidor, banco ou dependência para manter.
- A foto do comprovante (com nome, endereço ou carimbo da clínica) ficar visível para quem achar o pet.

## Restrições

- A tag é NTAG213 ou NTAG215, com 144 bytes úteis no 213. A URL gravada precisa ser curta e estável.
- A tag não pode estar bloqueada (lock). Isso precisa ser confirmado com o vendedor antes da compra.
- Planilha, formulário e Drive ficam na conta **Gmail pessoal** do tutor, não no Workspace da empresa. O Workspace pode bloquear o "Publicar na web" e o upload no Forms.
- Hospedagem gratuita. No plano gratuito, o GitHub Pages exige repositório público.
- Tudo que a página exibe é público para quem tiver o link ou a tag. Aceito para nome, telefone, vacinas e microchip.

## Abordagens consideradas

| | Abordagem | Trade-off |
|---|---|---|
| **A (escolhida)** | Google Forms + Google Sheets + página estática no GitHub Pages lendo o CSV publicado | Custo zero, sem servidor, layout próprio com alertas. Atraso de até cerca de 5 min por cache do "Publicar na web". |
| B | Google Sites com a planilha incorporada | Sem código, mas com cara de documento no celular, sem alerta de vencimento e com botões ruins. |
| C | App próprio (Supabase/Firebase) com login e upload | Edição e fotos privadas de verdade, mas exige manter login, banco e upload para um único usuário. |

O tutor escolheu A.

## Desenho

### Dados (uma planilha Google)

**Aba `Pets`**, editada à mão, uma linha por pet:

| coluna | exemplo |
|---|---|
| `id` | `thor` (usado na URL) |
| `nome` | Thor |
| `foto` | `fotos/thor.jpg` (caminho no repositório) |
| `whatsapp` | `5511999999999` |
| `telefone` | `+5511999999999` |
| `mensagem` | "Sou dócil, me leve pra casa" |
| `microchip` | número |
| `alergias`, `remedios` | texto livre |
| `perdido` | `TRUE`/`FALSE` |

**Aba `Vacinas`**, criada pelo Google Forms como aba de respostas:

| campo do formulário | tipo |
|---|---|
| Pet | lista suspensa com os `id`s |
| Vacina | múltipla escolha (V8/V10, Raiva, Gripe, Giárdia, Leishmaniose, V4/V5 felina, Vermífugo, Antipulgas) + "Outro" |
| Data de aplicação | data |
| Próxima dose | data (opcional) |
| Lote | texto curto (opcional) |
| Clínica / Veterinário | texto curto (opcional) |
| Comprovante | upload de arquivo (imagem, opcional) |

- **Adicionar:** o tutor abre o link do formulário, salvo na tela inicial do celular.
- **Editar ou apagar:** o tutor edita direto a aba `Vacinas`.
- **Fotos:** o upload do Forms grava as fotos numa pasta do Drive do tutor, que continua **privada**. A planilha guarda o link, que só abre para quem está logado como tutor.
- **Login no formulário:** a coleta de e-mail fica desligada no formulário. O upload exige login Google, mas como só o tutor responde, isso não é problema.
- **Publicação:** cada aba é publicada como CSV em Arquivo → Compartilhar → Publicar na web. As duas URLs ficam como constantes no HTML.

### Página (`index.html`, um arquivo)

- HTML, CSS e JS puros, sem build e sem dependências.
- URL gravada na tag: `https://<usuario>.github.io/pet-tag/?pet=thor`.
- Ao abrir, a página busca os dois CSVs, filtra pelo `id` do pet e renderiza nesta ordem:
  1. Faixa vermelha "ESTOU PERDIDO" se `perdido = TRUE`.
  2. Foto, nome e mensagem.
  3. Alerta de vacina: atrasada em vermelho, vencendo em até 30 dias em amarelo. O alerta usa a última aplicação de cada vacina, ou seja, o registro mais recente com aquele nome.
  4. Botões:
     - WhatsApp (`https://wa.me/<whatsapp>`).
     - Ligar (`tel:`).
     - Enviar localização: usa `navigator.geolocation` e abre o WhatsApp com um link do Google Maps. Se a permissão for negada, abre o WhatsApp sem localização.
  5. Saúde: microchip, alergias e remédios.
  6. Histórico de vacinas, da mais recente para a mais antiga: vacina, data, próxima dose e ícone 📷 apontando para o link do Drive quando houver comprovante.
- **Pet não encontrado** ou CSV fora do ar: a página mostra uma mensagem simples e **sempre** os botões de WhatsApp e Ligar. Para isso, o HTML guarda uma constante de contato de reserva com o número do tutor, o mesmo para todos os pets. Se o número mudar, ele precisa ser editado em dois lugares: na planilha e no HTML.
- O agrupamento de vacinas para o alerta compara nomes normalizados (sem espaços nas pontas, em minúsculas).
- O 📷 do comprovante só abre para o tutor logado. A veterinária vê datas e lote, mas não a foto. Isso é intencional.
- O CSV tem campos com aspas, vírgulas e quebras de linha, então precisa de um parser que trate aspas. Pode ser escrito à mão, em poucas linhas.
- Datas: a planilha fica com localidade pt-BR, o que faz o CSV vir em `dd/mm/aaaa`, e o parser assume esse formato.

### Teste

Uma verificação rodável (`check.html` ou um script Node com `assert`) cobrindo:
- o parser de CSV com aspas, vírgula e quebra de linha;
- o cálculo de status da vacina: em dia, vence em até 30 dias, atrasada, sem próxima dose.

### Setup único (manual, pelo tutor)

1. Criar a planilha e o formulário, publicar as duas abas e colar as URLs no HTML.
2. Criar o repositório público `pet-tag`, colocar as fotos em `fotos/` e ativar o GitHub Pages.
3. Gravar a URL de cada pet na tag com o app NFC Tools e testar com iPhone e Android.
4. Salvar o link do formulário na tela inicial do celular.

## Decisões minhas (o tutor pode revisar)

- A foto do pet fica no repositório, não no Drive. Ela precisa ser pública, e assim não há permissão do Drive para configurar.
- Uma página só para todos os pets, com `?pet=<id>`.
- A janela de alerta é de 30 dias.
- A data da próxima dose é digitada pelo tutor, não calculada pelo tipo de vacina.
- O contato de reserva fica fixo no HTML, para quem achar o pet nunca ficar sem botão de contato.
- O campo Vacina é de múltipla escolha com "Outro", para evitar que "V10" e "v10" virem duas vacinas diferentes.
- A URL da tag depende do usuário do GitHub e do nome do repositório. Não renomeie nenhum dos dois. Domínio próprio fica para depois, se um dia for preciso.

## Riscos para testar logo no início

- **Upload pelo celular:** no iPhone, o upload do Forms pode não oferecer "tirar foto" direto. Nesse caso, o caminho é tirar a foto antes e escolher da galeria. Isso pode estourar a meta de 1 minuto.
- **Atraso do "Publicar na web":** às vezes passa de 5 minutos.
- **Limite de upload:** o Forms aceita até 10 MB por arquivo por padrão, o suficiente para uma foto de celular.

## Deixado para quem constrói

- Visual: cores, tipografia e espaçamento, com foco em mobile.
- Implementação do parser de CSV e da renderização.
- Texto das mensagens de erro.
