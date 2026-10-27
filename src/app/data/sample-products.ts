import { Product } from '../models/product';

type PcCategory = Product['category'];

interface ProductGroup {
  category: PcCategory;
  label: string;
  folder: string;
  names: string[];
  basePrice: number;
  priceStep: number;
  cpus: string[];
  gpus: string[];
  memory: string[];
  storage: string[];
  allPageImages: [string, string];
}

function pc(
  id: string,
  name: string,
  category: PcCategory,
  price: number,
  image: string,
  cpu: string,
  gpu: string,
  ram: string,
  storage: string,
  catalogImage?: string,
): Product {
  return {
    id,
    name,
    brand: 'PC Shoppe',
    category,
    price,
    originalPrice: Math.round(price * 1.1),
    rating: 4.6,
    reviewCount: 24,
    inStock: true,
    stockCount: 10,
    image: `assets/pc-store-images/${image}`,
    catalogImage: catalogImage ? `assets/pc-store-images/${catalogImage}` : undefined,
    summary: `${cpu}, ${ram}, ${storage}. Ready to use.`,
    description: `${name} is a ready-to-use ${category.toLowerCase()} with ${cpu}, ${gpu}, ${ram}, and ${storage}.`,
    specs: {
      cpu,
      gpu,
      ram,
      storage,
      motherboard: 'Compatible motherboard',
      psu: 'Included power supply',
      cooler: 'Standard air cooling',
      case: 'Desktop tower case',
      os: 'Windows 11 Home',
      warranty: '2 year warranty',
    },
    badge: 'READY TO SHIP',
    features: ['Ready to use', '2 year warranty', 'Inspected before shipping'],
  };
}

const groups: ProductGroup[] = [
  {
    category: 'Extreme Enthusiast', label: 'Extreme', folder: 'extreme-enthusiast',
    names: ['Apex Titan X', 'Quantum Forge', 'Nova Overlord', 'Helios Prime', 'Vortex Elite', 'Obsidian Core', 'Zenith Storm', 'Inferno Max', 'Aurora Ultra', 'Phantom One'],
    basePrice: 2499, priceStep: 350,
    cpus: ['AMD Ryzen 9 7900X', 'Intel Core i9', 'AMD Ryzen 9 7950X'],
    gpus: ['GeForce RTX 4080 Super', 'GeForce RTX 4090', 'GeForce RTX 5080'],
    memory: ['32GB DDR5', '64GB DDR5'], storage: ['2TB SSD', '4TB SSD'],
    allPageImages: ['all-pcs/01_extreme-enthusiast_Apex-Titan-X.svg', 'all-pcs/06_extreme-enthusiast_Quantum-Forge.svg'],
  },
  {
    category: 'Gaming PC', label: 'Gaming', folder: 'gaming-pc',
    names: ['Raptor G1', 'Viper RX', 'Blaze Pro', 'Frost Byte', 'Shadow Hunter', 'Nitro Strike', 'Cyber Wolf', 'Rogue Titan', 'Pixel Storm', 'Arctic Flame'],
    basePrice: 799, priceStep: 150,
    cpus: ['AMD Ryzen 5 5600', 'AMD Ryzen 5 7600', 'AMD Ryzen 7 7700'],
    gpus: ['GeForce RTX 4060', 'GeForce RTX 4060 Ti', 'GeForce RTX 4070'],
    memory: ['16GB DDR5', '32GB DDR5'], storage: ['1TB SSD', '2TB SSD'],
    allPageImages: ['all-pcs/02_gaming-pc_Raptor-G1.svg', 'all-pcs/07_gaming-pc_Viper-RX.svg'],
  },
  {
    category: 'Workstation', label: 'Workstation', folder: 'workstation',
    names: ['ProStation W1', 'Render Master', 'Studio Core', 'Archi Plus', 'DataForge D9', 'CAD Pro X', 'Creator Max', 'Sim Lab S2', 'Edit Station', 'Compute One'],
    basePrice: 1399, priceStep: 250,
    cpus: ['Intel Core i7', 'AMD Ryzen 7 7700', 'Intel Core i9'],
    gpus: ['GeForce RTX 4060', 'GeForce RTX 4070', 'GeForce RTX 4080'],
    memory: ['32GB DDR5', '64GB DDR5'], storage: ['1TB SSD', '2TB SSD'],
    allPageImages: ['all-pcs/03_workstation_ProStation-W1.svg', 'all-pcs/08_workstation_Render-Master.svg'],
  },
  {
    category: 'Mini PC', label: 'Mini', folder: 'mini-pc',
    names: ['Pocket M1', 'NanoBox N5', 'Cube C2', 'Micro Edge', 'Tiny Titan', 'Slim S3', 'Orbit Mini', 'Spark Z', 'Lite L7', 'Atom A1'],
    basePrice: 399, priceStep: 75,
    cpus: ['Intel Core i5', 'AMD Ryzen 5', 'Intel Core Ultra 5'],
    gpus: ['Intel Iris Xe', 'Radeon Graphics', 'Intel Arc Graphics'],
    memory: ['16GB DDR4', '16GB DDR5'], storage: ['512GB SSD', '1TB SSD'],
    allPageImages: ['all-pcs/04_mini-pc_Pocket-M1.svg', 'all-pcs/09_mini-pc_NanoBox-N5.svg'],
  },
  {
    category: 'Office & Home', label: 'Office', folder: 'office-home',
    names: ['HomeDesk H1', 'WorkMate W2', 'Family All-in-One', 'OfficePro O3', 'Student S1', 'Business B5', 'Cozy Home C2', 'Everyday E7', 'Clerk Basic B1', 'Smart Home AIO'],
    basePrice: 499, priceStep: 60,
    cpus: ['Intel Core i5', 'AMD Ryzen 5', 'Intel Core i7'],
    gpus: ['Intel UHD Graphics', 'Radeon Graphics', 'Intel Iris Xe'],
    memory: ['8GB DDR4', '16GB DDR4'], storage: ['512GB SSD', '1TB SSD'],
    allPageImages: ['all-pcs/05_office-home_HomeDesk-H1.svg', 'all-pcs/10_office-home_WorkMate-W2.svg'],
  },
];

export const SAMPLE_PRODUCTS: Product[] = groups.flatMap(group =>
  group.names.map((name, index) => {
    const variation = index + 1;
    const fileName = `${String(variation).padStart(2, '0')}_${name.replaceAll(' ', '-')}.svg`;
    const catalogImage = index < 2 ? group.allPageImages[index] : undefined;
    return pc(
      `${group.folder}-${String(variation).padStart(2, '0')}`,
      name,
      group.category,
      group.basePrice + index * group.priceStep,
      `${group.folder}/${fileName}`,
      group.cpus[index % group.cpus.length],
      group.gpus[index % group.gpus.length],
      group.memory[index % group.memory.length],
      group.storage[index % group.storage.length],
      catalogImage,
    );
  }),
);
