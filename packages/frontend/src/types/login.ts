export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    type: string;
    tenantId: string;
  };
}
