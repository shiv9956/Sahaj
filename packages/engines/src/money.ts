import Decimal from 'decimal.js';

export class Money {
  readonly paise: number;

  constructor(paise: number) {
    if (!Number.isInteger(paise)) {
      throw new Error(`Money paise must be an integer, got: ${paise}`);
    }
    this.paise = paise;
  }

  static fromRupees(rupees: number): Money {
    const paise = Math.round(rupees * 100);
    return new Money(paise);
  }

  static fromPaise(paise: number): Money {
    return new Money(paise);
  }

  toRupees(): number {
    return this.paise / 100;
  }

  formatINR(): string {
    const rupees = Math.floor(this.paise / 100);
    const rupeesStr = rupees.toString();
    
    if (rupeesStr.length <= 3) {
      return `₹${rupeesStr}`;
    }
    
    const lastThree = rupeesStr.substring(rupeesStr.length - 3);
    const otherNumbers = rupeesStr.substring(0, rupeesStr.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    
    return `₹${formattedOther},${lastThree}`;
  }

  verbalize(lang: 'hi' | 'en' | 'hinglish' = 'hinglish'): string {
    const rupees = this.toRupees();
    if (rupees >= 10000000) {
      const cr = (rupees / 10000000).toFixed(2).replace(/\.00$/, '');
      return lang === 'hi' ? `${cr} करोड़ रुपये` : `${cr} Crore Rupees`;
    }
    if (rupees >= 100000) {
      const lakh = (rupees / 100000).toFixed(2).replace(/\.?0+$/, '');
      if (lakh === '1.5') return lang === 'hi' ? 'डेढ़ लाख रुपये' : 'dedh lakh rupees';
      if (lakh === '2.5') return lang === 'hi' ? 'ढाई लाख रुपये' : 'dhai lakh rupees';
      return lang === 'hi' ? `${lakh} लाख रुपये` : `${lakh} lakh rupees`;
    }
    if (rupees >= 1000) {
      const k = (rupees / 1000).toFixed(2).replace(/\.00$/, '');
      return lang === 'hi' ? `${k} हजार रुपये` : `${k} thousand rupees`;
    }
    return `₹${rupees}`;
  }
}
