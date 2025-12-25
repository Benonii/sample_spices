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
import { type ResetPasswordInput, resetPasswordSchema } from "@backend/utils/schemas";
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from "sonner";
import useStore from "@/lib/store";
import { Link } from '@tanstack/react-router';
import { authClient } from "@/lib/authClient";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export function RequestPasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema)
  });
  const { resetPasswordPending, setResetPasswordPending, forgotPasswordEmailSent, setForgotPasswordEmailSent } = useStore();

  const onSubmit: SubmitHandler<ResetPasswordInput> = async (data) => {
    try {
      setResetPasswordPending(true);
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
      
      setForgotPasswordEmailSent(true);
      toast.success("Password reset email sent!");
    } finally {
      setResetPasswordPending(false);
    }
  };

  if (forgotPasswordEmailSent) {
    return (
      <div className={cn("flex flex-col gap-6 container-custom", className)} {...props}>
        <Card className="w-full max-w-lg mx-auto card-shadow">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-ethiopian-green/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-ethiopian-green" />
            </div>
            <CardTitle className="heading-3 text-ethiopian-green">Check your email</CardTitle>
            <CardDescription className="body-text-sm">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center body-text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <Button
                variant="link"
                onClick={() => setForgotPasswordEmailSent(false)}
                className="underline underline-offset-4 font-medium transition-colors hover:cursor-pointer"
              >
                try again
              </Button>
            </div>
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
            <Mail className="w-8 h-8" />
          </div>
          <CardTitle className="heading-3">Reset your password</CardTitle>
          <CardDescription className="body-text-sm">
            Enter your email address and we'll send you a secure link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id={"email"}
                type="email"
                placeholder="Enter your email address"
                className="h-12 text-base border-2 border-input focus:border-ethiopian-green focus:ring-2 focus:ring-ethiopian-green/20 transition-all duration-200"
                {...register("email")}
                required
              />
              {errors.email && (
                <p className="text-sm text-ethiopian-red flex items-center gap-1">
                  <span className="w-1 h-1 bg-ethiopian-red rounded-full"></span>
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resetPasswordPending}
            >
              {resetPasswordPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending reset link...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send reset link
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
    </div>
  );
}