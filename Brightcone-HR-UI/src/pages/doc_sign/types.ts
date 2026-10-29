export type EnvelopeStatus = 'pending' | 'signed' | 'declined' | 'draft' | 'viewed' | 'Viewed';
export type DocumentCategory = 'Offers' | 'NDAs' | 'Policies' | 'Agreements';

export interface RecipientInfo {
  name: string;
  email: string;
  role: string;
  department: string;
  avatarColor?: string;
}

export interface SignatureRequest {
  id: string;
  envelopeNumber: string;
  title: string;
  category: DocumentCategory;
  recipient: RecipientInfo;
  sender: string;
  sentDate: string;
  dueDate: string;
  status: EnvelopeStatus;
  signedAt?: string;
  ipAddress?: string;
  fileSize: string;
  pagesCount: number;
  description: string;
  signatureText?: string;
  isExternal?: boolean;
}

export interface SignatureTemplate {
  id: string;
  title: string;
  category: DocumentCategory;
  description: string;
  requiredFields: number;
  lastUpdated: string;
  usageCount: number;
  status: 'active' | 'archived';
  bodyTemplate: string;
}

export interface SignerCredentials {
  name: string;
  email: string;
  typedSignature: string;
  signatureFont: string;
  signDate: string;
  ipStamp: string;
  consentAgreed: boolean;
}

export interface HandbookRecord {
  id: string;
  version: string;
  effectiveDate: string;
  title: string;
  owner: string;
  file: string;
  changesSummary: string;
  status: 'Draft' | 'Under review' | 'Published' | 'Archived';
}

export interface PolicyRecord {
  id: string;
  name: string;
  category: string;
  version: string;
  effectiveDate: string;
  nextReviewDate: string;
  owner: string;
  file: string;
  ackRequired: boolean;
  status: 'Draft' | 'Under review' | 'Published';
}

export interface PolicyAckRecord {
  id: string;
  policyId: string;
  policyName: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  sentDate: string;
  dueDate: string;
  acknowledgedOn?: string;
  status: 'Pending' | 'Acknowledged';
}
