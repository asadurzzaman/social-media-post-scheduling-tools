export class FacebookErrorHandler {
  static isRateLimitError(error: any): boolean {
    return error.code === 4 || error.code === 17 || error.code === 32;
  }

  static isAuthError(error: any): boolean {
    return error.code === 190 || error.code === 102 || error.error_subcode === 463;
  }

  static isTokenExpiredError(error: any): boolean {
    // Check both the error object and any nested error objects
    const errorObj = error.error || error;
    return (
      (errorObj.code === 190 && errorObj.error_subcode === 463) ||
      (errorObj.error && errorObj.error.code === 190 && errorObj.error.error_subcode === 463) ||
      error.code === 'TOKEN_EXPIRED'
    );
  }

  static async handleError(error: any): Promise<void> {
    console.log('Handling Facebook error:', error);
    
    if (FacebookErrorHandler.isTokenExpiredError(error)) {
      throw new Error('Your Facebook session has expired. Please reconnect your Facebook account to continue posting.');
    } else if (FacebookErrorHandler.isRateLimitError(error)) {
      const retryAfter = error.headers?.['retry-after'] || 60;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    } else if (FacebookErrorHandler.isAuthError(error)) {
      throw new Error('Authentication error. Please reconnect your Facebook account.');
    } else {
      console.error('Unhandled Facebook error:', error);
      throw new Error('An error occurred while connecting to Facebook. Please try again.');
    }
  }
}