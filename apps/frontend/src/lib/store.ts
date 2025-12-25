import { create } from 'zustand'

type Store = { 
    isDarkMode: boolean
    toggleDarkMode: () => void
    loginPending: boolean
    setLoginPending: (pending: boolean) => void
    socialSignInPending: boolean
    setSocialSignInPending: (pending: boolean) => void
    signupPending: boolean
    setSignupPending: (pending: boolean) => void
    forgotPasswordPending: boolean
    setForgotPasswordPending: (pending: boolean) => void
    forgotPasswordEmailSent: boolean
    setForgotPasswordEmailSent: (sent: boolean) => void
    resetPasswordPending: boolean
    setResetPasswordPending: (pending: boolean) => void
    passwordReset: boolean
    setPasswordReset: (reset: boolean) => void
    showPassword: boolean
    setShowPassword: (show: boolean) => void
    showConfirmPassword: boolean
    setShowConfirmPassword: (show: boolean) => void
}

const useStore = create<Store>()((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  loginPending: false,
  setLoginPending: (pending: boolean) => set({ loginPending: pending }),
  socialSignInPending: false,
  setSocialSignInPending: (pending: boolean) => set({ socialSignInPending: pending }),
  signupPending: false,
  setSignupPending: (pending: boolean) => set({ signupPending: pending }),
  forgotPasswordPending: false,
  setForgotPasswordPending: (pending: boolean) => set({ forgotPasswordPending: pending }),
  forgotPasswordEmailSent: false,
  setForgotPasswordEmailSent: (sent: boolean) => set({ forgotPasswordEmailSent: sent }),
  resetPasswordPending: false,
  setResetPasswordPending: (pending: boolean) => set({ resetPasswordPending: pending }),
  passwordReset: false,
  setPasswordReset: (reset: boolean) => set({ passwordReset: reset }),
  showPassword: false,
  setShowPassword: (show: boolean) => set({ showPassword: show }),
  showConfirmPassword: false,
  setShowConfirmPassword: (show: boolean) => set({ showConfirmPassword: show }),
}))

export default useStore;