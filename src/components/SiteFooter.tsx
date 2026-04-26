export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-[#d4af37] mb-4">OASIS da Superdotação</h3>
            <p className="text-gray-400">
              Seu santuário digital para bem-estar mental e apoio psicológico.
            </p>
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
          <p>&copy; 2026 OASIS da Superdotação. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
