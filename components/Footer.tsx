// components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-primary font-bold text-lg mb-4">EnergyZone</h3>
            <p className="text-sm leading-relaxed">
              Din guide til energidrikke. Opdag nye favoritter, bedøm dine oplevelser og sammenlign smagsnuancer.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Hjem</Link></li>
              <li><Link href="/alle-produkter" className="hover:text-primary transition-colors">Alle Produkter</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>info@energyzone.dk</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span>
                <span>@energyzone</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          <p>&copy; 2026 EnergyZone. Alle rettigheder forbeholdes.</p>
        </div>
      </div>
    </footer>
  )
}