// Vocabulário de Alto Valiriano (criado por David J. Peterson), conferido em
// wiki.languageinvention.com (High Valyrian Dictionary e phrasebook).
// Tipos: mc (múltipla escolha), build (banco de palavras), match (pares), type (digitar)
const mc = (q, options, answer) => ({ type: 'mc', q, options, answer })
const build = (pt, words, extra) => ({ type: 'build', pt, words, extra })
const match = (pairs) => ({ type: 'match', pairs })
const type = (pt, answers) => ({ type: 'type', pt, answers })

export const UNITS = [
  {
    id: 'u1', title: 'Unidade 1', subtitle: 'Saudações de Valíria', color: '#ff7a1a', dark: '#c75400',
    lessons: [
      { id: 'u1l1', title: 'Rytsas!', icon: '👋', exercises: [
        mc('Como se diz "Olá"?', ['Rytsas', 'Geros ilas', 'Kirimvose', 'Daor'], 'Rytsas'),
        mc('Como se diz "Tchau"?', ['Kessa', 'Geros ilas', 'Rytsas', 'Kostilus'], 'Geros ilas'),
        match([['Olá', 'Rytsas'], ['Obrigado', 'Kirimvose'], ['Sim', 'Kessa'], ['Não', 'Daor']]),
        type('Obrigado', ['kirimvose']),
        mc('O que significa "Kostilus"?', ['Por favor', 'Desculpa', 'Bom dia', 'Adeus'], 'Por favor'),
        build('Adeus', ['Geros', 'ilas'], ['Rytsas', 'Tubis', 'sȳz']),
        type('Olá', ['rytsas']),
        mc('O que significa "Tubis sȳz"?', ['Bom dia', 'Boa noite', 'Até logo', 'Muito obrigado'], 'Bom dia'),
      ]},
      { id: 'u1l2', title: 'Valar morghūlis', icon: '⚔️', exercises: [
        mc('O que significa "Valar morghūlis"?', ['Todos os homens devem morrer', 'Todos os homens devem servir', 'Eu te amo', 'O dragão não é escravo'], 'Todos os homens devem morrer'),
        mc('Qual é a resposta a "Valar morghūlis"?', ['Valar dohaeris', 'Geros ilas', 'Rytsas', 'Kessa'], 'Valar dohaeris'),
        build('Todos os homens devem servir', ['Valar', 'dohaeris'], ['morghūlis', 'vala', 'ābra']),
        match([['Homem', 'Vala'], ['Mulher', 'Ābra'], ['Menino', 'Taoba'], ['Menina', 'Riña']]),
        type('Homem', ['vala']),
        build('Todos os homens devem morrer', ['Valar', 'morghūlis'], ['dohaeris', 'Vala', 'Daor']),
        mc('O que significa "Ābra"?', ['Mulher', 'Mãe', 'Rainha', 'Bebê'], 'Mulher'),
        type('Mulher', ['abra']),
      ]},
      { id: 'u1l3', title: 'Frases úteis', icon: '💬', exercises: [
        mc('O que significa "Avy jorrāelan"?', ['Eu te amo', 'Me desculpe', 'Eu te saúdo', 'Obrigado'], 'Eu te amo'),
        build('Me desculpe', ['Avy', 'imundan'], ['jorrāelan', 'rytsuran', 'Nyke']),
        match([['Eu', 'Nyke'], ['Você', 'Ao'], ['Ele/Ela', 'Ziry'], ['Meu', 'Ñuha']]),
        build('Obrigado, eu te agradeço', ['Kirimvose', 'avy', 'rytsuran'], ['imundan', 'Rytsas', 'ao']),
        type('Eu', ['nyke']),
        mc('O que significa "Skoros gaomā?"', ['O que você está fazendo?', 'O que você pensa?', 'Qual é o seu nome?', 'Onde você mora?'], 'O que você está fazendo?'),
        build('Eu te amo', ['Avy', 'jorrāelan'], ['imundan', 'Ao', 'rytsuran']),
        type('Você', ['ao']),
      ]},
    ],
  },
  {
    id: 'u2', title: 'Unidade 2', subtitle: 'Família e números', color: '#e63946', dark: '#a8202c',
    lessons: [
      { id: 'u2l1', title: 'Família', icon: '👨‍👩‍👧', exercises: [
        match([['Mãe', 'Muña'], ['Pai', 'Kepa'], ['Filha', 'Tala'], ['Filho', 'Trēsy']]),
        mc('Como se diz "pais"?', ['Muñar', 'Riñar', 'Valar', 'Muña'], 'Muñar'),
        type('Mãe', ['muna']),
        mc('O que significa "Lēkia"?', ['Irmão mais velho', 'Irmão mais novo', 'Primo', 'Tio'], 'Irmão mais velho'),
        match([['Irmã mais velha', 'Mandia'], ['Irmã mais nova', 'Hāedar'], ['Irmão mais novo', 'Valonqar'], ['Gêmeo', 'Idaña']]),
        type('Pai', ['kepa']),
        mc('Como se diz "bebê"?', ['Rūs', 'Riña', 'Taoba', 'Tala'], 'Rūs'),
        match([['Marido', 'Valzȳrys'], ['Esposa', 'Ābrazȳrys'], ['Crianças', 'Riñar'], ['Bebê', 'Rūs']]),
      ]},
      { id: 'u2l2', title: 'Números', icon: '🔢', exercises: [
        match([['1', 'Mēre'], ['2', 'Lanta'], ['3', 'Hāre'], ['4', 'Izula']]),
        mc('Como se diz "5"?', ['Tōma', 'Bȳre', 'Vōre', 'Ampa'], 'Tōma'),
        type('Dez (10)', ['ampa']),
        match([['6', 'Bȳre'], ['7', 'Sīkuda'], ['8', 'Jēnqa'], ['9', 'Vōre']]),
        mc('O que significa "Lanta ampā"?', ['12', '20', '2', '11'], '12'),
        type('Três (3)', ['hare']),
        mc('O que significa "Sīkuda"?', ['7', '6', '8', '70'], '7'),
        build('Onze (11)', ['Mēre', 'ampā'], ['Lanta', 'Hāre', 'Ampa']),
      ]},
      { id: 'u2l3', title: 'Realeza', icon: '👑', exercises: [
        match([['Rei', 'Dārys'], ['Rainha', 'Dāria'], ['Senhor', 'Āeksio'], ['Príncipe', 'Dārilaros']]),
        mc('O que significa "Dāria"?', ['Rainha', 'Rei', 'Princesa', 'Herdeira'], 'Rainha'),
        type('Rei', ['darys']),
        mc('Como se diz "cavaleiro, soldado"?', ['Azantys', 'Āeksio', 'Jentys', 'Korze'], 'Azantys'),
        match([['Espada longa', 'Korze'], ['Escudo', 'Somby'], ['Faca', 'Egry'], ['Guerra', 'Vīlībāzma']]),
        type('Espada longa', ['korze']),
        mc('O que significa "Dāez"?', ['Livre', 'Escravo', 'Bonito', 'Verdadeiro'], 'Livre'),
        mc('Como se diz "Exército"?', ['Mentyr', 'Mentys', 'Somby', 'Lenton'], 'Mentyr'),
      ]},
    ],
  },
  {
    id: 'u3', title: 'Unidade 3', subtitle: 'Dragões e o mundo', color: '#8b5cf6', dark: '#6237c4',
    lessons: [
      { id: 'u3l1', title: 'Zaldrīzes', icon: '🐉', exercises: [
        mc('Como se diz "dragão"?', ['Zaldrīzes', 'Zokla', 'Gryves', 'Kēlio'], 'Zaldrīzes'),
        mc('O que significa "Drakarys"?', ['Fogo de dragão', 'Gelo', 'Voar', 'Ovo'], 'Fogo de dragão'),
        match([['Fogo', 'Perzys'], ['Gelo', 'Suvion'], ['Água', 'Iēdar'], ['Ar', 'Paghar']]),
        type('Dragão', ['zaldrizes']),
        build('Um dragão não é escravo', ['Zaldrīzes', 'buzdari', 'iksos', 'daor'], ['kessa', 'vala', 'perzys']),
        mc('O que significa "Sōvegon"?', ['Voar', 'Dormir', 'Ver', 'Amar'], 'Voar'),
        type('Fogo', ['perzys']),
        match([['Ouro', 'Āeksion'], ['Prata', 'Gēlion'], ['Ferro', 'Āegion'], ['Pedra', 'Dōron']]),
      ]},
      { id: 'u3l2', title: 'Cores e céu', icon: '🌙', exercises: [
        match([['Vermelho', 'Mele'], ['Preto', 'Zōbrie'], ['Azul/verde', 'Kasta'], ['Dourado', 'Qeldlie']]),
        mc('O que significa "Nūda"?', ['Grisalho, branco', 'Vermelho', 'Escuro', 'Bonito'], 'Grisalho, branco'),
        type('Preto', ['zobrie']),
        match([['Sol', 'Vēzos'], ['Lua', 'Hūra'], ['Mar', 'Embar'], ['Manhã', 'Ñāqes']]),
        mc('Como se diz "bonito"?', ['Gevie', 'Sȳz', 'Lyka', 'Pirta'], 'Gevie'),
        type('Lua', ['hura']),
        mc('O que significa "Lyka"?', ['Calmo', 'Livre', 'Falso', 'Bom'], 'Calmo'),
        match([['Verão', 'Jaedos'], ['Inverno', 'Sōnar'], ['Primavera', 'Kiōs'], ['Outono', 'Iosrūlirion']]),
      ]},
      { id: 'u3l3', title: 'Animais e verbos', icon: '🐺', exercises: [
        match([['Lobo', 'Zokla'], ['Leão', 'Kēlio'], ['Cavalo', 'Anne'], ['Corvo', 'Lāra']]),
        mc('O que significa "Jaos"?', ['Cachorro', 'Gato', 'Urso', 'Peixe'], 'Cachorro'),
        type('Gato', ['keli']),
        match([['Ser, existir', 'Sagon'], ['Dormir', 'Ēdrugon'], ['Ver', 'Ūndegon'], ['Amar', 'Jorrāelagon']]),
        mc('O que significa "Jaelagon"?', ['Querer, desejar', 'Falar', 'Confiar', 'Voar'], 'Querer, desejar'),
        type('Lobo', ['zokla']),
        mc('Como se diz "falar, dizer"?', ['Ivestragon', 'Pāsagon', 'Ilagon', 'Sagon'], 'Ivestragon'),
        match([['Urso', 'Gryves'], ['Águia', 'Zēres'], ['Peixe', 'Klios'], ['Coruja', 'Atroksia']]),
      ]},
    ],
  },
]

export const ALL_LESSONS = UNITS.flatMap(u => u.lessons.map(l => ({ ...l, unit: u })))
