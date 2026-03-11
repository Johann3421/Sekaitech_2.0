import { PrismaClient, PCSlot } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const UNSPLASH_IMAGES: Record<string, string> = {
  'procesadores':    'photo-1591488320449-011701bb6704',
  'placas-madre':    'photo-1518770660439-4636190af475',
  'memorias-ram':    'photo-1562976540-1502c2145186',
  'tarjetas-graficas':'photo-1593640495253-23196b27a87f',
  'almacenamiento':  'photo-1587304862697-22bc6a6f3e41',
  'fuentes-de-poder':'photo-1601472544049-91d6c22dc68b',
  'cases':           'photo-1587202372634-32705e3bf49c',
  'refrigeracion':   'photo-1624705002806-5d72df19c3ad',
  'monitores':       'photo-1593642632559-0c6d3fc62b89',
  'perifericos':     'photo-1618384887929-16ec33fab9ef',
  'laptops':         'photo-1496181133206-80ce9b88a853',
};

function getCategoryImage(slug: string): string {
  const photoId = UNSPLASH_IMAGES[slug] ?? 'photo-1518770660439-4636190af475';
  return `https://images.unsplash.com/${photoId}?w=600&h=600&q=80&auto=format&fit=crop`;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── Global Settings ──
  await prisma.globalSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      exchangeRate: 3.75,
      storeName: 'Hyper-Logic',
      storeEmail: 'contacto@hyperlogic.pe',
      storePhone: '+51 999 999 999',
      storeAddress: 'Av. Wilson 123, Centro de Lima, Lima, Perú',
      storeMapUrl: 'https://maps.app.goo.gl/example',
      taxRate: 0.18,
      shippingFreeThreshold: 299.0,
    },
  });
  console.log('✅ GlobalSettings');

  // ── PSU Recommendations ──
  const psuRecs = [
    { minWatts: 0, maxWatts: 300, recommended: 450, tier: 'budget' },
    { minWatts: 301, maxWatts: 450, recommended: 550, tier: 'midrange' },
    { minWatts: 451, maxWatts: 600, recommended: 750, tier: 'performance' },
    { minWatts: 601, maxWatts: 800, recommended: 850, tier: 'highend' },
    { minWatts: 801, maxWatts: 1200, recommended: 1000, tier: 'extreme' },
  ];
  for (const rec of psuRecs) {
    await prisma.pSURecommendation.create({ data: rec });
  }
  console.log('✅ PSU Recommendations');

  // ── Users ──
  const adminPass = await bcrypt.hash('Admin123!', 12);
  const customerPass = await bcrypt.hash('Customer123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hyperlogic.pe' },
    update: {
      name: 'Admin HyperLogic',
      password: adminPass,
      role: 'ADMIN',
    },
    create: {
      name: 'Admin HyperLogic',
      email: 'admin@hyperlogic.pe',
      password: adminPass,
      role: 'ADMIN',
    },
  });

  const customers = [];
  for (const c of [
    { name: 'Carlos Mendoza', email: 'carlos@example.com' },
    { name: 'María García', email: 'maria@example.com' },
    { name: 'Luis Torres', email: 'luis@example.com' },
  ]) {
    const u = await prisma.user.upsert({
      where: { email: c.email },
      update: { name: c.name, password: customerPass, role: 'CUSTOMER' },
      create: { ...c, password: customerPass, role: 'CUSTOMER' },
    });
    customers.push(u);
  }
  console.log('✅ Users (1 Admin, 3 Customers)');

  // ── Categories ──
  const categoryData = [
    { name: 'Procesadores', slug: 'procesadores', icon: 'Cpu', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=480&h=480&q=80&auto=format&fit=crop', position: 1 },
    { name: 'Placas Madre', slug: 'placas-madre', icon: 'CircuitBoard', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=480&q=80&auto=format&fit=crop', position: 2 },
    { name: 'Memorias RAM', slug: 'memorias-ram', icon: 'MemoryStick', image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=480&h=480&q=80&auto=format&fit=crop', position: 3 },
    { name: 'Tarjetas Gráficas', slug: 'tarjetas-graficas', icon: 'Monitor', image: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=480&h=480&q=80&auto=format&fit=crop', position: 4 },
    { name: 'Almacenamiento', slug: 'almacenamiento', icon: 'HardDrive', image: 'https://images.unsplash.com/photo-1587304862697-22bc6a6f3e41?w=480&h=480&q=80&auto=format&fit=crop', position: 5 },
    { name: 'Fuentes de Poder', slug: 'fuentes-de-poder', icon: 'Zap', image: 'https://images.unsplash.com/photo-1601472544049-91d6c22dc68b?w=480&h=480&q=80&auto=format&fit=crop', position: 6 },
    { name: 'Cases', slug: 'cases', icon: 'Box', image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=480&h=480&q=80&auto=format&fit=crop', position: 7 },
    { name: 'Refrigeración', slug: 'refrigeracion', icon: 'Fan', image: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=480&h=480&q=80&auto=format&fit=crop', position: 8 },
    { name: 'Monitores', slug: 'monitores', icon: 'Monitor', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=480&h=480&q=80&auto=format&fit=crop', position: 9 },
    { name: 'Periféricos', slug: 'perifericos', icon: 'Keyboard', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=480&h=480&q=80&auto=format&fit=crop', position: 10 },
    { name: 'Laptops', slug: 'laptops', icon: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&q=80&auto=format&fit=crop', position: 11 },
  ];
  const categories: Record<string, any> = {};
  for (const cat of categoryData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, image: cat.image, position: cat.position },
      create: cat,
    });
  }
  console.log('✅ Categories (11)');

  // ── Brands ──
  const brandData = [
    { name: 'AMD', slug: 'amd', country: 'USA' },
    { name: 'Intel', slug: 'intel', country: 'USA' },
    { name: 'NVIDIA', slug: 'nvidia', country: 'USA' },
    { name: 'ASUS', slug: 'asus', country: 'Taiwan' },
    { name: 'MSI', slug: 'msi', country: 'Taiwan' },
    { name: 'Corsair', slug: 'corsair', country: 'USA' },
    { name: 'Kingston', slug: 'kingston', country: 'USA' },
    { name: 'Samsung', slug: 'samsung', country: 'South Korea' },
    { name: 'EVGA', slug: 'evga', country: 'USA' },
    { name: 'NZXT', slug: 'nzxt', country: 'USA' },
    { name: 'Cooler Master', slug: 'cooler-master', country: 'Taiwan' },
    { name: 'Gigabyte', slug: 'gigabyte', country: 'Taiwan' },
    { name: 'G.Skill', slug: 'gskill', country: 'Taiwan' },
    { name: 'Western Digital', slug: 'western-digital', country: 'USA' },
    { name: 'Logitech', slug: 'logitech', country: 'Switzerland' },
  ];
  const brands: Record<string, any> = {};
  for (const b of brandData) {
    brands[b.slug] = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, country: b.country },
      create: b,
    });
  }
  console.log('✅ Brands (15)');

  // ── Products ──
  const productSeed = [
    // CPUs
    {
      name: 'AMD Ryzen 9 7950X',
      slug: 'amd-ryzen-9-7950x',
      description: 'Procesador AMD Ryzen 9 7950X de 16 núcleos y 32 hilos, frecuencia base de 4.5 GHz y boost de 5.7 GHz. Arquitectura Zen 4, socket AM5, soporte DDR5 y PCIe 5.0.',
      priceUSD: 549.99,
      comparePriceUSD: 699.99,
      sku: 'CPU-R9-7950X',
      stock: 12,
      featured: true,
      categorySlug: 'procesadores',
      brandSlug: 'amd',
      specs: [
        { key: 'Núcleos', value: '16' },
        { key: 'Hilos', value: '32' },
        { key: 'Frecuencia Base', value: '4.5 GHz' },
        { key: 'Frecuencia Boost', value: '5.7 GHz' },
        { key: 'Socket', value: 'AM5' },
        { key: 'TDP', value: '170W' },
        { key: 'Arquitectura', value: 'Zen 4' },
      ],
      compatibility: { socket: 'AM5', tdpWatts: 170, memoryType: 'DDR5' },
    },
    {
      name: 'AMD Ryzen 7 7700X',
      slug: 'amd-ryzen-7-7700x',
      description: 'Procesador AMD Ryzen 7 7700X de 8 núcleos y 16 hilos. Socket AM5, DDR5, PCIe 5.0. Ideal para gaming y productividad.',
      priceUSD: 299.99,
      comparePriceUSD: 399.99,
      sku: 'CPU-R7-7700X',
      stock: 20,
      featured: true,
      categorySlug: 'procesadores',
      brandSlug: 'amd',
      specs: [
        { key: 'Núcleos', value: '8' },
        { key: 'Hilos', value: '16' },
        { key: 'Frecuencia Base', value: '4.5 GHz' },
        { key: 'Frecuencia Boost', value: '5.4 GHz' },
        { key: 'Socket', value: 'AM5' },
        { key: 'TDP', value: '105W' },
      ],
      compatibility: { socket: 'AM5', tdpWatts: 105, memoryType: 'DDR5' },
    },
    {
      name: 'Intel Core i9-14900K',
      slug: 'intel-core-i9-14900k',
      description: 'Procesador Intel Core i9-14900K, 24 núcleos (8P+16E), 32 hilos. Frecuencia boost hasta 6.0 GHz. Socket LGA1700, DDR5/DDR4.',
      priceUSD: 589.99,
      sku: 'CPU-I9-14900K',
      stock: 8,
      featured: true,
      categorySlug: 'procesadores',
      brandSlug: 'intel',
      specs: [
        { key: 'Núcleos', value: '24 (8P+16E)' },
        { key: 'Hilos', value: '32' },
        { key: 'Frecuencia Boost', value: '6.0 GHz' },
        { key: 'Socket', value: 'LGA1700' },
        { key: 'TDP', value: '125W' },
      ],
      compatibility: { socket: 'LGA1700', tdpWatts: 253, memoryType: 'DDR5' },
    },
    {
      name: 'Intel Core i5-14600K',
      slug: 'intel-core-i5-14600k',
      description: 'Procesador Intel Core i5-14600K de 14 núcleos (6P+8E). Ideal para gaming a 1440p. Socket LGA1700.',
      priceUSD: 319.99,
      sku: 'CPU-I5-14600K',
      stock: 15,
      categorySlug: 'procesadores',
      brandSlug: 'intel',
      specs: [
        { key: 'Núcleos', value: '14 (6P+8E)' },
        { key: 'Hilos', value: '20' },
        { key: 'Socket', value: 'LGA1700' },
        { key: 'TDP', value: '125W' },
      ],
      compatibility: { socket: 'LGA1700', tdpWatts: 181, memoryType: 'DDR5' },
    },
    // Motherboards
    {
      name: 'ASUS ROG Crosshair X670E Hero',
      slug: 'asus-rog-crosshair-x670e-hero',
      description: 'Placa madre ASUS ROG Crosshair X670E Hero para AMD AM5. Chipset X670E, DDR5, PCIe 5.0, WiFi 6E. Formato ATX.',
      priceUSD: 699.99,
      sku: 'MB-ASUS-X670E',
      stock: 6,
      featured: true,
      categorySlug: 'placas-madre',
      brandSlug: 'asus',
      specs: [
        { key: 'Socket', value: 'AM5' },
        { key: 'Chipset', value: 'X670E' },
        { key: 'Formato', value: 'ATX' },
        { key: 'Memoria', value: 'DDR5, 4 slots, hasta 128GB' },
        { key: 'WiFi', value: 'WiFi 6E' },
      ],
      compatibility: { socket: 'AM5', memoryType: 'DDR5', memorySlots: 4, maxMemoryGB: 128, formFactor: 'ATX', chipset: 'X670E' },
    },
    {
      name: 'MSI MAG B650 TOMAHAWK WIFI',
      slug: 'msi-mag-b650-tomahawk-wifi',
      description: 'Placa madre MSI MAG B650 TOMAHAWK WIFI, AMD AM5, DDR5, WiFi 6E, ATX. Excelente relación calidad-precio para Ryzen 7000.',
      priceUSD: 229.99,
      sku: 'MB-MSI-B650',
      stock: 18,
      categorySlug: 'placas-madre',
      brandSlug: 'msi',
      specs: [
        { key: 'Socket', value: 'AM5' },
        { key: 'Chipset', value: 'B650' },
        { key: 'Formato', value: 'ATX' },
        { key: 'Memoria', value: 'DDR5, 4 slots, hasta 128GB' },
      ],
      compatibility: { socket: 'AM5', memoryType: 'DDR5', memorySlots: 4, maxMemoryGB: 128, formFactor: 'ATX', chipset: 'B650' },
    },
    {
      name: 'Gigabyte Z790 AORUS Elite AX',
      slug: 'gigabyte-z790-aorus-elite-ax',
      description: 'Placa madre Gigabyte Z790 AORUS Elite AX para Intel LGA1700. DDR5, PCIe 5.0, WiFi 6E.',
      priceUSD: 289.99,
      sku: 'MB-GIG-Z790',
      stock: 10,
      categorySlug: 'placas-madre',
      brandSlug: 'gigabyte',
      specs: [
        { key: 'Socket', value: 'LGA1700' },
        { key: 'Chipset', value: 'Z790' },
        { key: 'Formato', value: 'ATX' },
        { key: 'Memoria', value: 'DDR5, 4 slots, hasta 128GB' },
      ],
      compatibility: { socket: 'LGA1700', memoryType: 'DDR5', memorySlots: 4, maxMemoryGB: 128, formFactor: 'ATX', chipset: 'Z790' },
    },
    // RAM
    {
      name: 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz',
      slug: 'corsair-vengeance-ddr5-32gb-6000',
      description: 'Kit de memoria Corsair Vengeance DDR5 32GB (2x16GB) a 6000MHz CL30. Optimizado para AMD EXPO e Intel XMP 3.0.',
      priceUSD: 109.99,
      sku: 'RAM-COR-DDR5-32',
      stock: 30,
      featured: true,
      categorySlug: 'memorias-ram',
      brandSlug: 'corsair',
      specs: [
        { key: 'Capacidad', value: '32GB (2x16GB)' },
        { key: 'Tipo', value: 'DDR5' },
        { key: 'Velocidad', value: '6000 MHz' },
        { key: 'Latencia', value: 'CL30' },
      ],
      compatibility: { ramType: 'DDR5', ramSpeedMHz: 6000, ramCapacityGB: 32 },
    },
    {
      name: 'G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6400MHz',
      slug: 'gskill-trident-z5-rgb-ddr5-32gb-6400',
      description: 'Kit de memoria G.Skill Trident Z5 RGB DDR5 32GB a 6400MHz. LEDs RGB direccionables, perfil bajo.',
      priceUSD: 139.99,
      sku: 'RAM-GSK-DDR5-32',
      stock: 14,
      categorySlug: 'memorias-ram',
      brandSlug: 'gskill',
      specs: [
        { key: 'Capacidad', value: '32GB (2x16GB)' },
        { key: 'Tipo', value: 'DDR5' },
        { key: 'Velocidad', value: '6400 MHz' },
        { key: 'Latencia', value: 'CL32' },
      ],
      compatibility: { ramType: 'DDR5', ramSpeedMHz: 6400, ramCapacityGB: 32 },
    },
    // GPUs
    {
      name: 'ASUS ROG Strix GeForce RTX 4090 OC',
      slug: 'asus-rog-strix-rtx-4090-oc',
      description: 'ASUS ROG Strix GeForce RTX 4090 OC Edition, 24GB GDDR6X. Rendimiento máximo para 4K gaming y creación de contenido.',
      priceUSD: 1999.99,
      comparePriceUSD: 2199.99,
      sku: 'GPU-ASUS-4090',
      stock: 3,
      featured: true,
      categorySlug: 'tarjetas-graficas',
      brandSlug: 'asus',
      specs: [
        { key: 'GPU', value: 'RTX 4090' },
        { key: 'VRAM', value: '24GB GDDR6X' },
        { key: 'TDP', value: '450W' },
        { key: 'Interfaz', value: 'PCIe 4.0 x16' },
        { key: 'Longitud', value: '358mm' },
      ],
      compatibility: { gpuTdpWatts: 450, pciInterface: 'PCIe 4.0 x16', gpuLengthMM: 358 },
    },
    {
      name: 'MSI GeForce RTX 4070 Ti SUPER Gaming X Slim',
      slug: 'msi-rtx-4070-ti-super-gaming-x',
      description: 'MSI GeForce RTX 4070 Ti SUPER 16GB GDDR6X. Excelente para gaming 1440p y 4K. DLSS 3.0.',
      priceUSD: 849.99,
      sku: 'GPU-MSI-4070TIS',
      stock: 9,
      featured: true,
      categorySlug: 'tarjetas-graficas',
      brandSlug: 'msi',
      specs: [
        { key: 'GPU', value: 'RTX 4070 Ti SUPER' },
        { key: 'VRAM', value: '16GB GDDR6X' },
        { key: 'TDP', value: '285W' },
        { key: 'Longitud', value: '308mm' },
      ],
      compatibility: { gpuTdpWatts: 285, pciInterface: 'PCIe 4.0 x16', gpuLengthMM: 308 },
    },
    {
      name: 'Gigabyte GeForce RTX 4060 Eagle OC',
      slug: 'gigabyte-rtx-4060-eagle-oc',
      description: 'Gigabyte GeForce RTX 4060 Eagle OC 8GB GDDR6. Ideal para gaming a 1080p con trazado de rayos y DLSS 3.0.',
      priceUSD: 299.99,
      sku: 'GPU-GIG-4060',
      stock: 22,
      categorySlug: 'tarjetas-graficas',
      brandSlug: 'gigabyte',
      specs: [
        { key: 'GPU', value: 'RTX 4060' },
        { key: 'VRAM', value: '8GB GDDR6' },
        { key: 'TDP', value: '115W' },
        { key: 'Longitud', value: '242mm' },
      ],
      compatibility: { gpuTdpWatts: 115, pciInterface: 'PCIe 4.0 x16', gpuLengthMM: 242 },
    },
    // Storage
    {
      name: 'Samsung 990 PRO 2TB NVMe M.2',
      slug: 'samsung-990-pro-2tb',
      description: 'SSD Samsung 990 PRO 2TB, M.2 NVMe PCIe Gen 4.0, lectura 7450 MB/s, escritura 6900 MB/s. Ideal para gaming y workstations.',
      priceUSD: 179.99,
      sku: 'SSD-SAM-990P-2T',
      stock: 25,
      featured: true,
      categorySlug: 'almacenamiento',
      brandSlug: 'samsung',
      specs: [
        { key: 'Capacidad', value: '2TB' },
        { key: 'Interfaz', value: 'M.2 NVMe PCIe 4.0' },
        { key: 'Lectura', value: '7450 MB/s' },
        { key: 'Escritura', value: '6900 MB/s' },
      ],
      compatibility: { storageInterface: 'M.2 NVMe', storageCapacityGB: 2000 },
    },
    {
      name: 'WD Black SN850X 1TB NVMe',
      slug: 'wd-black-sn850x-1tb',
      description: 'SSD Western Digital Black SN850X 1TB, M.2 NVMe PCIe Gen 4.0. Lectura hasta 7300 MB/s.',
      priceUSD: 89.99,
      sku: 'SSD-WD-SN850X-1T',
      stock: 18,
      categorySlug: 'almacenamiento',
      brandSlug: 'western-digital',
      specs: [
        { key: 'Capacidad', value: '1TB' },
        { key: 'Interfaz', value: 'M.2 NVMe PCIe 4.0' },
        { key: 'Lectura', value: '7300 MB/s' },
      ],
      compatibility: { storageInterface: 'M.2 NVMe', storageCapacityGB: 1000 },
    },
    // PSU
    {
      name: 'Corsair RM1000x 1000W 80+ Gold',
      slug: 'corsair-rm1000x-1000w',
      description: 'Fuente de poder Corsair RM1000x de 1000W, certificación 80+ Gold, completamente modular. Ventilador Zero RPM silencioso.',
      priceUSD: 189.99,
      sku: 'PSU-COR-RM1000X',
      stock: 10,
      categorySlug: 'fuentes-de-poder',
      brandSlug: 'corsair',
      specs: [
        { key: 'Potencia', value: '1000W' },
        { key: 'Certificación', value: '80+ Gold' },
        { key: 'Modular', value: 'Completamente modular' },
      ],
      compatibility: { psuWatts: 1000, psuEfficiency: '80+ Gold', psuFormFactor: 'ATX' },
    },
    {
      name: 'Corsair RM750x 750W 80+ Gold',
      slug: 'corsair-rm750x-750w',
      description: 'Fuente de poder Corsair RM750x de 750W, 80+ Gold, modular. Excelente para builds de gama media-alta.',
      priceUSD: 109.99,
      sku: 'PSU-COR-RM750X',
      stock: 20,
      categorySlug: 'fuentes-de-poder',
      brandSlug: 'corsair',
      specs: [
        { key: 'Potencia', value: '750W' },
        { key: 'Certificación', value: '80+ Gold' },
        { key: 'Modular', value: 'Completamente modular' },
      ],
      compatibility: { psuWatts: 750, psuEfficiency: '80+ Gold', psuFormFactor: 'ATX' },
    },
    // Cases
    {
      name: 'NZXT H7 Flow',
      slug: 'nzxt-h7-flow',
      description: 'Case NZXT H7 Flow, formato ATX. Excelente flujo de aire con panel frontal perforado. Soporte para radiadores hasta 360mm.',
      priceUSD: 129.99,
      sku: 'CASE-NZXT-H7F',
      stock: 12,
      categorySlug: 'cases',
      brandSlug: 'nzxt',
      specs: [
        { key: 'Formato', value: 'Mid-Tower ATX' },
        { key: 'GPU máx.', value: '400mm' },
        { key: 'Cooler máx.', value: '185mm' },
        { key: 'Radiador', value: '360mm frontal, 360mm superior' },
      ],
      compatibility: { caseFormFactor: 'ATX', caseMaxGPUMM: 400, caseMaxCoolerMM: 185 },
    },
    {
      name: 'Cooler Master MasterBox Q300L',
      slug: 'cooler-master-masterbox-q300l',
      description: 'Case Cooler Master MasterBox Q300L, formato Micro-ATX. Compacto con buen flujo de aire y diseño modular.',
      priceUSD: 49.99,
      sku: 'CASE-CM-Q300L',
      stock: 15,
      categorySlug: 'cases',
      brandSlug: 'cooler-master',
      specs: [
        { key: 'Formato', value: 'Micro-ATX' },
        { key: 'GPU máx.', value: '360mm' },
        { key: 'Cooler máx.', value: '157mm' },
      ],
      compatibility: { caseFormFactor: 'mATX', caseMaxGPUMM: 360, caseMaxCoolerMM: 157 },
    },
    // Coolers
    {
      name: 'Corsair iCUE H150i Elite Capellix XT',
      slug: 'corsair-icue-h150i-elite-capellix-xt',
      description: 'Sistema de refrigeración líquida Corsair iCUE H150i Elite Capellix XT, radiador de 360mm. Compatible con AM5, LGA1700.',
      priceUSD: 189.99,
      sku: 'COOL-COR-H150I',
      stock: 8,
      categorySlug: 'refrigeracion',
      brandSlug: 'corsair',
      specs: [
        { key: 'Tipo', value: 'AIO Liquid Cooling' },
        { key: 'Radiador', value: '360mm' },
        { key: 'Sockets', value: 'AM5, AM4, LGA1700, LGA1200' },
        { key: 'TDP soportado', value: '250W+' },
      ],
      compatibility: { coolerSocketsSupported: ['AM5', 'AM4', 'LGA1700', 'LGA1200'], coolerHeightMM: 30 },
    },
    {
      name: 'Cooler Master Hyper 212 Black Edition',
      slug: 'cooler-master-hyper-212-black',
      description: 'Disipador de aire Cooler Master Hyper 212 Black Edition. Compatible con AM5, AM4, LGA1700. Excelente relación calidad-precio.',
      priceUSD: 44.99,
      sku: 'COOL-CM-H212B',
      stock: 25,
      categorySlug: 'refrigeracion',
      brandSlug: 'cooler-master',
      specs: [
        { key: 'Tipo', value: 'Air Cooling' },
        { key: 'Ventilador', value: '120mm' },
        { key: 'Sockets', value: 'AM5, AM4, LGA1700, LGA1200' },
        { key: 'Altura', value: '158mm' },
      ],
      compatibility: { coolerSocketsSupported: ['AM5', 'AM4', 'LGA1700', 'LGA1200'], coolerHeightMM: 158 },
    },
    // Monitors
    {
      name: 'ASUS ROG Swift PG27AQN 27" 360Hz',
      slug: 'asus-rog-swift-pg27aqn-27',
      description: 'Monitor ASUS ROG Swift PG27AQN de 27 pulgadas, resolución 1440p, tasa de refresco 360Hz. Panel IPS, Nvidia G-Sync.',
      priceUSD: 999.99,
      sku: 'MON-ASUS-PG27AQN',
      stock: 4,
      categorySlug: 'monitores',
      brandSlug: 'asus',
      specs: [
        { key: 'Tamaño', value: '27"' },
        { key: 'Resolución', value: '2560x1440 (QHD)' },
        { key: 'Tasa de refresco', value: '360Hz' },
        { key: 'Panel', value: 'IPS' },
        { key: 'G-Sync', value: 'Sí' },
      ],
      compatibility: {},
    },
    {
      name: 'MSI MAG 274UPF 27" 4K 144Hz',
      slug: 'msi-mag-274upf-27-4k',
      description: 'Monitor MSI MAG 274UPF de 27 pulgadas, 4K UHD, 144Hz. Panel Rapid IPS, HDR 400, ideal para gaming y productividad.',
      priceUSD: 449.99,
      sku: 'MON-MSI-274UPF',
      stock: 7,
      categorySlug: 'monitores',
      brandSlug: 'msi',
      specs: [
        { key: 'Tamaño', value: '27"' },
        { key: 'Resolución', value: '3840x2160 (4K)' },
        { key: 'Tasa de refresco', value: '144Hz' },
        { key: 'Panel', value: 'Rapid IPS' },
      ],
      compatibility: {},
    },
    // Peripherals
    {
      name: 'Logitech G PRO X Superlight 2',
      slug: 'logitech-g-pro-x-superlight-2',
      description: 'Mouse gaming Logitech G PRO X Superlight 2, sensor HERO 2, peso 60g. Wireless con batería de 95h.',
      priceUSD: 159.99,
      sku: 'PER-LOG-GPXS2',
      stock: 20,
      categorySlug: 'perifericos',
      brandSlug: 'logitech',
      specs: [
        { key: 'Sensor', value: 'HERO 2 (32K DPI)' },
        { key: 'Peso', value: '60g' },
        { key: 'Batería', value: '95 horas' },
        { key: 'Conexión', value: 'Wireless (LIGHTSPEED)' },
      ],
      compatibility: {},
    },
    {
      name: 'Corsair K100 RGB Teclado Mecánico',
      slug: 'corsair-k100-rgb-mechanical',
      description: 'Teclado mecánico Corsair K100 RGB con switches OPX, iCUE control wheel, marco de aluminio. Full-size.',
      priceUSD: 229.99,
      sku: 'PER-COR-K100',
      stock: 10,
      categorySlug: 'perifericos',
      brandSlug: 'corsair',
      specs: [
        { key: 'Switches', value: 'Corsair OPX (ópticos)' },
        { key: 'Diseño', value: 'Full-size' },
        { key: 'Iluminación', value: 'RGB per-key' },
        { key: 'Marco', value: 'Aluminio' },
      ],
      compatibility: {},
    },
    // Additional products to reach 30
    {
      name: 'Kingston FURY Beast DDR5 16GB 5600MHz',
      slug: 'kingston-fury-beast-ddr5-16gb',
      description: 'Memoria RAM Kingston FURY Beast DDR5 16GB (1x16GB) a 5600MHz CL36. Perfil bajo, XMP 3.0.',
      priceUSD: 49.99,
      sku: 'RAM-KIN-DDR5-16',
      stock: 40,
      categorySlug: 'memorias-ram',
      brandSlug: 'kingston',
      specs: [
        { key: 'Capacidad', value: '16GB (1x16GB)' },
        { key: 'Tipo', value: 'DDR5' },
        { key: 'Velocidad', value: '5600 MHz' },
      ],
      compatibility: { ramType: 'DDR5', ramSpeedMHz: 5600, ramCapacityGB: 16 },
    },
    {
      name: 'Samsung 870 EVO 1TB SATA SSD',
      slug: 'samsung-870-evo-1tb',
      description: 'SSD Samsung 870 EVO 1TB, SATA III 2.5". Lectura 560MB/s, escritura 530MB/s. Ideal como almacenamiento secundario.',
      priceUSD: 69.99,
      sku: 'SSD-SAM-870-1T',
      stock: 35,
      categorySlug: 'almacenamiento',
      brandSlug: 'samsung',
      specs: [
        { key: 'Capacidad', value: '1TB' },
        { key: 'Interfaz', value: 'SATA III 2.5"' },
        { key: 'Lectura', value: '560 MB/s' },
      ],
      compatibility: { storageInterface: 'SATA', storageCapacityGB: 1000 },
    },
    {
      name: 'AMD Ryzen 5 7600X',
      slug: 'amd-ryzen-5-7600x',
      description: 'Procesador AMD Ryzen 5 7600X, 6 núcleos, 12 hilos. Socket AM5. El mejor procesador gama media para gaming.',
      priceUSD: 219.99,
      sku: 'CPU-R5-7600X',
      stock: 28,
      categorySlug: 'procesadores',
      brandSlug: 'amd',
      specs: [
        { key: 'Núcleos', value: '6' },
        { key: 'Hilos', value: '12' },
        { key: 'Socket', value: 'AM5' },
        { key: 'TDP', value: '105W' },
      ],
      compatibility: { socket: 'AM5', tdpWatts: 105, memoryType: 'DDR5' },
    },
    {
      name: 'EVGA SuperNOVA 850 G7 850W',
      slug: 'evga-supernova-850-g7',
      description: 'Fuente de poder EVGA SuperNOVA 850 G7, 850W, 80+ Gold, modular. 10 años de garantía.',
      priceUSD: 139.99,
      sku: 'PSU-EVGA-850G7',
      stock: 11,
      categorySlug: 'fuentes-de-poder',
      brandSlug: 'evga',
      specs: [
        { key: 'Potencia', value: '850W' },
        { key: 'Certificación', value: '80+ Gold' },
        { key: 'Modular', value: 'Completamente modular' },
      ],
      compatibility: { psuWatts: 850, psuEfficiency: '80+ Gold', psuFormFactor: 'ATX' },
    },
    {
      name: 'NZXT Kraken X63 RGB 280mm AIO',
      slug: 'nzxt-kraken-x63-rgb-280mm',
      description: 'Sistema de refrigeración líquida NZXT Kraken X63 RGB con radiador de 280mm. Pantalla LCD integrada.',
      priceUSD: 159.99,
      sku: 'COOL-NZXT-X63',
      stock: 6,
      categorySlug: 'refrigeracion',
      brandSlug: 'nzxt',
      specs: [
        { key: 'Tipo', value: 'AIO Liquid Cooling' },
        { key: 'Radiador', value: '280mm' },
        { key: 'Sockets', value: 'AM5, AM4, LGA1700' },
      ],
      compatibility: { coolerSocketsSupported: ['AM5', 'AM4', 'LGA1700'], coolerHeightMM: 30 },
    },
  ];

  for (const p of productSeed) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        priceUSD: p.priceUSD,
        comparePriceUSD: p.comparePriceUSD ?? undefined,
        sku: p.sku,
        stock: p.stock,
        featured: p.featured ?? false,
        published: true,
        condition: 'NEW',
        categoryId: categories[p.categorySlug].id,
        brandId: brands[p.brandSlug]?.id,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceUSD: p.priceUSD,
        comparePriceUSD: p.comparePriceUSD ?? undefined,
        sku: p.sku,
        stock: p.stock,
        featured: p.featured ?? false,
        published: true,
        condition: 'NEW',
        categoryId: categories[p.categorySlug].id,
        brandId: brands[p.brandSlug]?.id,
        images: {
          create: [
            {
              url: getCategoryImage(p.categorySlug),
              alt: p.name,
              position: 0,
            },
          ],
        },
        specs: {
          create: (p.specs || []).map((s, i) => ({
            key: s.key,
            value: s.value,
            position: i,
          })),
        },
        ...(Object.keys(p.compatibility || {}).length > 0
          ? {
              compatibility: {
                create: p.compatibility,
              },
            }
          : {}),
      },
    });
  }
  console.log(`✅ Products (${productSeed.length})`);

  // ── Banners ──
  await prisma.banner.createMany({
    data: [
      {
        type: 'HERO',
        title: 'RTX 4090 en Stock',
        subtitle: 'La GPU más potente del mercado. Envío gratis a todo el Perú.',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=600&q=80&auto=format&fit=crop',
        linkUrl: '/products/asus-rog-strix-rtx-4090-oc',
        linkText: 'Ver producto',
        active: true,
        position: 0,
      },
      {
        type: 'HERO',
        title: 'Ryzen 7000 Series',
        subtitle: 'La nueva generación de procesadores AMD. Más rendimiento, menos consumo.',
        imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1920&h=600&q=80&auto=format&fit=crop',
        linkUrl: '/category/procesadores',
        linkText: 'Explorar',
        active: true,
        position: 1,
      },
      {
        type: 'CENTER_MOBILE',
        title: 'Arma tu PC',
        subtitle: 'Usa nuestro PC Builder con sistema de compatibilidad automático',
        imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=400&q=80&auto=format&fit=crop',
        linkUrl: '/builder',
        linkText: 'Ir al Builder',
        active: true,
        position: 0,
      },
    ],
  });
  console.log('✅ Banners (3)');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('  Admin:    admin@hyperlogic.pe / Admin123!');
  console.log('  Customer: carlos@example.com / Customer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
