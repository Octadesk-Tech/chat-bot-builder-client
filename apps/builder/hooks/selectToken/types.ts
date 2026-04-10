export interface Secret {
  id: string
  name: string
  description?: string
  createdBy: string
  createdAt: string
  error?: SecretErrorCode
}

export type SecretErrorCode = 'UNAUTHENTICATED' | 'FORBIDDEN'
