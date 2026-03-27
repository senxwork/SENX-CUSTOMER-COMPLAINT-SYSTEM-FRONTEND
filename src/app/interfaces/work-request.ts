export interface WorkRequest {
  complaint_id: string;
  job_detail: string;
  subject?: string;
  customer_name?: string;
  house_name?: string;
  telephone?: string;
  email?: string;
  status: 'open' | 'inprogress' | 'completed';
  date_job_completed?: Date;
  created_at: Date;
  updated_at: Date;
  user_created?: any;
  responsible_persons?: any[];
  jobDepartment?: any;
  complaintJobCatagory?: any;
  project?: any;
  businessUnit?: any;
  contactChannel?: any;
  omPersons?: any;
  complaintTransaction?: any[];
  complaintAttachedFile?: any[];
  parent?: WorkRequest;
  children?: WorkRequest[];
}

export interface WorkRequestCreate {
  job_detail: string;
  job_catagory_id?: string;
  user_created?: string;
  project_id?: string;
  subject?: string;
  job_departments_id?: string;
  contact_channel_id?: string;
  business_unit_id?: string;
  customer_name?: string;
  house_name?: string;
  telephone?: string;
  email?: string;
  parent_id?: string;
}
