// Custom error types for better error handling
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleFirebaseError(error: any): never {
  console.error('Firebase error:', error);

  if (error?.code) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new AuthError('This email is already registered');
      case 'auth/invalid-email':
        throw new AuthError('Invalid email address');
      case 'auth/operation-not-allowed':
        throw new AuthError('This operation is not allowed');
      case 'auth/weak-password':
        throw new AuthError('Password is too weak');
      case 'auth/user-disabled':
        throw new AuthError('This account has been disabled');
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new AuthError('Invalid email or password');
      default:
        throw new AuthError('An authentication error occurred');
    }
  }

  throw new AppError('An unexpected error occurred');
}