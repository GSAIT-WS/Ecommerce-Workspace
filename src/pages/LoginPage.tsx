import { usePageTitle } from "@/hooks/usePageTitle";
import { AuthGateway } from "@/components/auth/AuthGateway";

const LoginPage = () => {
  usePageTitle("Sign In");
  return <AuthGateway mode="login" />;
};

export default LoginPage;
