import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import SiteFooter from "@/components/SiteFooter";

export default async function Home() {
  const faqItems = [
    {
      title: "1. A avaliação é on-line?",
      body:
        "Sim. A avaliação pode ser realizada de forma on-line com método estruturado e instrumentos adequados.",
    },
    {
      title: "2. Quantas sessões são necessárias?",
      body:
        "O processo envolve entrevista inicial, sessões de avaliação e devolutiva.",
    },
    {
      title: "3. A avaliação confirma se a pessoa é superdotada?",
      body:
        "Sim. A avaliação investiga indicadores de altas habilidades, compreende o perfil cognitivo e orienta os próximos passos."   
    },

  ];
  let approvedTherapistsCount = 0;

  try {
    approvedTherapistsCount = await prisma.therapist.count({
      where: { approved: true },
    });
  } catch (error) {
    console.error("Failed to load approved therapists count:", error);
  }

  const approvedTherapistsLabel = approvedTherapistsCount.toLocaleString("pt-BR");

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-center text-4xl lg:text-5xl font-bold text-gray-800 mb-10 leading-tight">
          Bem-vindo ao{" "}
          <span className="text-[#b8860b]">
            OASIS da Superdotação
          </span>
        </h1>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Main Photo Section */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://image2url.com/r2/default/images/1769521007685-2ccd6641-4a16-4883-b3d6-9506f656ff3b.jpeg"
                  alt="Oásis ao pôr do sol"
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-black rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Text Block with Description */}
          <div className="order-1 lg:order-2">
            <div className="max-w-lg">
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                Onde a ciência encontra a sua história: Entenda o funcionamento único do seu cérebro.
 Mais do que um diagnóstico, oferecemos clareza. Especialistas em avaliação neuropsicológica online para superdotação, TDAH e autismo (TEA), além dos transtornos do afeto, personalidade e da aprendizagem. Encontre as respostas que você buscou a vida inteira.</p>
                
                <p>
                Você já sentiu que o mundo parece processar as informações em uma velocidade diferente da sua? Talvez você lide com uma intensidade intelectual que poucos compreendem, uma mente que nunca desliga, ou uma forma de ver o mundo que parece não se encaixar nos padrões convencionais.</p>
                
                <p>
                No Oasis Da Superdotação, entendemos que a neurodivergência não é um erro de processamento, mas uma configuração única. Unimos o rigor científico da neuropsicologia clínica à empatia necessária para acolher pessoas que buscam, finalmente, entender quem são.</p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/avaliacao-neuropsicologica"
                  className="bg-gray-800 hover:bg-gray-900 text-[#c49a2f] font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-center border-2 border-[#c49a2f]"
                >
                  Conheça a avaliação
                </Link>
                <Link
                  href="/psicologos"
                  className="bg-white border-2 border-[#f2c94c] text-black hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
                >
                  Encontrar Psicólogos
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-100 rounded-xl">
            <div className="text-3xl font-bold text-[#d4af37] mb-2">
              5.000+
            </div>
            <div className="text-gray-600">Laudos Neuropsicológicos Emitidos</div>
          </div>
          <div className="text-center p-6 bg-gray-100 rounded-xl">
            <div className="text-3xl font-bold text-[#d4af37] mb-2">10/10</div>
            <div className="text-gray-600">Instrumentos Padrão Ouro</div>
          </div>
          <div className="text-center p-6 bg-gray-100 rounded-xl">
            <div className="text-3xl font-bold text-[#d4af37] mb-2">24/7</div>
            <div className="text-gray-600"> Suporte Disponível</div>
          </div>

        </div>

        {/* Highlight Section */}
        <section className="mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-gray-50 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-xl">
                  ✨
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  O OASIS da Superdotação!
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                Acreditamos que o diagnóstico é apenas o começo. Por isso, criamos o OASIS da
                Superdotação, um refúgio digital e terreno fértil para ser a referência no acolhimento
                de mentes extraordinárias. Mais do que suporte clínico, oferecemos um ecossistema de
                parcerias, fortalecimento e desenvolvimento de ideias.
              </p>

              <div className="space-y-3 text-gray-700">
                <p className="font-semibold text-gray-900">
                  Nossa comunidade se sustenta em três pilares fundamentais:
                </p>
                <p>
                  1. Validação da Identidade: Ser &ldquo;diferente&rdquo; é a norma; sua trajetória é única.
                </p>
                <p>
                  2. Amizades Saudáveis: Conexões reais com pessoas que compartilham sua intensidade
                  e curiosidade.
                </p>
                <p>
                  3. Descoberta Vocacional: Apoio prático para entender seu potencial como realização
                  profissional.
                </p>
              </div>

              <p className="mt-6 text-gray-900 font-semibold italic">
                &ldquo;Sua mente não precisa caminhar sozinha. Encontre clareza, tratamento e comunidade em
                um só lugar.&rdquo;
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/avaliacao-neuropsicologica"
                  className="bg-gray-800 hover:bg-gray-900 text-[#c49a2f] font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-center border-2 border-[#c49a2f]"
                >
                  Conheça a avaliação
                </Link>
                <Link
                  href="/psicologos"
                  className="bg-white border-2 border-[#f2c94c] text-black hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
                >
                  Encontrar Psicólogos
                </Link>
                <Link
  href="https://chat.whatsapp.com/LJHVpVMvC0s28HUyKKrXBe?mode=wwc"
  className="bg-[#c49a2f] border-2 border-black text-white hover:bg-[#b8860b] font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
