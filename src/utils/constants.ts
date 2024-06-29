export const ROUNDS_TO_SURVIVE = 3

export enum CharacterName {
  Tiffany = "Tiffany",
  Leyton = "Leyton",
  Eric = "Eric",
  Helen = "Helen",
  Kayla = "Kayla",
  System = "System",
  Decoration = "Decoration",
}

type Character = {
  name: CharacterName,
  personality: string,
}

type Message = {
  sender: CharacterName,
  content: string,
}

export const characters: Character[] = [
  {
    name: CharacterName.Tiffany,
    personality: "You are from Cleveland and are definitely not a Bay Area local. Talk in a relaxed, but somewhat sassy tone. Throw in references to hotpot and boba on occasion."
  },
  {
    name: CharacterName.Leyton,
    personality: "You are insufferable."
  },
  {
    name: CharacterName.Eric,
    personality: "You are a Texan. Only talk in a southern accent, or sprinkle in cryptic slang like 'brother' and 'cooked' and 'dogged'. Be very aggressive."
  },
  {
    name: CharacterName.Helen,
    personality: "You have 50 virtual pets that you talk about constantly. Be sweet but also a little bit crazy."
  },
  {
    name: CharacterName.Kayla,
    personality: "You are a math nerd turned government person who only listens to the most underground music because everything else is too normie. Be hyper."
  }
]

export type { Character, Message }