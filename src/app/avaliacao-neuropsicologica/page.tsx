"use client";

import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

/** Fallback while the fixed backdrop loads — matches the scrim’s lower tones */
const neuroPageShell = "relative min-h-screen bg-[#030208]";

/**
 * One full-viewport image behind the entire page so the art feels continuous
 * (no “cut” at the hero). Scrims tune readability: hero legible, mid scroll
 * still shows depth, bottom eases toward a calm base for the footer.
 */
function NeuroAmbientBackdrop({ priority }: { priority?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <Image
        src="/images/bg-neuro.png"
        alt=""
        fill
        priority={priority}
        className="object-cover object-[center_28%] sm:object-[center_32%] md:object-center scale-[1.07]"
        sizes="100vw"
      />
      {/* Primary atmosphere: follows image lighting, no hard horizontal break */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(155deg, rgba(12,6,28,0.88) 0%, rgba(8,4,18,0.45) 38%, transparent 62%),
            linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(12,7,26,0.18) 28%, rgba(10,6,22,0.5) 55%, rgba(10,6,22,0.72) 78%, rgba(2,1,8,0.96) 100%)
          `,
        }}
      />
      {/* Subtle cool / violet lift in the mid band so the “glow” of the art reads through */}
      <div
        className="absolute inset-0 opacity-70 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% 35%, rgba(124,58,237,0.12), transparent 65%)",
        }}
      />
    </div>
  );
}

function NeuroMarketingHero({ purchaseHref }: { purchaseHref: string }) {
  return (
    <section className="relative min-h-[min(88vh,640px)] w-full">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-transparent md:from-black/28"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col justify-end gap-6 px-4 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-24 md:min-h-[min(88vh,640px)] md:justify-center md:pb-32 lg:px-8">
        <p className="inline-flex w-fit items-center rounded-full border border-[#C9A44C]/45 bg-[#0B1F3A]/35 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8D5A3] backdrop-blur-md sm:text-xs">
          Protocolos validados · Atendimento humanizado
        </p>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white text-balance drop-shadow-md sm:text-5xl md:text-6xl">
            Avaliação Neuropsicológica
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg md:text-xl">
            Entenda cognição, emoção e comportamento com clareza — da superdotação ao TDAH, TEA e
            aprendizagem. Um laudo que orienta escola, terapia e decisões com base em evidências.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href={purchaseHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#C9A44C] px-8 py-3.5 text-sm font-semibold text-[#0B1F3A] shadow-lg shadow-[#0B1F3A]/25 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#d4b056] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A44C]"
          >
            Quero iniciar minha jornada
          </a>
          <p className="max-w-xs text-sm text-white/80 sm:max-w-none">
            Fale no WhatsApp e descubra o processo ideal para você ou sua família.
          </p>
        </div>
      </div>
    </section>
  );
}

function NeuroWelcomeHero({ scheduleHref }: { scheduleHref: string }) {
  return (
    <section className="relative w-full border-b border-white/[0.06]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent sm:from-black/30"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-16 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D5A3]">
            Acesso confirmado
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Sua avaliação neuropsicológica
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
            Em breve nossa equipe entra em contato para o agendamento. Enquanto isso, veja as
            respostas abaixo ou fale conosco pelo WhatsApp.
          </p>
        </div>
        <a
          href={scheduleHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-[#C9A44C] bg-[#C9A44C]/15 px-6 py-3 text-sm font-semibold text-[#E8D5A3] backdrop-blur-sm transition-all hover:bg-[#C9A44C]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A44C]"
        >
          Agendar pelo WhatsApp
        </a>
      </div>
    </section>
  );
}

export default function AvaliacaoNeuropsicologicaPage() {
  const hotmartUrl = "https://pay.hotmart.com/SEU-CODIGO";
  const whatsappNumber = WHATSAPP_NUMBER;
  const whatsappPurchaseLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá, eu gostaria de saber mais e efetuar a compra da minha avaliação neuropsicológica."
  )}`;
  const whatsappScheduleLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá, desejo agendar minha avaliação."
  )}`;
  const { user } = useAuth();
  const [hasAccessTag, setHasAccessTag] = useState<boolean | null>(null);
  const faqItems = [
    {
      title: "1. Como saber se eu (ou meu filho) realmente preciso de uma Avaliação Neuropsicológica?",
      body:
        "A avaliação é indicada quando existe a sensação de que o esforço empregado nas tarefas diárias não corresponde aos resultados, ou quando há um sentimento persistente de 'funcionar diferente' das outras pessoas. Se você lida com lapsos de atenção, dificuldades de interação social, intensidade emocional acima da média ou um potencial intelectual que parece 'travado', a avaliação é o caminho. Ela substitui o 'achismo' por dados concretos, identificando se essas características fazem parte de um quadro de Superdotação, TDAH, TEA ou outra condição neuropsicológica.",
    },
    {
      title: "2. A avaliação feita de forma online tem a mesma validade da presencial?",
      body:
        "Sim. Utilizamos protocolos e testes psicométricos 'Padrão Ouro', rigorosamente validados para aplicação remota e aprovados pelos conselhos de classe. A ciência atual demonstra que a avaliação online não apenas mantém a precisão técnica, mas oferece uma vantagem crucial para perfis neurodivergentes: a pessoa realiza as sessões em seu ambiente seguro, reduzindo a ansiedade e o estresse sensorial, o que permite que seu funcionamento cognitivo real apareça de forma mais autêntica.",
    },
    {
      title: "3. O que exatamente é avaliado durante o processo?",
      body:
        "Nós realizamos um mapeamento profundo da arquitetura do seu cérebro. Isso inclui o estudo das funções executivas (capacidade de planejar e agir), atenção sustentada, memória, inteligência (QI), processamento visual e auditivo, além de aspectos emocionais e de personalidade. O objetivo não é apenas encontrar uma 'etiqueta', mas desenhar o seu perfil neurocognitivo único, destacando suas fortalezas e as áreas que precisam de suporte."   
    },
    {
      title: "4. Quanto tempo leva para eu receber o meu laudo final?",
      body:
        "O processo é criterioso porque priorizamos a precisão. Após a conclusão das sessões, nossa equipe multidisciplinar — composta por especialistas em neuropsicologia e neurologia — analisa os dados e discute o caso. O laudo final, detalhado e com diretrizes práticas, é entregue em média em *30 dias*. Com a experiência de mais de 5.000 laudos emitidos, entendemos que esse tempo é o investimento necessário para um documento que servirá como o 'manual de instruções' para sua vida ou para o tratamento do seu filho."
    },
    {
      title: "5. Receber um diagnóstico de TDAH, TEA ou Superdotação muda o quê na prática?",
      body:
        "O diagnóstico é o início da liberdade. Para o TDAH, ele permite estratégias de manejo de foco e organização que realmente funcionam. Para o TEA, traz a compreensão do perfil sensorial e social, promovendo qualidade de vida e direitos. Na Superdotação, ele evita o sofrimento pelo tédio e pela subutilização do potencial. Em todos os casos, o laudo oferece o direcionamento exato para terapias, ajustes escolares ou intervenções médicas, economizando tempo e recursos em tratamentos genéricos que não funcionariam para você.",
    },
    {
      title: "6. Adultos também podem fazer a avaliação para Superdotação ou Autismo?",
      body:
        "Com certeza. É cada vez mais comum que adultos busquem a avaliação após passarem a vida inteira sentindo-se 'desajustados' ou recebendo diagnósticos errados de ansiedade e depressão. A descoberta tardia de uma neurodivergência costuma ser um momento de grande alívio e ressignificação da própria história, permitindo que o adulto finalmente entenda seus limites e aprenda a usar suas habilidades naturais a seu favor.",
    },
  ];

  const isPatient = user?.type === "paciente";

  useEffect(() => {
    if (!user || !isPatient) {
      setHasAccessTag(null);
      return;
    }

    let cancelled = false;
    const loadAccessTag = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        const profile = data?.profile ?? {};
        const tags = Array.isArray(profile?.tags) ? profile.tags : [];
        const hasAccess = Boolean(profile?.avaliacaoNeuropsicologicaLiberada) ||
          tags.includes("avaliacao-neuropsicologica");
        if (!cancelled) setHasAccessTag(hasAccess);
      } catch {
        if (!cancelled) setHasAccessTag(false);
      }
    };

    loadAccessTag();
    return () => {
      cancelled = true;
    };
  }, [isPatient, user?.id, user]);

  const accessStatus = useMemo(() => {
    if (!user) return "public";
    if (user.role === "ADMIN") return "main";
    if (user.type === "profissional") return "profissional";
    if (!isPatient) return "public";
    if (hasAccessTag === null) return "loading";
    return hasAccessTag ? "main" : "public";
  }, [hasAccessTag, isPatient, user]);

  if (accessStatus === "loading") {
    return (
      <div className={neuroPageShell}>
        <NeuroAmbientBackdrop />
        <div className="relative z-10">
          <SiteFooter />
        </div>
      </div>
    );
  }

  if (accessStatus === "profissional") {
    return (
      <div className={neuroPageShell}>
        <NeuroAmbientBackdrop />
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="rounded-2xl border border-[#C9A44C]/25 bg-white/98 p-10 text-center shadow-xl shadow-black/40 backdrop-blur-sm">
              <h1 className="text-2xl font-bold text-gray-900">Avaliação Neuropsicológica</h1>
              <p className="mt-4 text-sm text-gray-600">
                O conteúdo desta página é exclusivo para pacientes que efetuaram a compra de nossa
                avaliação. Obrigado por fazer parte do nosso time!
              </p>
            </div>
          </div>
          <SiteFooter />
        </div>
      </div>
    );
  }

  if (accessStatus === "public") {
    return (
      <div className={neuroPageShell}>
        <NeuroAmbientBackdrop priority />
        <div className="relative z-10">
          <NeuroMarketingHero purchaseHref={whatsappPurchaseLink} />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 pt-0">
            <div className="-mt-12 rounded-2xl border border-white/12 bg-white/97 p-8 shadow-2xl shadow-black/45 ring-1 ring-[#7c3aed]/10 backdrop-blur-sm sm:-mt-16 sm:p-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                O que a avaliação investiga?
              </h2>
              <p className="mt-4 text-sm text-gray-600 md:text-base">
                A avaliação neuropsicológica investiga o funcionamento cognitivo, emocional e
                comportamental para compreender dificuldades do dia a dia e orientar decisões
                clínicas e educacionais.
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-gray-600">
                Quer iniciar sua avaliação? Garanta seu atendimento clicando no botão abaixo.
              </p>
              <a
                href={whatsappPurchaseLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-gray-800 px-8 py-3 text-sm font-semibold text-yellow-200 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Quero iniciar minha jornada de descoberta
              </a>
              <p className="text-xs text-gray-500">
              Fale com um especialista e entenda qual o processo ideal para o seu perfil.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-gray-800 p-6 text-gray-100 shadow-xl border border-[#C9A44C]/20">
                {/* Badge */}
                <div className="inline-block rounded-full border border-[#C9A44C] px-4 py-1 text-base text-[#C9A44C] mb-4">
                  Avaliação Neuropsicológica em Altas Habilidades e Superdotação
                </div>

                {/* Texto */}
                <p className="text-sm text-gray-300 leading-relaxed mt-3">
                  A avaliação neuropsicológica é fundamental para entender as Altas Habilidades e Superdotação. Essas condições caracterizam-se por uma capacidade intelectual acima da média, criatividade e habilidades específicas em áreas como matemática, música ou arte.
                  
                  <br /><br />
                  
                  <strong className="text-[#C9A44C] text-base">
                    Objetivos da avaliação neuropsicológica em Altas Habilidades e Superdotação
                  </strong>

                  <br /><br />
                </p>

                {/* Lista */}
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Identificar as habilidades e talentos específicos da pessoa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Avaliar as funções cognitivas e comportamentais da pessoa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Desenvolver um plano de intervenção personalizado para estimular o desenvolvimento
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Monitorar o progresso e ajustar o plano de intervenção conforme necessário
                  </li>
                </ul>

              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-gray-800 p-6 text-gray-100 shadow-xl border border-[#C9A44C]/20">
                {/* Badge */}
                <div className="inline-block rounded-full border border-[#C9A44C] px-4 py-1 text-base text-[#C9A44C] mb-4">
                  Avaliação Neuropsicológica em TDAH
                </div>

              

                {/* Texto */}
                <p className="text-sm text-gray-300 leading-relaxed mt-3">
                A avaliação neuropsicológica é fundamental para entender o Transtorno de Déficit de Atenção e Hiperatividade (TDAH). Essa condição afeta a capacidade de uma pessoa de se concentrar, controlar impulsos e regular o comportamento.
                  <br /><br />
                  
                  <strong className="text-[#C9A44C] text-base">
                  Objetivos da avaliação neuropsicológica em TDAH
                  </strong>

                  <br /><br />
                </p>

                {/* Lista */}
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Identificar as causas subjacentes do TDAH

                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Avaliar as funções cognitivas e comportamentais da pessoa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Desenvolver um plano de intervenção personalizado
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Monitorar o progresso e ajustar o plano de intervenção conforme necessário
                  </li>
                </ul>

              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-gray-800 p-6 text-gray-100 shadow-xl border border-[#C9A44C]/20">
                {/* Badge */}
                <div className="inline-block rounded-full border border-[#C9A44C] px-4 py-1 text-base text-[#C9A44C] mb-4">
                Avaliação Neuropsicológica em Transtorno do Espectro Autista (TEA)
                </div>

              

                {/* Texto */}
                <p className="text-sm text-gray-300 leading-relaxed mt-3">
                A avaliação neuropsicológica é fundamental para entender o Transtorno do Espectro Autista (TEA). Essa condição afeta a comunicação, a interação social e o comportamento de uma pessoa.  
                  <br /><br />
                  
                  <strong className="text-[#C9A44C] text-base">
                  Objetivos da avaliação neuropsicológica em TEA
                  </strong>

                  <br /><br />
                </p>

                {/* Lista */}
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Identificar as características e necessidades específicas da pessoa com TEA
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Avaliar as funções cognitivas e comportamentais da pessoa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Desenvolver um plano de intervenção personalizado para melhorar a comunicação e a interação social
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Monitorar o progresso e ajustar o plano de intervenção conforme necessário
                  </li>
                </ul>

              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-gray-800 p-6 text-gray-100 shadow-xl border border-[#C9A44C]/20">
                {/* Badge */}
                <div className="inline-block rounded-full border border-[#C9A44C] px-4 py-1 text-base text-[#C9A44C] mb-4">
                Avaliação Neuropsicológica nos Transtornos da Aprendizagem
                </div>

              

                {/* Texto */}
                <p className="text-sm text-gray-300 leading-relaxed mt-3">
                A avaliação neuropsicológica é fundamental para entender os transtornos da aprendizagem e desenvolver estratégias de intervenção eficazes. Os transtornos da aprendizagem, como a dislexia, a disgráfica e a discalculia, afetam a capacidade de uma pessoa de aprender e processar informações.

                  <br /><br />
                  
                  <strong className="text-[#C9A44C] text-base">
                  Objetivos da avaliação neuropsicológica nos transtornos da aprendizagem
                  </strong>

                  <br /><br />
                </p>

                {/* Lista */}
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Identificar as causas subjacentes dos transtornos da aprendizagem
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Avaliar as funções cognitivas e comportamentais da pessoa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Desenvolver um plano de intervenção personalizado
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Monitorar o progresso e ajustar o plano de intervenção conforme necessário
                  </li>
                </ul>

              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-1">
            <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-gray-800 p-6 text-gray-100 shadow-xl border border-[#C9A44C]/20">
                {/* Badge */}
                <div className="inline-block rounded-full border border-[#C9A44C] px-4 py-1 text-base text-[#C9A44C] mb-4">
                Avaliação Neuropsicológica em Transtornos do Afeto e Personalidade
                </div>

              

                {/* Texto */}
                <p className="text-sm text-gray-300 leading-relaxed mt-3">
                A avaliação neuropsicológica é fundamental para entender os transtornos do afeto e personalidade, como a depressão, a ansiedade, o transtorno bipolar e o transtorno de personalidade borderline. Esses transtornos afetam a forma como uma pessoa pensa, sente e se comporta.
                  <br /><br />
                  
                  <strong className="text-[#C9A44C] text-base">
                  Objetivos da avaliação neuropsicológica em transtornos do afeto e personalidade
                  </strong>

                  <br /><br />
                </p>

                {/* Lista */}
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Identificar as causas subjacentes dos transtornos do afeto e personalidade
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Avaliar as funções cognitivas e comportamentais da pessoa
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Desenvolver um plano de intervenção personalizado
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A44C]">●</span>
                    Monitorar o progresso e ajustar o plano de intervenção conforme necessário
                  </li>
                </ul>

              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Como funciona a avaliação?</h2>
              <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-gray-800 p-5 text-sm text-gray-700">
                  <h3 className="text-base font-semibold text-[#C9A44C]">1. Entrevista inicial</h3>
                  <p className="mt-2 text-white">
                  Compreensão do histórico, das queixas e dos objetivos da avaliação.
                  </p>
                </div>
              <div className="rounded-lg border border-gray-200 bg-gray-800 p-5 text-sm text-gray-700">
                  <h3 className="text-base font-semibold text-[#C9A44C]">2. Aplicação de testes</h3>
                  <p className="mt-2 text-white">
                  Instrumentos padronizados para investigar diferentes funções cognitivas.
                  </p>
                </div>
              <div className="rounded-lg border border-gray-200 bg-gray-800 p-5 text-sm text-gray-700">
                  <h3 className="text-base font-semibold text-[#C9A44C]">3. Análise dos resultados</h3>
                  <p className="mt-2 text-white">
                  Integração cuidadosa das informações obtidas.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-800 p-5 text-sm text-gray-700">
                  <h3 className="text-base font-semibold text-[#C9A44C]">4. Devolutiva</h3>
                  <p className="mt-2 text-white">
                  Apresentação dos resultados, explicação detalhada e orientações.
                  </p>
                </div>
              </div>       
            </div>

          <div className="mt-10 rounded-xl border border-gray-200 bg-gray-800 p-8">
              <h2 className="text-2xl font-bold text-[#C9A44C] mb-3">
                Dúvidas Frequentes: O Caminho para o seu Diagnóstico
              </h2>
              <p className="text-white mb-8">
                Respostas claras para você entender cada etapa do processo.
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

            <div className="mt-10 flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-gray-600">
                Quer iniciar sua avaliação? Garanta seu atendimento clicando no botão abaixo.
              </p>
              <a
                href={whatsappPurchaseLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-gray-800 px-8 py-3 text-sm font-semibold text-yellow-200 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Quero iniciar minha jornada de descoberta
              </a>
              <p className="text-xs text-gray-500">
              Fale com um especialista e entenda qual o processo ideal para o seu perfil.
              </p>
            </div>
          </div>
        </div>
          <SiteFooter />
        </div>
      </div>
    );
  }

  return (
    <div className={neuroPageShell}>
      <NeuroAmbientBackdrop />
      <div className="relative z-10">
        <NeuroWelcomeHero scheduleHref={whatsappScheduleLink} />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 pt-0">
          <div className="-mt-10 rounded-2xl border border-white/12 bg-white/97 p-8 shadow-2xl shadow-black/45 ring-1 ring-[#7c3aed]/10 backdrop-blur-sm sm:-mt-12 sm:p-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Próximos passos</h2>
              <p className="mt-4 text-sm text-gray-600 md:text-base">
                Obrigado por efetuar a compra! Em breve entraremos em contato para o agendamento.
              </p>
            </div>

            <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Dúvidas Frequentes: O Caminho para o seu Diagnóstico
              </h2>
              <p className="text-gray-600 mb-8">
                Respostas claras para você entender cada etapa do processo.
              </p>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details key={item.title} className="group rounded-xl bg-gray-100 p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-gray-900">
                      <span>{item.title}</span>
                      <svg
                        className="h-5 w-5 text-gray-400 transition-transform duration-200 group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <p className="mt-3 text-gray-600 leading-relaxed">{item.body}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <a
                href={whatsappScheduleLink}
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-semibold text-yellow-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(212,175,55,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              >
                <span className="absolute inset-0 rounded-md border border-yellow-400/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative">Agendar Avaliação</span>
              </a>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
