import { prisma } from '@/lib/prisma';
import { BannerManager } from '@/components/banners/BannerManager';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { position: 'asc' },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink-100">
          Gestión de Banners
        </h1>
        <p className="text-ink-400 text-sm mt-1">
          Administra los banners del sitio: hero, centro y móvil
        </p>
      </div>

      <BannerManager banners={banners as any} />
    </div>
  );
}
