export interface AuthUser {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface CreateAuthUserInput {
  email: string;
  passwordHash: string;
}
