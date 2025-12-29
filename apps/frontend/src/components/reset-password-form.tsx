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
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Button asChild className="w-full">
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
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Password reset successful</CardTitle>
            <CardDescription>
              Your password has been successfully updated. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Button asChild className="w-full">
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set new password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  {...register("newPassword")}
                  required
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
                {confirmPassword && newPassword && confirmPassword !== newPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
                {confirmPassword && newPassword && confirmPassword === newPassword && (
                  <p className="text-sm text-green-500">Passwords match</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Updating..." : "Update password"}
              </Button>
              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
