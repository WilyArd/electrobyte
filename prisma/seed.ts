import { PrismaClient, Category } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ElectroByte database...\n");

  // ─────────────────────────────────────────────
  // Create Admin User
  // ─────────────────────────────────────────────
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@electrobyte.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@electrobyte.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create Demo User
  const userPassword = await hash("user123", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@electrobyte.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@electrobyte.com",
      password: userPassword,
      role: "USER",
    },
  });
  console.log(`✅ Demo user created: ${demoUser.email}`);

  // ─────────────────────────────────────────────
  // Seed Products
  // ─────────────────────────────────────────────
  const products = [
    // LAPTOPS
    {
      name: "ProBook Ultra 16\" Gaming Laptop",
      description:
        "Unleash extreme gaming performance with the ProBook Ultra. Featuring an Intel Core i9-14900HX processor, NVIDIA RTX 4080 graphics, 32GB DDR5 RAM, and a blazing-fast 1TB NVMe SSD. The 16-inch QHD+ 240Hz display delivers buttery-smooth visuals with 100% DCI-P3 color accuracy.",
      price: 2499.99,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
      category: Category.LAPTOPS,
      stock: 15,
      featured: true,
      rating: 4.8,
    },
    {
      name: "SlimEdge Pro 14\" Ultrabook",
      description:
        "The ultimate thin-and-light for professionals. Powered by an Intel Core Ultra 7 155H, 16GB LPDDR5x, and 512GB SSD. The stunning 14-inch 2.8K OLED touch display in a featherweight 1.2kg chassis offers all-day 15-hour battery life.",
      price: 1299.99,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
      category: Category.LAPTOPS,
      stock: 25,
      featured: true,
      rating: 4.6,
    },
    {
      name: "WorkStation X17 Creator Laptop",
      description:
        "Built for content creators and engineers. Features Intel Xeon W processor, NVIDIA RTX 5000 Ada, 64GB ECC RAM, and dual 2TB NVMe SSDs. The 17.3-inch 4K mini-LED display is factory-calibrated for Delta E < 1 color accuracy.",
      price: 3899.99,
      image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
      category: Category.LAPTOPS,
      stock: 8,
      featured: false,
      rating: 4.9,
    },
    // DESKTOPS
    {
      name: "TitanForge RTX 4090 Gaming PC",
      description:
        "The ultimate gaming desktop. Custom-built with AMD Ryzen 9 7950X3D, NVIDIA GeForce RTX 4090 24GB, 64GB DDR5-6000, 2TB Gen5 NVMe SSD, and a 1200W Platinum PSU. RGB-illuminated tempered glass chassis with 360mm AIO liquid cooling.",
      price: 4299.99,
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
      category: Category.DESKTOPS,
      stock: 10,
      featured: true,
      rating: 4.9,
    },
    {
      name: "MiniCore Office Desktop",
      description:
        "Compact yet powerful mini PC for productivity. Intel Core i7-14700, 32GB DDR5, 1TB NVMe SSD, Intel UHD 770 Graphics. Ultra-small 1.5L form factor fits anywhere. Perfect for office setups with triple monitor support.",
      price: 899.99,
      image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80",
      category: Category.DESKTOPS,
      stock: 30,
      featured: false,
      rating: 4.4,
    },
    // PERIPHERALS
    {
      name: "MechStrike Pro TKL Mechanical Keyboard",
      description:
        "Premium tenkeyless mechanical keyboard with hot-swappable Cherry MX switches, per-key RGB lighting, aircraft-grade aluminum frame, PBT double-shot keycaps, USB-C with detachable cable, and customizable OLED display.",
      price: 179.99,
      image: "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800&q=80",
      category: Category.PERIPHERALS,
      stock: 50,
      featured: true,
      rating: 4.7,
    },
    {
      name: "OptiTrack Wireless Gaming Mouse",
      description:
        "Ultra-lightweight 58g wireless gaming mouse with 30K DPI optical sensor, 1ms polling rate, 80-hour battery life, and PTFE glide feet. Features 6 programmable buttons and on-the-fly DPI switching with RGB scroll wheel.",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80",
      category: Category.PERIPHERALS,
      stock: 75,
      featured: false,
      rating: 4.5,
    },
    {
      name: 'UltraView 32" 4K IPS Monitor',
      description:
        "Professional-grade 32-inch 4K UHD IPS monitor with 99% Adobe RGB, HDR600, 165Hz refresh rate, 1ms GtG response time, USB-C 90W PD, built-in KVM switch, and height-adjustable ergonomic stand with pivot.",
      price: 649.99,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
      category: Category.PERIPHERALS,
      stock: 20,
      featured: true,
      rating: 4.8,
    },
    // COMPONENTS
    {
      name: "NVIDIA GeForce RTX 4070 Ti Super 16GB",
      description:
        "High-performance graphics card featuring 16GB GDDR6X, Ada Lovelace architecture, DLSS 3.5 with Frame Generation, ray tracing cores, and a triple-fan cooling design. Ideal for 1440p and entry 4K gaming.",
      price: 799.99,
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
      category: Category.COMPONENTS,
      stock: 12,
      featured: true,
      rating: 4.7,
    },
    {
      name: "AMD Ryzen 9 7950X3D Processor",
      description:
        "The world's fastest gaming processor with 3D V-Cache technology. 16 cores, 32 threads, up to 5.7GHz boost clock, 144MB total cache. Zen 4 architecture with PCIe 5.0 and DDR5 support. Socket AM5.",
      price: 549.99,
      image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&q=80",
      category: Category.COMPONENTS,
      stock: 18,
      featured: false,
      rating: 4.9,
    },
    {
      name: "HyperX Fury 64GB DDR5-6000 RAM Kit",
      description:
        "High-performance DDR5 memory kit (2x32GB) running at 6000MT/s with CL30 low latency. Intel XMP 3.0 certified, anodized aluminum heat spreader with RGB lighting. Ideal for gaming and content creation builds.",
      price: 219.99,
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80",
      category: Category.COMPONENTS,
      stock: 40,
      featured: false,
      rating: 4.6,
    },
    // NETWORKING
    {
      name: "NetGuard AX6600 Tri-Band Wi-Fi 6E Router",
      description:
        "Enterprise-grade tri-band Wi-Fi 6E router delivering 6.6Gbps combined speeds across 2.4GHz, 5GHz, and 6GHz bands. Features a 2.0GHz quad-core processor, 8 high-gain antennas, WPA3 encryption, and VPN server.",
      price: 349.99,
      image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80",
      category: Category.NETWORKING,
      stock: 22,
      featured: false,
      rating: 4.5,
    },
    {
      name: "ProSwitch 24-Port Managed Gigabit Switch",
      description:
        "Rackmount 24-port managed Gigabit Ethernet switch with 4x 10G SFP+ uplinks. Features VLAN, QoS, LACP, SNMP, and web-based management. Fanless design for silent operation. Ideal for SMB networks.",
      price: 279.99,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
      category: Category.NETWORKING,
      stock: 15,
      featured: false,
      rating: 4.3,
    },
    // STORAGE
    {
      name: "Samsung 990 Pro 4TB NVMe SSD",
      description:
        "Blazing-fast PCIe Gen 4.0 x4 NVMe SSD with up to 7,450MB/s sequential read and 6,900MB/s write speeds. Samsung V-NAND and Intelligent TurboWrite technology with hardware AES 256-bit encryption.",
      price: 349.99,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80",
      category: Category.STORAGE,
      stock: 35,
      featured: true,
      rating: 4.8,
    },
    {
      name: "IronVault 20TB Enterprise NAS Drive",
      description:
        "Enterprise-class 20TB NAS hard drive designed for 24/7 multi-bay NAS environments. CMR recording, 7200 RPM, 256MB cache, 2.5M hours MTBF, and vibration resistance sensors. 5-year warranty.",
      price: 449.99,
      image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80",
      category: Category.STORAGE,
      stock: 20,
      featured: false,
      rating: 4.6,
    },
    // ACCESSORIES
    {
      name: "AuraFlex RGB LED Strip Kit (5m)",
      description:
        "Addressable ARGB LED strip kit with 5 meters of high-density LEDs, music sync mode, 16 million colors, remote control and app control. Compatible with ASUS Aura Sync, MSI Mystic Light, and Gigabyte RGB Fusion.",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      category: Category.ACCESSORIES,
      stock: 100,
      featured: false,
      rating: 4.2,
    },
    {
      name: "TechPad Pro XL Desk Mat (900x400mm)",
      description:
        "Extra-large premium desk mat with micro-weave cloth surface, anti-slip rubber base, stitched edges, and waterproof coating. Perfect for full keyboard and mouse coverage. Available in stealth black with subtle logo.",
      price: 34.99,
      image: "https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=800&q=80",
      category: Category.ACCESSORIES,
      stock: 60,
      featured: false,
      rating: 4.4,
    },
    {
      name: "ClearSound Pro Wireless Headset",
      description:
        "Premium wireless gaming headset with 50mm planar magnetic drivers, spatial audio, active noise cancellation, detachable boom mic with AI noise removal, 60-hour battery life, and Bluetooth 5.3 multipoint.",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      category: Category.ACCESSORIES,
      stock: 45,
      featured: true,
      rating: 4.7,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: {
        id: product.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 25),
      },
      update: product,
      create: {
        id: product.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 25),
        ...product,
      },
    });
    console.log(`  📦 ${created.name} — $${created.price}`);
  }

  console.log(`\n✅ Seeded ${products.length} products successfully!`);
  console.log("\n📋 Login Credentials:");
  console.log("  Admin: admin@electrobyte.com / admin123");
  console.log("  User:  user@electrobyte.com / user123\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
