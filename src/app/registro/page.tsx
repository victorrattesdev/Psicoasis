import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Junte-se ao{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#c9a227]">
              OASIS da Superdotação
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha como você gostaria de se conectar com nossa plataforma de bem-estar mental
          </p>
        </div>

        {/* Registration Options */}
        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Patient Registration */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border-2 border-transparent hover:border-[#f2c94c]">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#fff4c1] rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sou Paciente</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Busco apoio psicológico e quero encontrar o profissional ideal para me ajudar em minha jornada de bem-estar mental.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#d4af37] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Acesso a psicólogos licenciados</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#d4af37] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Agendamento online fácil</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#d4af37] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Sessões presenciais e online</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#d4af37] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Suporte 24/7</span>
                </div>
              </div>

              <Link 
                href="/registro/paciente"
                className="w-full bg-[#d4af37] hover:bg-[#c9a227] text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl inline-block"
              >
                Registrar como Paciente
              </Link>
            </div>
          </div>

        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl p-8 shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Já tem uma conta?
            </h3>
            <p className="text-gray-600 mb-6">
              Faça login para acessar sua conta e continuar sua jornada de bem-estar mental.
            </p>
            <Link 
              href="/login"
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

