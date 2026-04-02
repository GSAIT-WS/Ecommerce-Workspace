import { usePageTitle } from "@/hooks/usePageTitle";
import { AuthGateway } from "@/components/auth/AuthGateway";

const SignupPage = () => {
  usePageTitle("Create Account");
  return <AuthGateway mode="signup" />;
};

export default SignupPage;
