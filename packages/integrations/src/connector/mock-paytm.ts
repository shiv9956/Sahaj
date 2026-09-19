export interface CatalogProduct {
  id: string;
  domain: 'lending' | 'insurance';
  name: string;
  providerDisplay: string;
  isSynthetic: boolean;
  minRatePct: number;
  maxRatePct: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  processingFeePaise: number;
  moratoriumSupported: boolean;
  collateralRequired: boolean;
  coapplicantRequired: boolean;
}

export interface ConnectorSeamMetadata {
  connectorName: string;
  operationalMode: 'MOCK_SANDBOX' | 'LIVE_SANDBOX' | 'PRODUCTION';
  syntheticCatalog: boolean;
  swapInPath: string;
  complianceNotice: string;
}

export interface FintechProductConnector {
  listProducts(domain?: 'lending' | 'insurance'): Promise<CatalogProduct[]>;
  getProduct(id: string): Promise<CatalogProduct | null>;
  createLeadIntent(journeyId: string, productId: string): Promise<{ leadId: string; status: string; synthetic: boolean }>;
  checkEligibilitySeam(userId: string, productId: string): Promise<{ eligible: boolean; score: number; syntheticNotice: string }>;
  getSeamMetadata(): ConnectorSeamMetadata;
}

export class MockPaytmAdapter implements FintechProductConnector {
  private products: CatalogProduct[] = [
    {
      id: 'prod_edu_01',
      domain: 'lending',
      name: 'Paytm EduScholar Loan (Premier)',
      providerDisplay: 'Paytm Lending Partner (Synthetic)',
      isSynthetic: true,
      minRatePct: 8.5,
      maxRatePct: 10.5,
      minTenureMonths: 12,
      maxTenureMonths: 84,
      processingFeePaise: 100000, // ₹1,000
      moratoriumSupported: true,
      collateralRequired: false,
      coapplicantRequired: true,
    },
    {
      id: 'prod_edu_02',
      domain: 'lending',
      name: 'Paytm FlexiEdu Student Credit',
      providerDisplay: 'Paytm NBFC Partner (Synthetic)',
      isSynthetic: true,
      minRatePct: 11.5,
      maxRatePct: 14.0,
      minTenureMonths: 6,
      maxTenureMonths: 36,
      processingFeePaise: 50000, // ₹500
      moratoriumSupported: true,
      collateralRequired: false,
      coapplicantRequired: false,
    },
    {
      id: 'prod_ins_01',
      domain: 'insurance',
      name: 'Paytm Suraksha Term Life Protect',
      providerDisplay: 'Paytm Life Insurance Partner (Synthetic)',
      isSynthetic: true,
      minRatePct: 0,
      maxRatePct: 0,
      minTenureMonths: 12,
      maxTenureMonths: 240,
      processingFeePaise: 0,
      moratoriumSupported: false,
      collateralRequired: false,
      coapplicantRequired: false,
    }
  ];

  async listProducts(domain?: 'lending' | 'insurance'): Promise<CatalogProduct[]> {
    if (!domain) return this.products;
    return this.products.filter(p => p.domain === domain);
  }

  async getProduct(id: string): Promise<CatalogProduct | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async createLeadIntent(journeyId: string, productId: string): Promise<{ leadId: string; status: string; synthetic: boolean }> {
    return {
      leadId: `mock_lead_${Math.random().toString(36).substring(2, 9)}`,
      status: 'DEMO_INTENT_CREATED',
      synthetic: true
    };
  }

  async checkEligibilitySeam(userId: string, productId: string): Promise<{ eligible: boolean; score: number; syntheticNotice: string }> {
    return {
      eligible: true,
      score: 85,
      syntheticNotice: 'Evaluated against synthetic partner risk criteria (Decision 003)'
    };
  }

  getSeamMetadata(): ConnectorSeamMetadata {
    return {
      connectorName: 'Paytm Ecosystem Connector',
      operationalMode: 'MOCK_SANDBOX',
      syntheticCatalog: true,
      swapInPath: 'Swap MockPaytmAdapter with LivePaytmSandboxAdapter in packages/integrations/src/connector/paytm-live.ts',
      complianceNotice: 'Every product carries a visible "Demo catalog — synthetic data" label until live sandbox keys are provided.'
    };
  }
}
