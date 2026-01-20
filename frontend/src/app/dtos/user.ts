export interface UserProfileDetail {
  email: string;
  firstName: string;
  lastName: string;
}

export interface EditUserDto {
  firstName: string;
  lastName: string;
  oldPassword?: string;
  newPassword?: string;
}

export interface ResetPasswordDto {
  password: string;
  confirmPassword: string;
}
