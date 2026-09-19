import { JourneyState } from '@sahaj/shared';

export interface JourneyContext {
  journeyId: string;
  userId: string;
  domain: 'lending' | 'insurance' | 'bridge';
  amountPaise?: number;
  incomePaise?: number;
  missingFields: string[];
  shortlistedProductIds: string[];
  documentsConfirmed: string[];
}

export type JourneyEvent =
  | { type: 'SUBMIT_INTENT'; domain: 'lending' | 'insurance' | 'bridge'; amountPaise?: number }
  | { type: 'UPDATE_PROFILE'; field: string; value: any }
  | { type: 'COMPLETE_PROFILE' }
  | { type: 'RETRIEVE_KNOWLEDGE' }
  | { type: 'COMPARE_OPTIONS' }
  | { type: 'SHORTLIST_PRODUCT'; productId: string }
  | { type: 'CONFIRM_DOCUMENT'; docType: string }
  | { type: 'GENERATE_GUIDANCE' };

export function transitionJourneyState(
  currentState: JourneyState,
  event: JourneyEvent,
  context: JourneyContext
): { nextState: JourneyState; updatedContext: JourneyContext } {
  const updatedContext = { ...context };

  switch (currentState) {
    case 'NEW':
      if (event.type === 'SUBMIT_INTENT') {
        updatedContext.domain = event.domain;
        if (event.amountPaise) updatedContext.amountPaise = event.amountPaise;
        return { nextState: 'INTENT_CAPTURED', updatedContext };
      }
      break;

    case 'INTENT_CAPTURED':
    case 'PROFILE_INCOMPLETE':
      if (event.type === 'UPDATE_PROFILE') {
        if (event.field === 'income') updatedContext.incomePaise = event.value;
        if (event.field === 'amount') updatedContext.amountPaise = event.value;
        updatedContext.missingFields = updatedContext.missingFields.filter(f => f !== event.field);
      }
      if (updatedContext.amountPaise && updatedContext.incomePaise) {
        return { nextState: 'PROFILE_READY', updatedContext };
      }
      return { nextState: 'PROFILE_INCOMPLETE', updatedContext };

    case 'PROFILE_READY':
      if (event.type === 'RETRIEVE_KNOWLEDGE') {
        return { nextState: 'KNOWLEDGE_RETRIEVED', updatedContext };
      }
      break;

    case 'KNOWLEDGE_RETRIEVED':
      if (event.type === 'COMPARE_OPTIONS') {
        return { nextState: 'OPTIONS_READY', updatedContext };
      }
      break;

    case 'OPTIONS_READY':
      if (event.type === 'SHORTLIST_PRODUCT') {
        if (!updatedContext.shortlistedProductIds.includes(event.productId)) {
          updatedContext.shortlistedProductIds.push(event.productId);
        }
        return { nextState: 'DOCUMENTS_PENDING', updatedContext };
      }
      break;

    case 'DOCUMENTS_PENDING':
      if (event.type === 'CONFIRM_DOCUMENT') {
        if (!updatedContext.documentsConfirmed.includes(event.docType)) {
          updatedContext.documentsConfirmed.push(event.docType);
        }
      }
      if (updatedContext.documentsConfirmed.length >= 1) {
        return { nextState: 'APPLICATION_GUIDANCE', updatedContext };
      }
      break;

    case 'APPLICATION_GUIDANCE':
      if (event.type === 'GENERATE_GUIDANCE') {
        return { nextState: 'FOLLOW_UP', updatedContext };
      }
      break;
  }

  return { nextState: currentState, updatedContext };
}
