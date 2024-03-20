import { Contribution } from "@vendible/vencrypt";

export interface Session {
  addr: string;
  sessionId: string;
  interviewCode: string;
  status: string;
  nonce?: string;
  token?: string;
  documentCt?: string;
  documentHash?: string;
  existingUser?: boolean;
  coupon?: string;
  attempts?: number;
  reason?: string;
  onboardingStatus?: string;
  canAttempt?: boolean;
  // document: Document;
}

export interface CreateSessionResponse {
  createSession: Session;
}

export interface RootObjectSession {
  session: Session;
}

export interface ProvisionResponse {
  hash1: string;
  hash2: string;
  contributions: Contribution[];
  totalDataSignature: string;
}

export interface VerificationError {
  fieldName: string;
  returnedData: string;
  actualData: string;
}

export interface Field {
  label: string;
  value: string;
}
