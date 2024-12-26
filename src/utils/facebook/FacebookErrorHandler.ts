export class FacebookErrorHandler {
  static isRateLimitError(error: any): boolean {
    return error.code === 4 || error.code === 17 || error.code === 32;
  }

  static isAuthError(error: any): boolean {
    return error.code === 190 || error.code === 102;
  }

  static async handleError(error: any): Promise<void> {
    if (FacebookErrorHandler.isRateLimitError(error)) {
      const retryAfter = error.headers?.['retry-after'] || 60;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    } else if (FacebookErrorHandler.isAuthError(error)) {
      throw new Error('Authentication error. Please reconnect your Facebook account.');
    } else {
      throw error;
    }
  }
}