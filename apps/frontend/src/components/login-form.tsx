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
import { LoginFormData, loginSchema } from "@/lib/types";
import { SubmitHandler, useForm } from 'react-hook-form';
import { authClient } from "@/lib/authClient";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from '@tanstack/react-router';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  const [isPending, setIsPending] = useState(false)

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    try {
      setIsPending(true)
      await authClient.signIn.social({
        provider,
        callbackURL: "http://localhost:5173",
      })
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in initiated!`)
    } catch (error) {
      console.error(`=====++ERROR SIGNING IN WITH ${provider.toUpperCase()}========\n`, error);
      toast.error(`Error signing in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`)
    } finally {
      setIsPending(false)
    }
  }

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      setIsPending(true)
      const { email, password } = data;
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "/"
      }, {
        onSuccess: () => {
          toast.success("Login successful!")
        },
        onError: (error) => {
          console.error("=====++ERROR LOGGING IN========\n", error);
          toast.error("Error logging in!")
        }
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto glass-card dark:glass-card-dark border-em erald-200/50 dark:border-orange-500/20 shadow-2xl">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to continue exploring authentic Ethiopian spices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-orange-300/50 dark:border-orange-500/30 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300 hover:scale-105"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isPending}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isPending ? "Loading..." : "Login with Google"}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-orange-200/50 dark:after:border-orange-500/20">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
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
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-foreground/80">Password</Label>
                    <Link
                      to="/request-password"
                      className="ml-auto text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline-offset-4 hover:underline transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    className="border-orange-200/50 dark:border-orange-500/30 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 transition-all duration-300"
                    required
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  disabled={isPending}
                >
                  {isPending ? "Loading..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-4 font-medium transition-colors">
                  Sign up
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
  )
}
