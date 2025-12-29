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
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="text-center text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  try again
                </button>
              </div>
              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link to="/login" className="underline underline-offset-4">
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending..." : "Send reset link"}
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
    </div>
  );
}
