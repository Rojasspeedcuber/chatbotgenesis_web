import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Cadastro - Chatbot Gênesis",
  description: "Crie sua conta no Chatbot Gênesis",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <RegisterForm />
    </div>
  );
}
