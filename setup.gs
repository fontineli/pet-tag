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

// Carteiras da Pérola (cachorra) e da Olivia (gata), fotos IMG_5217 e 5220–5224 de 18/11/2026.
// ponytail: Vanguard Plus e Nobivac DHPPi+L = V8; as duas etiquetas Nobivac Feline = V5.
const HISTORICO_2 = [
  ['perola', 'V8', '21/06/2023', '14/07/2023', '013/22', 'Dr. José Amaro Valentim Neto'],
  ['perola', 'V8', '14/07/2023', '07/08/2023', '013/22', 'Dr. José Amaro Valentim Neto'],
  ['perola', 'V8', '07/08/2023', '07/08/2024', '025/22', 'Dr. José Amaro Valentim Neto'],
  ['perola', 'Raiva', '07/08/2023', '07/08/2024', '023/22', 'Dr. José Amaro Valentim Neto'],
  ['perola', 'Raiva', '04/03/2025', '04/03/2026', '003/24', 'Dra. Romana da Costa'],
  ['perola', 'V8', '09/03/2025', '04/03/2026', '004/24', 'Dra. Romana da Costa'],
  ['perola', 'Gripe', '13/11/2025', '01/12/2025', '004/23', 'Dr. Jorge J. Rodríguez Sánchez'],
  ['perola', 'Gripe', '05/12/2025', '05/12/2026', '004/23', 'Dra. Paulyanna Medeiros'],
  ['perola', 'V8', '07/05/2026', '07/05/2027', '028/24', 'Dra. Marijara Bandeira (VET Amiga)'],
  ['perola', 'Raiva', '07/05/2026', '07/05/2027', '026/24', 'Dra. Marijara Bandeira (VET Amiga)'],
  ['olivia', 'V5', '05/07/2024', '26/07/2024', '004/23', 'Dra. Ana Inez Medeiros Cabral'],
  ['olivia', 'V5', '04/03/2025', '04/03/2026', '003/24 + 004/24', 'Dra. Romana da Costa'],
  ['olivia', 'Raiva', '04/03/2025', '04/03/2026', '003/24', 'Dra. Romana da Costa'],
  ['olivia', 'V5', '22/07/2026', '22/07/2027', '009/24', 'Dra. Marijara Bandeira (VET Amiga)'],
  ['olivia', 'Raiva', '22/07/2026', '22/07/2027', '013/24', 'Dra. Marijara Bandeira (VET Amiga)'],
];

// Acrescenta HISTORICO_2 na aba Vacinas. Pula linha já lançada (pet + vacina + aplicação), então pode rodar de novo.
function importar() {
  const vac = SpreadsheetApp.openById(PLANILHA).getSheetByName('Vacinas');
  const chave = (p, v, d) => `${p}|${v}|${d.getTime()}`;
  const existe = new Set(vac.getRange(2, 2, Math.max(vac.getLastRow() - 1, 1), 3).getValues()
    .filter(([p, , d]) => d instanceof Date).map(([p, v, d]) => chave(p, v, d)));
  const novas = HISTORICO_2.map(([p, v, a, n, l, c]) => [data_(a), p, v, data_(a), data_(n), l, c])
    .filter(r => !existe.has(chave(r[1], r[2], r[3])));
  if (novas.length) vac.getRange(vac.getLastRow() + 1, 1, novas.length, 7).setValues(novas);
  Logger.log(`Inseri ${novas.length} de ${HISTORICO_2.length} linhas.`);
}

// Coluna raiva_ate em Pets (a tag pública mostra só ela). Pet novo: arraste a fórmula de K para a linha nova.
function corrigirRaiva() {
  const pets = SpreadsheetApp.openById(PLANILHA).getSheetByName('Pets');
  Logger.log('Antes: ' + pets.getRange('K2').getFormula() + ' → ' + pets.getRange('K2').getDisplayValue());
  pets.getRange('K2:K').clearContent().clearDataValidations(); // K nasceu herdando o checkbox de J
  const n = pets.getLastRow() - 1;
  pets.getRange(2, 11, n, 1).setFormulas([...Array(n)].map((_, i) =>
    // planilha em pt-BR: argumentos separados por ";"
    [`=IFERROR(1/(1/MAXIFS(Vacinas!$E:$E; Vacinas!$B:$B; $A${i + 2}; Vacinas!$C:$C; "Raiva")); "")`]));
  pets.getRange('K:K').setNumberFormat('dd/mm/yyyy');
  SpreadsheetApp.flush();
  Logger.log('Depois: ' + pets.getRange('K2:K' + (n + 1)).getDisplayValues().join(' | '));
}
