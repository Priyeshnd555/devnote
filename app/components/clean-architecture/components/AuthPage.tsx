import React from "react";
import { Button } from "@/components/ui/button";

interface AuthPageProps {
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSignInClick, onSignUpClick }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Welcome to DevNote</h1>
        <p className="mt-4 text-lg text-gray-400">
          A minimalist to-do app for developers.
        </p>
        <div className="mt-8 space-x-4">
          <Button onClick={onSignInClick} variant="outline">
            Sign In
          </Button>
          <Button onClick={onSignUpClick}>Sign Up</Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
