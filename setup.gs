// Setup único da planilha + formulário. Cole em script.google.com (Gmail pessoal) e rode `setup`.
// ponytail: o Apps Script não cria pergunta de upload; o "Comprovante" é adicionado à mão no Forms.

const PETS = ['luck', 'olivia', 'perola'];
const VACINAS = ['V8', 'V10', 'Raiva', 'Gripe', 'Giárdia', 'Leishmaniose', 'V4', 'V5', 'Vermífugo', 'Antipulgas'];
// Histórico real do Luck: pet, vacina, aplicação, próxima dose, lote, clínica
const HISTORICO = [
  ['luck', 'Antipulgas', '24/09/2025', '24/12/2025', '', 'Bravecto 10-20 kg'],
  ['luck', 'V10', '17/10/2025', '07/11/2025', '015/24', 'Dra. Tatiane Moura (Equilibrium)'],
  ['luck', 'Gripe', '17/10/2025', '07/11/2025', '001/24', 'Dra. Tatiane Moura (Equilibrium)'],
  ['luck', 'Raiva', '31/10/2025', '31/10/2026', '11/24', 'UVZ Parnamirim'],
  ['luck', 'V10', '10/11/2025', '10/11/2026', '015/24', 'Dra. Tatiane Moura (Equilibrium)'],
  ['luck', 'Gripe', '10/11/2025', '10/11/2026', '001/24', 'Dra. Tatiane Moura (Equilibrium)'],
  ['luck', 'V10', '11/11/2026', '11/11/2027', '012/25', 'Dra. Mariana Bandeira (VET Amiga)'],
  ['luck', 'Raiva', '11/11/2026', '11/11/2027', '020/25', 'Dra. Mariana Bandeira (VET Amiga)'],
  ['luck', 'Gripe', '11/11/2026', '11/11/2027', '002/25', 'Dra. Mariana Bandeira (VET Amiga)'],
];

// sufixo _ esconde a função do menu Executar (rodar ela sozinha dava o erro de split)
function data_(s) {
  if (!s) return '';
  const [dd, mm, yy] = s.split('/');
  return new Date(+yy, mm - 1, +dd);
}

function tenta_(nome, fn) {
  try { fn(); } catch (e) { Logger.log(`Pulei "${nome}": ${e.message}`); }
}

function setup() {
  const ss = SpreadsheetApp.create('Pet Tag');
  ss.setSpreadsheetLocale('pt_BR');
  ss.setSpreadsheetTimeZone('America/Fortaleza');

  // Aba Pets
  const pets = ss.getSheets()[0].setName('Pets');
  pets.getRange('D:E').setNumberFormat('@');
  pets.getRange('G:G').setNumberFormat('@');
  pets.getRange(1, 1, 4, 10).setValues([
    ['id', 'nome', 'foto', 'whatsapp', 'telefone', 'mensagem', 'microchip', 'alergias', 'remedios', 'perdido'],
    ['luck', 'Luck', 'fotos/luck.jpg', '', '', 'Luck Sky Walker. Sou dócil, me leve pra casa', '', '', '', false],
    ['olivia', 'Olivia', '', '', '', '', '', '', '', false],
    ['perola', 'Perola', '', '', '', '', '', '', '', false],
  ]);
  pets.getRange('J2:J').insertCheckboxes();
  pets.setFrozenRows(1);
  pets.getRange('1:1').setFontWeight('bold');

  // Formulário ligado à planilha
  const form = FormApp.create('Vacinas do pet').setCollectEmail(false);
  form.addListItem().setTitle('Pet').setChoiceValues(PETS).setRequired(true);
  form.addMultipleChoiceItem().setTitle('Vacina').setChoiceValues(VACINAS).showOtherOption(true).setRequired(true);
  form.addDateItem().setTitle('Data de aplicação').setRequired(true);
  form.addDateItem().setTitle('Próxima dose');
  form.addTextItem().setTitle('Lote');
  form.addTextItem().setTitle('Clínica / Veterinário');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();

  // Aba de respostas vira "Vacinas"
  const vac = SpreadsheetApp.openById(ss.getId()).getSheets().find(s => s.getFormUrl());
  vac.setName('Vacinas');
  vac.getRange(1, 8).setValue('Comprovante'); // a pergunta de upload reaproveita esta coluna
  vac.getRange(2, 1, HISTORICO.length, 7).setValues(
    HISTORICO.map(([p, v, a, n, l, c]) => [data_(a), p, v, data_(a), data_(n), l, c]));
  vac.getRange('D:E').setNumberFormat('dd/mm/yyyy');
  vac.getRange('F:F').setNumberFormat('@');
  // O Sheets agora cria a aba de respostas como Tabela, que já congela o cabeçalho e
  // tem cores alternadas, e recusa algumas ações de coluna. Esses passos são só visuais.
  tenta_('congelar cabeçalho', () => vac.setFrozenRows(1));
  tenta_('esconder carimbo', () => vac.hideColumns(1));
  tenta_('cores alternadas', () => vac.getRange('A:H').applyRowBanding(SpreadsheetApp.BandingTheme.BLUE));

  const ultima = 'COUNTIFS($B:$B,$B2,$C:$C,$C2,$D:$D,">"&$D2)=0';
  const area = vac.getRange('B2:H');
  vac.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().setRanges([area]).setBackground('#F4C7C3')
      .whenFormulaSatisfied(`=AND($E2<>"",$E2<TODAY(),${ultima})`).build(),
    SpreadsheetApp.newConditionalFormatRule().setRanges([area]).setBackground('#FCE8B2')
      .whenFormulaSatisfied(`=AND($E2<>"",$E2>=TODAY(),$E2<=TODAY()+30,${ultima})`).build(),
  ]);

  Logger.log('Planilha: ' + ss.getUrl());
  Logger.log('Editar formulário: ' + form.getEditUrl());
  Logger.log('Responder formulário: ' + form.getPublishedUrl());
}

