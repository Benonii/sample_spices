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
import { SignupFormData, signupSchema } from "@/lib/types";
import { SubmitHandler, useForm } from 'react-hook-form';
import { authClient } from "@/lib/authClient";
import { toast } from "sonner";
import { useState } from "react";
import { Link, useNavigate } from '@tanstack/react-router';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });
  const [isPending, setIsPending] = useState(false)
  const navigate = useNavigate()

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    try {
      setIsPending(true)
      const { email, password, name } = data;
      await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/"
      }, {
        onSuccess: () => {
          toast.success("Account created! Please verify your email before signing in.")
          navigate({ to: '/email-verification' })
        },
        onError: (error) => {
          console.error("=====++ERROR SIGNING UP========\n", error);
          toast.error("Error signing up!")
        }
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto glass-card dark:glass-card-dark border-orange-200/50 dark:border-orange-500/20 shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Create your account</CardTitle>
          <CardDescription className="text-base">
            Join us to discover authentic Ethiopian spices and traditional blends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-foreground/80">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  {...register("name")}
                  className="border-orange-200/50 dark:border-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 transition-all duration-300"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>
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
              <div className="grid gap-3">
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="border-orange-200/50 dark:border-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 transition-all duration-300"
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="border-orange-200/50 dark:border-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 transition-all duration-300"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {isPending ? "Creating account..." : "Sign up"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 font-medium transition-colors">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking sign up, you agree to our <a href="#" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 transition-colors">Terms of Service</a>{" "}
        and <a href="#" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 transition-colors">Privacy Policy</a>.
      </div>
    </div>
  )
}
