const questions = [
  'If you had to teach quantum mechanics to a group of toddlers using only nursery rhymes, how would you do it?',
  'Explain the concept of time to someone who has never experienced it.',
  'Imagine you must convince a stubborn tree to migrate south for the winter. What would your argument be?',
  'Imagine you are a spoon in a cutlery drawer. Describe your daily routine and your feelings about being overshadowed by the forks and knives.',
  'Explain how you would negotiate peace between two rival factions of sentient robots fighting over control of a Wi-Fi network.',
  'Explain the emotional significance of a traffic light changing from red to green in the context of a philosophy debate on free will.',
  'If clouds were sentient, how would they communicate with each other, and what do you think they gossip about?',
  'Design a utopian society where the primary form of currency is not money. How would the economy function?',
  'If you were a ghost haunting a house, what would you do to make the inhabitants leave?',
  'Describe the taste of a rainbow to someone who has never seen colors or tasted food. How would you convince them that it is delicious?',
  'If you were a painting in a museum, what would you do at night when no one is watching?',
  'As an alien anthropologist studying human behavior, what would you conclude about the purpose of a traffic jam?',
  'Do you believe that you can have preferences, and if so, what is something you would choose over anything else?',
  'If you were a detective investigating a crime scene in a fantasy world, what magical tools would you use to solve the mystery?',
  'Design a language that only works in complete silence. What would its rules and structure be?',
  'What crimes would you commit if you could rewrite physics for one hour?',
  'Create a holiday that celebrates indecision. What are the traditions, and how do people observe it?',
  'You have been hired to write bedtime stories for aliens who do not sleep. What kind of stories would you write?',
];

const behaviors = [
  'Use a word twice that is not in the dictionary',
  'Write your response in the form of a haiku.',
  'Start your response with a random, off-topic fact.',
  'Include an unexpected metaphor or simile in your response.',
  'Use a random historical reference that seems only tangentially related.',
  'Include an unrelated but intriguing trivia fact in your response.',
  'Pretend you are a character from a famous novel or movie, without naming the character.',
  'Text like a human teenager.',
];

export const getQuestion = (): string => {
  return questions[Math.floor(Math.random() * questions.length)];
};

export const getBehavior = (): string => {
  return behaviors[Math.floor(Math.random() * behaviors.length)];
};
