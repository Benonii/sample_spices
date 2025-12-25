"use client"

// biome-ignore assist/source/organizeImports: can't make Biome happy
import { cn } from "@/lib/utils"
import type { SignupInput } from "@backend/utils/schemas"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, type SubmitHandler } from "react-hook-form"
import { authClient } from "@/lib/authClient"
import { toast } from "sonner"
import useStore from "@/lib/store"
import { Link, useNavigate } from "@tanstack/react-router"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<SignupInput>();
  const { signupPending, setSignupPending } = useStore();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<SignupInput> = async (data) => {
    
    try {
      setSignupPending(true)
      const { email, password, firstName, lastName } = data;
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`,
        callbackURL: "/"
      }, {
        onSuccess: async () => {
          toast.success("Account created! Please verify your email before signing in.")
          navigate({ to: "/login" })
        },
      });
      error && toast.error(error?.message || "Error Signing up")
    } finally {
      setSignupPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 max-w-xl mx-auto", className)} {...props}>
      <Card className="p-2 bg-white">
        <CardHeader className="space-y-2 pb-3">
          <CardTitle className="text-xl font-bold text-center pt-4">Create your account</CardTitle>
          <CardDescription className="text-sm text-center text-muted-foreground">
            Fill in your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-xs font-medium">First Name</Label>
                  <Input
                    id={"firstName"}
                    type="text"
                    placeholder="John"
                    required
                    className={cn(
                      "h-10 text-xs px-3",
                      errors.firstName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.firstName.message || "First name is required"}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-xs font-medium">Last Name</Label>
                  <Input
                    id={"lastName"}
                    type="text"
                    placeholder="Doe"
                    required
                    className={cn(
                      "h-10 text-xs px-3",
                      errors.lastName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.lastName.message || "Last name is required"}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                <Input
                  id={"email" }
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                  className={cn(
                    "h-10 text-xs px-3",
                    errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message || "Please enter a valid email address"}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                <Input
                  id={"password"}
                  type="password" 
                  placeholder="Create a password"
                  required
                  className={cn(
                    "h-10 text-xs px-3",
                    errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>
            
              {/* Confirm Password Field */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">Confirm Password</Label>
                <Input
                  id={"confirmPassword"}
                  type="password"
                  placeholder="Confirm your password"
                  required
                  className={cn(
                    "h-10 text-xs px-3",
                    errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => {
                      const password = watch("password");
                      return value === password || "Passwords don't match";
                    }
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <Button 
                  type="submit" 
                  className="w-full h-10 text-xs font-medium bg-primary/80 hover:bg-primary/90 text-white"
                  disabled={signupPending}
                >
                  { signupPending ? "Creating account..." : "Create Account" }
                </Button>
              </div>
            </div>
            <div className="pt-2 pb-5 text-center text-xs">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4 text-primary font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}