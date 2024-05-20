export interface LoginData {
  username?: number;
  password: string;
  phoneCode?: number;
  remember?: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  password_confirm: string;
}
