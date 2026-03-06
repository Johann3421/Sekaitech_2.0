import { prisma } from '@/lib/prisma';
import { ExchangeRateWidget } from '@/components/admin/ExchangeRateWidget';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { Settings, Globe, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  let settings = await prisma.globalSettings.findFirst();

  if (!settings) {
    settings = await prisma.globalSettings.create({
      data: {
        exchangeRate: 3.75,
        storeName: 'Hyper-Logic',
        storeEmail: 'contacto@hyperlogic.pe',
        storePhone: '+51 999 999 999',
        storeAddress: 'Lima, Perú',
      },
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-100 flex items-center gap-3">
          <Settings className="w-7 h-7 text-cyber-400" />
          Configuración
        </h1>
        <p className="text-ink-400 text-sm mt-1">
          Ajustes generales de la tienda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exchange Rate */}
        <ExchangeRateWidget
          currentRate={Number(settings.exchangeRate)}
          lastUpdated={settings.updatedAt.toISOString()}
        />

        {/* Store Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-cyber-400" />
            <h2 className="font-display text-lg font-semibold text-ink-100">
              Información de la tienda
            </h2>
          </div>
          <StoreSettingsForm
            initialValues={{
              storeName: settings.storeName || 'Hyper-Logic',
              storeAddress: settings.storeAddress || 'Lima, Perú',
              storeEmail: settings.storeEmail || 'contacto@hyperlogic.pe',
              storePhone: settings.storePhone || '+51 999 999 999',
              storeMapUrl: settings.storeMapUrl || '',
            }}
          />
        </div>

        {/* SEO Defaults */}
        <div className="bg-void-900/80 border border-void-700/50 rounded-xl p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyber-400" />
            Seguridad y acceso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-void-800/50 border border-void-700/30">
              <p className="text-ink-200 font-medium text-sm">NextAuth Provider</p>
              <p className="text-ink-400 text-xs mt-1">Credentials (Email + Password)</p>
            </div>
            <div className="p-4 rounded-lg bg-void-800/50 border border-void-700/30">
              <p className="text-ink-200 font-medium text-sm">Estrategia de sesión</p>
              <p className="text-ink-400 text-xs mt-1">JWT con refresh automático</p>
            </div>
            <div className="p-4 rounded-lg bg-void-800/50 border border-void-700/30">
              <p className="text-ink-200 font-medium text-sm">Hashing</p>
              <p className="text-ink-400 text-xs mt-1">bcrypt (12 salt rounds)</p>
            </div>
            <div className="p-4 rounded-lg bg-void-800/50 border border-void-700/30">
              <p className="text-ink-200 font-medium text-sm">Base de datos</p>
              <p className="text-ink-400 text-xs mt-1">PostgreSQL + Prisma ORM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
