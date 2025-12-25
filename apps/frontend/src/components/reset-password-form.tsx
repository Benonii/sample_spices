// biome-ignore assist/source/organizeImports: can't make Biome happy
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type NewPasswordInput, newPasswordSchema } from "@backend/utils/schemas";
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from "sonner";
import useStore from "@/lib/store";
import { Link, useSearch } from '@tanstack/react-router';
import { authClient } from "@/lib/authClient";
import { Lock, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const search = useSearch({ strict: false });
  // biome-ignore lint/suspicious/noExplicitAny: token is a string
  const token = (search as any)?.token;
  
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema)
  });
  const {
    resetPasswordPending, setResetPasswordPending,
    passwordReset, setPasswordReset, showPassword,
    setShowPassword, showConfirmPassword, setShowConfirmPassword
  } = useStore();
  
  // Watch password fields for real-time validation
  const newPassword = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit: SubmitHandler<NewPasswordInput> = async (data) => {
    try {
      setResetPasswordPending(true);
      const { password, confirmPassword } = data;
      
      // Validate passwords match
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      
      // Check if token exists
      if (!token) {
        toast.error("Invalid or missing reset token!");
        return;
      }
      
      const { error } = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (error) {
        toast.error(error?.message || "Error occured resetting password!")
        return
      }
      
      setPasswordReset(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      console.error("=====++ERROR RESETTING PASSWORD========\n", error);
      toast.error("Error resetting password!");
    } finally {
      setResetPasswordPending(false);
    }
  };

  // Show error if no token is provided
  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6 container-custom", className)} {...props}>
        <Card className="w-full max-w-lg mx-auto card-shadow">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-ethiopian-red/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-ethiopian-red" />
            </div>
            <CardTitle className="heading-3 text-ethiopian-red">Invalid Reset Link</CardTitle>
            <CardDescription className="body-text-sm">
              This password reset link is invalid or has expired. Please request a new one to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button asChild className="w-full h-12 text-base font-semibold btn-primary rounded-lg">
              <Link to="/login" className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </Button>
            <div className="text-center body-text-sm">
              Need a new reset link?{" "}
              <Link 
                to="/forgot-password" 
                className="text-ethiopian-green hover:text-ethiopian-green/80 underline underline-offset-4 font-medium transition-colors"
              >
                Request password reset
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (passwordReset) {
    return (
      <div className={cn("flex flex-col gap-6 container-custom", className)} {...props}>
        <Card className="w-full max-w-lg mx-auto card-shadow">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gray-200">
              <CheckCircle className="w-8 h-8" />
            </div>
            <CardTitle className="heading-3">Password Reset Successful</CardTitle>
            <CardDescription className="body-text-sm">
              Your password has been successfully updated. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button asChild variant="outline" className="w-full h-12 font-semibold  text-gray-800 hover:bg-gray-700 hover:text-white rounded-lg">
              <Link to="/login" className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continue to login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 container-custom", className)} {...props}>
      <Card className="w-full max-w-lg mx-auto card-shadow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gray-200">
            <Lock className="w-8 h-8" />
          </div>
          <CardTitle className="heading-3">Set New Password</CardTitle>
          <CardDescription className="body-text-sm">
            Create a strong password to secure your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id={"newPassword"}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="h-12 text-base border-2 border-input focus:border-ethiopian-green focus:ring-2 focus:ring-ethiopian-green/20 transition-all duration-200 pr-12"
                  {...register("password")}
                  required
                />
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id={"confirmPassword"}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="h-12 text-base border-2 border-input focus:border-ethiopian-green focus:ring-2 focus:ring-ethiopian-green/20 transition-all duration-200 pr-12"
                  {...register("confirmPassword")}
                  required
                />
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-ethiopian-red flex items-center gap-1">
                  <span className="w-1 h-1 bg-ethiopian-red rounded-full"></span>
                  {errors.confirmPassword.message}
                </p>
              )}
              {confirmPassword && newPassword && confirmPassword !== newPassword && (
                <p className="text-sm text-ethiopian-red flex items-center gap-1">
                  <span className="w-1 h-1 bg-ethiopian-red rounded-full"></span>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword && confirmPassword === newPassword && (
                <p className="text-sm text-ethiopian-green flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gray-800 text-white hover:bg-gray-700 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              disabled={resetPasswordPending}
            >
              {resetPasswordPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating password...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Update password
                </div>
              )}
            </Button>
            
            <div className="text-center body-text-sm">
              Remember your password?{" "}
              <Link 
                to="/login" 
                className="underline underline-offset-4 font-medium transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-muted-foreground text-center text-xs text-balance max-w-lg mx-auto">
        By updating your password, you agree to our{" "}
        <Link to="/" className="text-ethiopian-green hover:text-ethiopian-green/80 underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/" className="text-ethiopian-green hover:text-ethiopian-green/80 underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}