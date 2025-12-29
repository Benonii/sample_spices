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
      const { email, password, name } =  data;
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Join us to discover authentic Ethiopian spices and traditional blends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Jane Doe" {...register("name")} required />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" {...register("email")} required />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} required />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} required />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                {isPending ? "Creating account..." : "Sign up"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking sign up, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