const PLANILHA = '1nRWpjR6dF1mre2uApL0r5gTa87ENxyt8aCn1yAf1M6A';

// Coluna raiva_ate em Pets (a tag pública mostra só ela). Pet novo: arraste a fórmula de K para a linha nova.
function corrigirRaiva() {
  const pets = SpreadsheetApp.openById(PLANILHA).getSheetByName('Pets');
  Logger.log('Antes: ' + pets.getRange('K2').getFormula() + ' → ' + pets.getRange('K2').getDisplayValue());
  pets.getRange('K2:K').clearContent();
  const n = pets.getLastRow() - 1;
  pets.getRange(2, 11, n, 1).setFormulas([...Array(n)].map((_, i) =>
    [`=IFERROR(1/(1/MAXIFS(Vacinas!$E:$E, Vacinas!$B:$B, $A${i + 2}, Vacinas!$C:$C, "Raiva")), "")`]));
  pets.getRange('K:K').setNumberFormat('dd/mm/yyyy');
  SpreadsheetApp.flush();
  Logger.log('Depois: ' + pets.getRange('K2:K' + (n + 1)).getDisplayValues().join(' | '));
}

// Carteira privada: Implantar como app da Web, executar como "Eu", acesso "Somente eu".
function doGet(e) {
  const filtro = (e.parameter.pet || '').trim().toLowerCase();
  const ss = SpreadsheetApp.openById(PLANILHA);
  const formUrl = FormApp.openByUrl(ss.getFormUrl()).getPublishedUrl(); // fora do repo público
  const [head, ...linhas] = ss.getSheetByName('Vacinas').getDataRange().getDisplayValues();
  const c = nome => head.indexOf(nome);
  const regs = linhas
    .map(l => ({ pet: l[c('Pet')].trim().toLowerCase(), vacina: l[c('Vacina')].trim(), aplic: l[c('Data de aplicação')],
      prox: l[c('Próxima dose')], lote: l[c('Lote')], clinica: l[c('Clínica / Veterinário')], foto: (l[c('Comprovante')] || '').split(/[\s,]+/)[0] }))
    .filter(r => r.pet && (!filtro || r.pet === filtro))
    .sort((a, b) => dia_(b.aplic) - dia_(a.aplic));

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  let html = `<style>body{font:15px system-ui,sans-serif;margin:16px;color:#2b2b2b}h2{margin:24px 0 8px}
    table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:6px 4px;border-bottom:1px solid #eee}
    th{color:#777;font-weight:500}.atrasada{background:#f4c7c3}.vence{background:#fce8b2}a{text-decoration:none}</style>
    <p><a target="_blank" href="${formUrl}">➕ Registrar vacina</a> · <a target="_blank" href="https://docs.google.com/spreadsheets/d/${PLANILHA}/edit">Planilha</a></p>`;
  for (const pet of [...new Set(regs.map(r => r.pet))]) {
    const visto = new Set();
    html += `<h2>${esc_(pet)}</h2><table><tr><th>Vacina</th><th>Aplicação</th><th>Próxima</th><th>Lote</th><th>Clínica</th><th></th></tr>`;
    for (const r of regs.filter(r => r.pet === pet)) {
      const ultima = !visto.has(r.vacina.toLowerCase()); visto.add(r.vacina.toLowerCase()); // regs já vem do mais novo pro mais velho
      const dias = r.prox ? (dia_(r.prox) - hoje) / 864e5 : null;
      const cls = !ultima || dias === null ? '' : dias < 0 ? 'atrasada' : dias <= 30 ? 'vence' : '';
      html += `<tr class="${cls}"><td>${esc_(r.vacina)}</td><td>${esc_(r.aplic)}</td><td>${esc_(r.prox)}</td><td>${esc_(r.lote)}</td>` +
        `<td>${esc_(r.clinica)}</td><td>${r.foto.startsWith('http') ? `<a target="_blank" href="${esc_(r.foto)}">📷</a>` : ''}</td></tr>`;
    }
    html += '</table>';
  }
  if (!regs.length) html += '<p>Nenhuma vacina registrada.</p>';
  return HtmlService.createHtmlOutput(html).setTitle('Vacinas').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function dia_(s) { const [d, m, y] = (s || '').split(' ')[0].split('/'); return y ? new Date(+y, m - 1, +d) : new Date(0); }
function esc_(s) { return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]); }
