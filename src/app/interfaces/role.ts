import {Permission} from './permission';

export interface Role {
  id: number;
  name: string;
  created_at:string
  permissions?: Permission[];
}