>
  Faça parte da comunidade
</Link>
              </div>
            </div>
          </div>
        </section>


        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-gray-800 p-6 text-gray-100 shadow-xl border border-[#C9A44C]/20">
                {/* Badge */}
                <div className="inline-block rounded-full border border-[#C9A44C] px-4 py-1 text-base text-[#C9A44C] mb-4">
                O que é superdotação?
                </div>

                {/* Texto */}
                <p className="text-sm text-gray-300 leading-relaxed mt-3">
                A superdotação não se resume apenas a um QI elevado.
                  <br /><br />
                  
                  <strong className="text-[#C9A44C] text-base">
                  Ela envolve características como:
                  </strong>

                  <br /><br />
                

                {/* Lista */}
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Raciocínio rápido
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Curiosidade intelectual intensa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Facilidade para aprender
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Pensamento analítico ou complexo
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Criatividade elevada

                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Grande interesse por determinados temas
                    
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Intensidade intelectual ou emocional
                  </li>
                </ul>
                <br /><br />
                A avaliação permite compreender se essas características fazem parte de um perfil de altas habilidades.. 
                  <br /><br />
                  </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-gray-800 p-6 text-gray-100 shadow-xl border border-[#C9A44C]/20">
                {/* Badge */}
                <div className="inline-block rounded-full border border-[#C9A44C] px-4 py-1 text-base text-[#C9A44C] mb-4">
                O que a avaliação investiga?
                </div>

                {/* Texto */}
                <p className="text-sm text-gray-300 leading-relaxed mt-3">
                <strong className="text-[#C9A44C] text-base">
                Durante a avaliação, são analisados aspectos como:
                  </strong>

                {/* Lista */}
                <ul className="space-y-2 text-sm text-gray-300 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Inteligência
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Atenção
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Memória
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Linguagem
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Raciocínio Lógico
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Funções Executivas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Aspectos emocionais
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Aspectos comportamentais
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Aspectos de personalidade
                  </li>
                </ul>
                  <br /><br />
                Essa análise permite compreender com mais profundidade como o paciente funciona cognitivamente e emocionalmente. 
                  <br /><br />
                  
                </p>

              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-gray-800 p-6 text-gray-100 shadow-xl border border-[#C9A44C]/20">
                {/* Badge */}
                <div className="inline-block rounded-full border border-[#C9A44C] px-4 py-1 text-base text-[#C9A44C] mb-4">
                Por que investigar?
                </div>

                {/* Texto */}
                <p className="text-sm text-gray-300 leading-relaxed mt-3">
                <strong className="text-[#C9A44C] text-base">
                A avaliação pode ajudar a:
                  </strong>

                {/* Lista */}
                <ul className="space-y-2 text-sm text-gray-300 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Compreender melhor o próprio perfil intelectual
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Identificar potencialidades
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Entender desafios que podem coexistir com altas habilidades
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Ampliar o autoconhecimento
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Orientar escolhas acadêmicas e profissionais
                  </li>
                  
                </ul>
                  <br /><br />
                  Mais do que um rótulo, o objetivo é trazer clareza sobre o funcionamento cognitivo. 
                  <br /><br />
                  
                </p>

              </div>
          </div>
          <div className="mt-10 rounded-xl border border-gray-200 bg-gray-800 p-8">
              <h2 className="text-2xl font-bold text-[#C9A44C] mb-3">
                Perguntas frequentes:
              </h2>
              <p className="text-white mb-8">
                Respostas claras para você entender o funcionamento do processo.
              </p>
              <div className="space-y-4">
                {faqItems.map((item) => (
                <details key={item.title} className="group rounded-xl bg-[#B8963F] p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-white">
                    <span>{item.title}</span>
                    <svg
                      className="h-5 w-5 text-white transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-gray-900 leading-relaxed">{item.body}</p>
                </details>
                ))}
              </div>
            </div>

        <section className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <article className="flex h-full w-full flex-col items-center rounded-2xl border border-gray-200 bg-gray-800 p-4 pr-1 shadow-sm">
              <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src="https://image2url.com/r2/default/images/1769564311518-c9cf014f-d443-4bab-839f-0433ed5eebc6.png"
                  alt="Lucas Cardoso da Silva"
                  width={800}
                  height={600}
                  className="h-auto w-full"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="max-w-sm space-y-2 pt-4 text-sm text-white text-center">
                <h3 className="text-lg font-semibold text-white">
                  LUCAS CARDOSO DA SILVA
                </h3>
                <p className="text-white">
                  Idealizador e Cofundador do OASIS DA SUPERDOTAÇÃO
                </p>
                <ul className="list-disc list-inside space-y-1 text-white">
                  <li>Estudante de Psicologia / UFF-RJ</li>
                  <li>Entusiasta das Altas Habilidades e Superdotação</li>
                </ul>
              </div>
            </article>

            <article className="flex h-full w-full flex-col items-center rounded-2xl border border-gray-200 bg-gray-800 p-4 pr-1 shadow-sm">
              <div className="w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src="https://image2url.com/r2/default/images/1769520414061-8e1cc35e-b003-4f42-9e1a-dedd7bd1fea7.png"
                  alt="Dr. Cristiano Herrera"
                  width={800}
                  height={600}
                  className="h-auto w-full"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="mt-auto max-w-sm space-y-2 pt-4 text-sm text-white text-center">
                <h3 className="text-lg font-semibold text-white">
                  DR. CRISTIANO DE ALMEIDA HERRERA - CRP: 06/125097
                </h3>
                <p className="text-white">
                  Neuropsicólogo e Psicólogo responsável pela equipe técnica e Cofundador do OASIS DA
                  SUPERDOTAÇÃO
                </p>
                <ul className="list-disc list-inside space-y-1 text-white">
                  <li>Neuropsicólogo / USP - SP</li>
                  <li>Psicólogo Clínico / IMES</li>
                  <li>Certificado em Neuroreabilitação / HARVARD - USA</li>
                  <li>Especialista em Reabilitação Neuropsicológica / USP - SP</li>
                  <li>Terapeuta em Biofeedback e Neurofeedback</li>
                  <li>Membro fundador da Associação Brasileira de Biofeedback (ABBIO)</li>
                </ul>
              </div>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
