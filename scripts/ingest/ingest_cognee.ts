import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CogneeClient } from '../../packages/integrations/src/cognee/index';

async function runIngestion() {
  console.log('🚀 Starting Sahaj 2.0 Cognee Knowledge Base Ingestion...\n');

  const cognee = new CogneeClient();
  const corpusDir = path.join(process.cwd(), 'data', 'corpus');
  const files = fs.readdirSync(corpusDir).filter(f => f.endsWith('.md'));

  let totalProcessed = 0;
  const startTime = Date.now();

  for (const file of files) {
    const filePath = path.join(corpusDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 12);

    let targetDataset = 'sahaj_products_v1';
    if (file.includes('insurance')) {
      targetDataset = 'sahaj_insurance_v1';
    } else if (file.includes('glossary')) {
      targetDataset = 'sahaj_glossary_v1';
    } else if (file.includes('faq')) {
      targetDataset = 'sahaj_faq_v1';
    }

    console.log(`📄 Ingesting [${file}] -> Dataset: ${targetDataset} (Hash: ${hash})`);
    
    const addResult = await cognee.add(content, {
      dataset: targetDataset,
      docId: file.replace('.md', ''),
    });

    console.log(`   └─ Added with dataId: ${addResult.dataId}`);
    
    const cognifyResult = await cognee.cognify(targetDataset);
    console.log(`   └─ Cognify Status: ${cognifyResult.status}\n`);

    totalProcessed++;
  }

  const durationMs = Date.now() - startTime;
  console.log(`✅ Ingestion Complete! ${totalProcessed} corpus files ingested into Cognee in ${durationMs}ms.`);
}

runIngestion().catch(err => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
});
