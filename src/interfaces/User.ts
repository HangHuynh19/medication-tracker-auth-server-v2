import {Document} from 'mongoose';

enum Role {
  PATIENT = 'patient',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  ADMIN = 'admin',
}

interface User extends Document {
  username: string;
  email: string;
  role: Role;
  password: string;
  avatar: string;
  token: string;
}

interface UserIdFromToken {
  id: string;
  token: string;
  role: Role;
}

interface UserOutput {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role?: Role;
  token?: string;
}

export {Role, User, UserIdFromToken, UserOutput};
