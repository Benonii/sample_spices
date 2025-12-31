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
import { ResetPasswordFormData, resetPasswordSchema } from "@/lib/types";
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from "sonner";
import { useState } from "react";
import { Link } from '@tanstack/react-router';
import { authClient } from "@/lib/authClient";

export function RequestPasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });
  const [isPending, setIsPending] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    try {
      setIsPending(true);
      const { email } = data;
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/"
      });

      if (error) {
        console.error("=======++ERROR++=========\n", error)
        toast.error(error?.message || "Failed to send password reset email!")
        return
      }

      setIsEmailSent(true);
      toast.success("Password reset email sent!");
    } finally {
      setIsPending(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="w-full max-w-md mx-auto glass-card dark:glass-card-dark border-orange-200/50 dark:border-orange-500/20 shadow-2xl">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Check your email</CardTitle>
            <CardDescription className="text-base">
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="text-center text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 font-medium transition-colors"
                >
                  try again
                </button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 font-medium transition-colors">
                  Back to login
                </Link>
              </div>
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
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Reset your password</CardTitle>
          <CardDescription className="text-base">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  className="border-orange-200/50 dark:border-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 transition-all duration-300"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Send reset link"}
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
    </div>
  );
}
