"use client"

// biome-ignore assist/source/organizeImports: can't make Biome happy
import useStore from "@/lib/store"
import { useForm, type SubmitHandler } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/authClient"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import type { LoginInput } from "@backend/utils/schemas"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginInput>();
  const { loginPending, setLoginPending, socialSignInPending, setSocialSignInPending } = useStore();
  const navigate = useNavigate();

   const handleSocialSignIn = async () => {
    setSocialSignInPending(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${import.meta.env.VITE_BASE_URL}`,
    }, {
      onSuccess: () => {
        toast.success(`Google sign-in initiated!`)
      },
      // biome-ignore lint/suspicious/noExplicitAny: I trust better auth
      onError: (error: any) => {
        toast.error(error.error?.message || "Error signing in");
      },
    });
    setSocialSignInPending(false);
  };

  const onSubmit: SubmitHandler<LoginInput> = async (data) => {
    console.log("======DATA======\n", data);
    try {
      setLoginPending(true);
      const { email, password } = data;
      console.log(email, password);
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message || "Error signing in");
      } else {
        toast.success("Successfully signed in!");
        navigate({ to: "/" });
      }
    } finally {
      setLoginPending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 max-w-xl mx-auto", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={socialSignInPending}
                  onClick={handleSocialSignIn}
                >
                  {socialSignInPending ? "Logging in..." : "Login with Google"}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id={"email" }
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message || "Please enter a valid email address"}
                  </p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href={`${import.meta.env.VITE_BASE_URL}/forgot-password`}
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id={"password"} 
                  type="password" 
                  required 
                  className={cn(
                    errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message || "Password is required"}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={loginPending}>
                  {loginPending ? "Signing in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href={`${import.meta.env.VITE_BASE_URL}/signup`}>Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href={`${import.meta.env.VITE_BASE_URL}/terms-of-service`}>Terms of Service</a>{" "}
        and <a href={`${import.meta.env.VITE_BASE_URL}/privacy-policy`}>Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
