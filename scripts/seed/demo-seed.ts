import { MemoryLedgerManager, MockPaytmAdapter } from '../../packages/integrations/src/index';

export interface DemoPersona {
  id: string;
  name: string;
  age: number;
  language: 'hinglish' | 'hi' | 'en';
  role: 'student' | 'co_applicant' | 'salaried';
  goal: string;
  amountPaise: number;
  incomePaise: number;
  rememberedStatements: string[];
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'usr_priya_demo',
    name: 'Priya Sharma',
    age: 18,
    language: 'hinglish',
    role: 'student',
    goal: 'Education loan of ₹2,00,000 for B.Tech CSE at IIT Delhi',
    amountPaise: 20000000,
    incomePaise: 4500000, // Co-applicant income ₹45,000/mo
    rememberedStatements: [
      'Goal: ₹2,00,000 education loan for B.Tech IIT Delhi',
      'Priority: Low monthly EMI over lowest total cost',
      'Co-applicant monthly income band: ₹40,000 - ₹50,000'
    ]
  },
  {
    id: 'usr_ramesh_demo',
    name: 'Ramesh Sharma',
    age: 46,
    language: 'hi',
    role: 'co_applicant',
    goal: 'Co-applicant for Priya education loan & small shop business personal loan',
    amountPaise: 30000000,
    incomePaise: 4500000,
    rememberedStatements: [
      'Role: Primary co-applicant (Parent)',
      'Preferred Language: Hindi Voice (Devanagari)',
      'Existing Monthly Obligations: ₹8,000'
    ]
  },
  {
    id: 'usr_neha_demo',
    name: 'Neha Verma',
    age: 27,
    language: 'en',
    role: 'salaried',
    goal: 'Term life cover & loan protection bridge illustration',
    amountPaise: 50000000,
    incomePaise: 8500000,
    rememberedStatements: [
      'Goal: ₹50 Lakhs Term Life Protection Cover',
      'Dependents: 2 (Parents)',
      'Free-Look Window: 30 days opt-in'
    ]
  }
];

export async function seedDemoEnvironment() {
  console.log('🌱 Seeding Sahaj Demo Environment with 3 Personas...');
  const memoryManager = new MemoryLedgerManager();
  const paytmAdapter = new MockPaytmAdapter();

  for (const persona of DEMO_PERSONAS) {
    console.log(`  └ Loading Persona [${persona.name}] (${persona.language})...`);
    await memoryManager.forgetAll(persona.id);
    for (const stmt of persona.rememberedStatements) {
      await memoryManager.recordMemoryStatement(persona.id, stmt, 'goal');
    }
  }

  const products = await paytmAdapter.listProducts();
  console.log(`  └ Cached ${products.length} synthetic Paytm catalog products.`);
  console.log('✅ Demo Environment Successfully Seeded!');
}

if (require.main === module || process.argv.includes('--run')) {
  seedDemoEnvironment().catch(console.error);
}
