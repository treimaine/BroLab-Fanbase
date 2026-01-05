import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your BroLab Fanbase account
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-sm rounded-2xl",
              headerTitle: "text-foreground font-serif",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "border border-border hover:bg-accent/50 transition-colors rounded-xl",
              socialButtonsBlockButtonText: "text-foreground font-medium",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors",
              formFieldInput: "border border-input bg-background rounded-xl focus:ring-2 focus:ring-ring focus:ring-offset-2",
              formFieldLabel: "text-foreground font-medium",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary hover:text-primary/80",
              footerActionText: "text-muted-foreground",
              footerActionLink: "text-primary hover:text-primary/80 font-medium",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              otpCodeFieldInput: "border border-input rounded-lg",
              alternativeMethodsBlockButton: "border border-border hover:bg-accent/50 rounded-xl",
            },
            layout: {
              socialButtonsPlacement: "top",
              showOptionalFields: true,
            },
          }}
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}