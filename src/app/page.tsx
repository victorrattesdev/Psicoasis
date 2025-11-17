import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Menu */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">
                OASIS da Superdotação
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                  Início
                </Link>
                <Link href="/psicologos" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  OASIS da Psicologia
                </Link>
                <Link href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Avaliação Neuropsicológica
                </Link>
                <Link href="/blog" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Estudos do OASIS
                </Link>
                <Link href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Contato
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/registro" 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Registrar
              </Link>
            </div>
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-green-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Main Photo Section */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-lg">Imagem Principal</p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-200 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Text Block with Description */}
          <div className="order-1 lg:order-2">
            <div className="max-w-lg">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Bem-vindo ao{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  OASIS da Superdotação
                </span>
              </h1>
              
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Seu santuário digital para bem-estar mental e apoio psicológico. 
                  Descubra paz, cura e crescimento em um ambiente seguro e acolhedor.
                </p>
                
                <p>
                  Conecte-se com psicólogos licenciados e especializados, participe de 
                  sessões individuais ou em grupo, e tenha acesso a recursos de bem-estar 
                  desenvolvidos por especialistas.
                </p>
                
                <p>
                  Nossa plataforma oferece suporte 24/7, garantindo que você tenha acesso 
                  à ajuda quando mais precisar, com total confidencialidade e segurança.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/psicologos"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
                >
                  Encontrar Psicólogos
                </Link>
                <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                  Saiba Mais
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Psicólogos Licenciados</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
            <div className="text-gray-600">Pacientes Atendidos</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-600">Suporte Disponível</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">OASIS da Superdotação</h3>
              <p className="text-gray-400">
                Seu santuário digital para bem-estar mental e apoio psicológico.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Serviços</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Terapia Individual</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Sessões em Grupo</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Suporte de Crise</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Recursos de Bem-estar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Termos de Serviço</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Emergência</h4>
              <p className="text-gray-400 mb-2">
                Se você está em crise, ligue:
              </p>
              <p className="text-red-400 font-semibold">
                CVV: 188
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OASIS da Superdotação. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
