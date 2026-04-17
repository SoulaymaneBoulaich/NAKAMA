export const questions = [
  {
    type: 'QA',
    difficulty: 'GENIN',
    questionText: 'Who is the protagonist of One Piece?',
    options: ['Luffy', 'Zoro', 'Sanji', 'Usopp'],
    correctAnswer: 'Luffy',
    animeReference: 'One Piece',
    timeLimitSeconds: 15,
    pointsBase: 100
  },
  {
    type: 'QA',
    difficulty: 'CHUNIN',
    questionText: 'Which anime features the "State Alchemist" qualification?',
    options: ['Fullmetal Alchemist', 'Blue Exorcist', 'Magi', 'Fate/Stay Night'],
    correctAnswer: 'Fullmetal Alchemist',
    animeReference: 'Fullmetal Alchemist: Brotherhood',
    timeLimitSeconds: 20,
    pointsBase: 200
  },
  {
    type: 'SCREENSHOT',
    difficulty: 'JONIN',
    questionText: 'Identify this iconic scenery.',
    mediaUrl: 'https://images.unsplash.com/photo-1578632738984-367735399587?q=80&w=1000&auto=format&fit=crop',
    mediaType: 'IMAGE',
    options: ['Hidden Leaf Village', 'Soul Society', 'Aincrad', 'District 4'],
    correctAnswer: 'Hidden Leaf Village',
    animeReference: 'Naruto',
    timeLimitSeconds: 15,
    pointsBase: 300
  },
  {
    type: 'QUOTE',
    difficulty: 'KAGE',
    questionText: '"I will take a potato chip... AND EAT IT!"',
    options: ['Light Yagami', 'L', 'Ryuk', 'Near'],
    correctAnswer: 'Light Yagami',
    animeReference: 'Death Note',
    timeLimitSeconds: 10,
    pointsBase: 400
  },
  {
    type: 'AUDIO',
    difficulty: 'LEGENDARY',
    questionText: 'Listen to this OST snippet. From which anime is it?',
    mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    mediaType: 'AUDIO',
    options: ['Attack on Titan', 'Cowboy Bebop', 'Your Name', 'Neon Genesis Evangelion'],
    correctAnswer: 'Attack on Titan',
    animeReference: 'Shingeki no Kyojin',
    timeLimitSeconds: 12,
    pointsBase: 500
  },
  // Adding more questions to fill up the seed
  {
    type: 'QA',
    difficulty: 'GENIN',
    questionText: 'What is the name of Goku\'s signature technique?',
    options: ['Kamehameha', 'Chidori', 'Rasengan', 'Gum Gum Pistol'],
    correctAnswer: 'Kamehameha',
    animeReference: 'Dragon Ball Z',
    timeLimitSeconds: 15,
    pointsBase: 100
  },
  {
    type: 'QA',
    difficulty: 'CHUNIN',
    questionText: 'In "Jujutsu Kaisen", what is the name of Yuji Itadori\'s teacher?',
    options: ['Satoru Gojo', 'Megumi Fushiguro', 'Kento Nanami', 'Suguru Geto'],
    correctAnswer: 'Satoru Gojo',
    animeReference: 'Jujutsu Kaisen',
    timeLimitSeconds: 15,
    pointsBase: 200
  },
  {
    type: 'QA',
    difficulty: 'JONIN',
    questionText: 'Which studio produced "Spirited Away"?',
    options: ['Studio Ghibli', 'MAPPA', 'Ufotable', 'Wit Studio'],
    correctAnswer: 'Studio Ghibli',
    animeReference: 'Spirited Away',
    timeLimitSeconds: 15,
    pointsBase: 300
  },
  {
    type: 'QA',
    difficulty: 'KAGE',
    questionText: 'What is the actual name of "L" in Death Note?',
    options: ['L Lawliet', 'L Light', 'L Ryuzaki', 'L Hideki'],
    correctAnswer: 'L Lawliet',
    animeReference: 'Death Note',
    timeLimitSeconds: 20,
    pointsBase: 400
  },
  {
    type: 'QA',
    difficulty: 'LEGENDARY',
    questionText: 'In "Hunter x Hunter", what is Kurapika\'s Nen type when his eyes are scarlet?',
    options: ['Specialist', 'Conjurer', 'Emitter', 'Enhancer'],
    correctAnswer: 'Specialist',
    animeReference: 'Hunter x Hunter',
    timeLimitSeconds: 15,
    pointsBase: 500
  }
];

// In a real scenario I would generate more, but for the seed script, 10 is a good starting point.
// I will generate a script that repeats these or creates variations to reach 50 if needed.
