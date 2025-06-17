export class VoiceNames {
  private constructor() {}

  static get male(): string[] {
    return [
      'Liam',
      'Noah',
      'Oliver',
      'William',
      'Elijah',
      'James',
      'Benjamin',
      'Lucas',
      'Henry',
      'Alexander',
      'Mason',
      'Michael',
      'Ethan',
      'Daniel',
      'Jacob',
      'Logan',
      'Jackson',
      'Levi',
      'Sebastian',
      'Mateo',
      'Jack',
      'Owen',
      'Theodore',
      'Aiden',
      'Samuel',
      'Joseph',
      'John',
      'David',
      'Wyatt',
      'Matthew',
      'Luke',
      'Asher',
      'Carter',
      'Julian',
      'Grayson',
      'Leo',
      'Jayden',
      'Gabriel',
      'Isaac',
      'Lincoln',
      'Anthony',
      'Hudson',
      'Dylan',
      'Ezra',
      'Thomas',
      'Charles',
      'Christopher',
      'Jaxon',
      'Maverick',
      'Josiah',
    ];
  }

  static get female(): string[] {
    return [
      'Olivia',
      'Emma',
      'Ava',
      'Charlotte',
      'Sophia',
      'Amelia',
      'Isabella',
      'Mia',
      'Evelyn',
      'Harper',
      'Camila',
      'Gianna',
      'Abigail',
      'Luna',
      'Ella',
      'Elizabeth',
      'Sofia',
      'Emily',
      'Avery',
      'Mila',
      'Scarlett',
      'Eleanor',
      'Madison',
      'Layla',
      'Penelope',
      'Aria',
      'Chloe',
      'Grace',
      'Ellie',
      'Nora',
      'Hazel',
      'Zoey',
      'Riley',
      'Victoria',
      'Lily',
      'Aurora',
      'Violet',
      'Nova',
      'Hannah',
      'Emilia',
      'Zoe',
      'Stella',
      'Everly',
      'Isla',
      'Leah',
      'Lillian',
      'Addison',
      'Willow',
      'Lucy',
      'Paisley',
    ];
  }

  static get neutral(): string[] {
    return [
      'Alex',
      'Jordan',
      'Taylor',
      'Casey',
      'Riley',
      'Avery',
      'Quinn',
      'Cameron',
      'Sage',
      'River',
      'Rowan',
      'Blake',
      'Emery',
      'Finley',
      'Hayden',
      'Parker',
      'Reese',
      'Phoenix',
      'Skylar',
      'Morgan',
      'Drew',
      'Kai',
      'Remy',
      'Lane',
      'Marlowe',
      'Ari',
      'Bailey',
      'Charlie',
      'Frankie',
      'Gray',
      'Harley',
      'Indigo',
      'Jude',
      'Kit',
      'Lennox',
      'Memphis',
      'Nova',
      'Ocean',
      'Peyton',
      'Rain',
      'Sage',
      'Tatum',
      'Vale',
      'Winter',
      'Zion',
    ];
  }

  /**
   * Get all available name categories
   */
  static get categories(): string[] {
    return ['male', 'female', 'neutral'];
  }

  /**
   * Get names by gender/category
   */
  static getByGender(gender: string): string[] {
    const normalizedGender = gender.toLowerCase();
    switch (normalizedGender) {
      case 'male':
        return this.male;
      case 'female':
        return this.female;
      case 'neutral':
        return this.neutral;
      default:
        return this.neutral; // Default to neutral names for unknown genders
    }
  }

  /**
   * Get a random name from the specified gender category
   */
  static getRandomName(gender: string, seed?: string): string {
    const names = this.getByGender(gender);
    if (names.length === 0) return 'Voice';
    
    if (seed) {
      // Use seed for deterministic selection
      const seedSum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return names[seedSum % names.length];
    }
    
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Get combined list of all names
   */
  static get all(): string[] {
    return [...this.male, ...this.female, ...this.neutral];
  }
}
