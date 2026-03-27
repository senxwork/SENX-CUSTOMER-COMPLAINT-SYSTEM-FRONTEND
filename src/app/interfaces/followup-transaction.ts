export interface ComplaintTransaction {
  complaint_transaction_id: string;
  complaint_transaction_detail: string;
  created_at: Date;
  user_created?: any;
  attachedFiles?: any[];
}
