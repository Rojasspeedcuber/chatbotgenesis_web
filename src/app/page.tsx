import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Book, MessageSquare, Shield, Sparkles, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: Book,
    title: "Base Bíblica NVI",
    description: "Respostas fundamentadas na Nova Versão Internacional, com versículos citados e contextualizados.",
  },
  {
    icon: MessageSquare,
    title: "Conversas Naturais",
    description: "Faça perguntas como se estivesse conversando com um amigo que conhece profundamente as Escrituras.",
  },
  {
    icon: Sparkles,
    title: "Inteligência Artificial",
    description: "Tecnologia avançada de IA para entender suas perguntas e fornecer respostas relevantes e edificantes.",
  },
  {
    icon: Shield,
    title: "Respostas Confiáveis",
    description: "Cada resposta é baseada em versículos bíblicos, garantindo fidelidade às Escrituras.",
  },
];

const benefits = [
  "Acesso ilimitado a conversas com o assistente",
  "Histórico de conversas salvo na nuvem",
  "Busca inteligente em toda a Bíblia",
  "Respostas contextualizadas e teológicas",
  "Suporte a dúvidas e reflexões espirituais",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Gênesis</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Criar Conta</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Seu Assistente Bíblico
            <span className="text-primary"> Powered by AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Faça perguntas sobre a Bíblia, busque orientação espiritual e explore
            os ensinamentos das Escrituras com a ajuda de inteligência artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Como Funciona
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-lg mx-auto">
          <Card className="border-primary/20 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Assinatura Mensal</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">R$ 9,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full" size="lg">
                  Começar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão usando o Chatbot Gênesis
            para aprofundar seu conhecimento bíblico.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Criar Minha Conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              <span className="font-semibold">Chatbot Gênesis</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} Chatbot Gênesis. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
