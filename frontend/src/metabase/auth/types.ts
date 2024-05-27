export interface LoginData {
  username?: string;
  password?: string;
  phoneCode?: number;
  remember?: boolean;
  code?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  password_confirm: string;
}
