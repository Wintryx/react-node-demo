import axios, { AxiosInstance } from 'axios';

import { AuthResponse, RegisterRequest } from './api-types';
import { buildAuthPayload, buildUniqueSuffix } from './fixtures';

export interface AuthContext {
  accessToken: string;
  credentials: RegisterRequest;
  client: AxiosInstance;
}

export const createAuthenticatedClient = (accessToken: string): AxiosInstance =>
  axios.create({
    baseURL: axios.defaults.baseURL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const registerUser = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

export const createAuthContext = async (): Promise<AuthContext> => {
  const credentials = buildAuthPayload(buildUniqueSuffix());
  const authResponse = await registerUser(credentials);
  return {
    accessToken: authResponse.accessToken,
    credentials,
    client: createAuthenticatedClient(authResponse.accessToken),
  };
};
