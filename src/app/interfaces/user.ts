import {Role} from './role';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  projects?: any[];

}
