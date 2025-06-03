// Secure storage utility for sensitive data like tokens
class SecureStorage {
  private static readonly TOKEN_KEY = 'nextbuy_token';
  private static readonly USER_KEY = 'nextbuy_user';
  
  // Check if we're in browser environment
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
  
  // Set token with expiration
  static setToken(token: string, expirationHours: number = 24): void {
    if (!this.isBrowser()) return;
    
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + expirationHours);
    
    const tokenData = {
      token,
      expiration: expiration.getTime(),
    };
    
    try {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }
  
  // Get token with expiration check
  static getToken(): string | null {
    if (!this.isBrowser()) return null;
    
    try {
      const tokenDataStr = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenDataStr) return null;
      
      const tokenData = JSON.parse(tokenDataStr);
      
      // Check if token is expired
      if (Date.now() > tokenData.expiration) {
        this.removeToken();
        return null;
      }
      
      return tokenData.token;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      this.removeToken(); // Clear corrupted data
      return null;
    }
  }
  
  // Remove token
  static removeToken(): void {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }
  
  // Set user data
  static setUser(user: any): void {
    if (!this.isBrowser()) return;
    
    try {
      // Don't store sensitive user data
      const safeUserData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(safeUserData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }
  
  // Get user data
  static getUser(): any | null {
    if (!this.isBrowser()) return null;
    
    try {
      const userDataStr = localStorage.getItem(this.USER_KEY);
      if (!userDataStr) return null;
      
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      this.removeUser(); // Clear corrupted data
      return null;
    }
  }
  
  // Remove user data
  static removeUser(): void {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Failed to remove user data:', error);
    }
  }
  
  // Clear all auth data
  static clearAuth(): void {
    this.removeToken();
    this.removeUser();
  }
  
  // Check if user is authenticated (token exists and not expired)
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export default SecureStorage; 