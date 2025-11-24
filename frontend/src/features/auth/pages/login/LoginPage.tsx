import kaisLogo from '@/assets/kais-white-logo.png';
import { LoginForm } from '../../components/LoginForm';

export const LoginPage = () => {
  return (
    <div className="grid min-h-svh grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="bg-kais-primary relative">
        <img
          src={kaisLogo}
          alt="KAIS logo"
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  );
};
