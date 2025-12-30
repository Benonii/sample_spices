import { Mail, ArrowLeft } from "lucide-react";
import { Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmailVerificationPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 border border-orange-200">
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-neutral-900">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-neutral-600 text-sm leading-relaxed">
              We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">
                What's next?
              </h3>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Check your email inbox</li>
                <li>• Look for our verification message</li>
                <li>• Click the verification link</li>
                <li>• Return here to sign in</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-4">
                Didn't receive the email? Check your spam folder or contact support.
              </p>

              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            Need help? Contact our{" "}
            <a href="#" className="text-orange-600 hover:text-orange-700 underline underline-offset-2">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
