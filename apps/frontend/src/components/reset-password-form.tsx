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
import { NewPasswordFormData, newPasswordSchema } from "@/lib/types";
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from "sonner";
import { useState } from "react";
import { Link, useSearch } from '@tanstack/react-router';
import { authClient } from "@/lib/authClient";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { token } = useSearch({ from: '/reset-password' });

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema)
  });
  const [isPending, setIsPending] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  // Watch password fields for real-time validation
  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const onSubmit: SubmitHandler<NewPasswordFormData> = async (data) => {
    try {
      setIsPending(true);
      const { newPassword, confirmPassword } = data;

      // Validate passwords match
      if (newPassword !== confirmPassword) {
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

      setIsPasswordReset(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      console.error("=====++ERROR RESETTING PASSWORD========\n", error);
      toast.error("Error resetting password!");
    } finally {
      setIsPending(false);
    }
  };

  // Show error if no token is provided
  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="w-full max-w-md mx-auto glass-card dark:glass-card-dark border-orange-200/50 dark:border-orange-500/20 shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Invalid Reset Link</CardTitle>
            <CardDescription className="text-base">
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Link to="/login">
                  Back to login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="w-full max-w-md mx-auto glass-card dark:glass-card-dark border-orange-200/50 dark:border-orange-500/20 shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Password reset successful</CardTitle>
            <CardDescription className="text-base">
              Your password has been successfully updated. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Link to="/login">
                  Continue to login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto glass-card dark:glass-card-dark border-orange-200/50 dark:border-orange-500/20 shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Set new password</CardTitle>
          <CardDescription className="text-base">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="newPassword" className="text-foreground/80">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  {...register("newPassword")}
                  className="border-orange-200/50 dark:border-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 transition-all duration-300"
                  required
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  className="border-orange-200/50 dark:border-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 transition-all duration-300"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
                {confirmPassword && newPassword && confirmPassword !== newPassword && (
                  <p className="text-sm text-red-500 dark:text-red-400">Passwords do not match</p>
                )}
                {confirmPassword && newPassword && confirmPassword === newPassword && (
                  <p className="text-sm text-orange-600 dark:text-orange-400">Passwords match</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Update password"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 font-medium transition-colors">
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our <a href="#" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 transition-colors">Terms of Service</a>{" "}
        and <a href="#" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 transition-colors">Privacy Policy</a>.
      </div>
    </div>
  );
}
