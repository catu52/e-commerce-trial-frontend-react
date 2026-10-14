import { Product, Review, CartItem } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prt-001',
    slug: 'architectural-boxy-wool-overshirt',
    code: 'PRT_001',
    title: '01 ARCHITECTURAL BOXY WOOL OVERSHIRT',
    category: 'OVERSHIRTS',
    subCategory: 'OVERSHIRTS // KNITWEAR',
    priceEUR: 260,
    specWeight: '480 GSM',
    substrate: 'BOILED MERINO WOOL',
    tag: 'NEW ARRIVAL',
    colorway: 'PITCH BLACK',
    colorHexList: ['#141414', '#d9d4cc', '#0055ff'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    stockLeft: 14,
    featured: true,
    badge: 'HEAVY 420GSM',
    sku: 'SKU-KFT-9402',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdP2C2qArZpFGAQJYTgkN_5J5D1sn5_gzJmZx99bAm6R5QkCsfaJr6fMiK0g4pvt3Qu5Au9I4eEW32w-FQf8UZm3gvab-eJInMaWHq321SWsdV41z9INdDys1FA5DdATVXwjzfLBRSFUn3V162ytxo4qdxfoQaGulb_GcmMJmnaosQ4otWxttkSnqVo3zEEONpzS55CM-2rSTGGMu8k93X-xoigkJhcUGgpUrNCN8JZTKhTEIi39No',
    galleryImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAB51_lyUx5CSwI1XtAzaQtu9hbLOB0p24Iyfks0j6rZ-EzTuo4cXSImpuG4Vz-mPYGHpLK5-jro1RF7EgWYqvmOcZgpELoNyg9_XClZZ7oDLSjJ_W75ZFoPTlxS04QhBxf3wBcArQSjFrspmXNF28fcVRR_mlQRAccmTbVi1ka5x1GmkVElQ5-IewkRc-TsTZEQ2jiNq1xlwh67R5AHg9ykmq1IunEWNaPVnEba1qA42Sw6ELvdGb_',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPSgHzyaLsdC6pfSYh3dX9gm2nVFYOXinJVWkzavrpr0f72zhceKWT1MHIuD7RojBRIHhrt__Be_KX6ZLNOxuUH7sqEwwkvBH7Tf5xkK9cnOeYYh-2R0OY-BHUdOqnexeOVjj7XL4E8XCSs4YaRGgnjn65xSglPO2XuGbcqO4AeARA5vqfhvYEC3mtNgsNwLjtUdl3n02tWNFZI8uDz3DOeLGxKRhpF-gB_A1iINkRgOYaIF6vz41I',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZKXgz6eKODtmtPvm-fi-pkxk5bGYnlDLG0R-a5RKDLTfSMVSaORmRID4B_yWtpM8iAwbEMl3L_VHnCS1LvQek0dNk7Ncndk22NankoGP_KyRzQ0AE0sOJ7xomHkEgNhGNLulryUPm1T5cXfpfQbNrOlJ-Sz-X54fT_36OiNPpyuXMpAnmWmgV_78YH4BQ0zooXMvyEOMFJ8eJO_4of7NBfps8ok-fPDQXArIU9LkJ5ThQk5isja2x',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwhgNYOFlgDvoaq0KO0GY2kf5-9u445l-_jdmpsfz_QKx233B2jRlnEoWBXXiNYb53DpyMykOIB2dj2WZU3DentBUQbI0-fkhDghaqIV7ZvucJN9YFi9GaHfYvHCLCn0IvMpOIMw-PlQDH5pYE_QVhgDD_nGcI0rTnKloqhk48FzH8peT0o2893H9bESTy0wibzqIE1WGkS5Vzlz_rv_4w-j8XEnI8b8sFgz9zO8Wa1KHDkaS4L-qF'
    ],
    description: '480 GSM virgin double-faced wool. Dense weave holds strict 90-degree shoulder volume without structural fusing. Features custom oxidized alloy buttons and clean dropped hem.',
    specs: {
      origin: 'Milled in Biella, Italy',
      weight: '480 GSM',
      composition: '100% GOTS Virgin Wool',
      care: 'Dry clean only / Perchloroethylene solvent'
    }
  },
  {
    id: 'prt-002',
    slug: 'bauhaus-pleated-pant',
    code: 'PRT_002',
    title: '02 BAUHAUS PLEATED PANT',
    category: 'TROUSERS',
    subCategory: 'TROUSERS // CARGOS',
    priceEUR: 195,
    specWeight: '340 GSM',
    substrate: 'HEAVY COMBED COTTON (380GSM)',
    tag: 'LIMITED ARCHIVE',
    colorway: 'CARBON BLACK',
    colorHexList: ['#1a1a1a', '#3d443b'],
    sizes: ['28', '30', '32', '34', '36'],
    inStock: true,
    stockLeft: 8,
    badge: 'DOUBLE TWILL',
    sku: 'SKU-KFT-TR-301',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOsEbdbdfrqByiCtJlq0cmVGzKbRhRvhQwpqgGgR9sNfv0aks0wh9hvLwBPCZyk2FJ4d9VOVJgxrLgb1d4dEIL2TjE1eV50E53LvekvfnNE0rtQrDX2LuL_5FDUEmo1l-2qA0XdevFKFGoF-zdk8-2zZwkp376YkcShWKGrHZIkpWSRwyx6rRm5naPhiX9XsLQkVc6V6xqSWuso0g1W9ybECVaHZ_1BCJXt-6r2dacRqAFaXdfqTLO',
    description: 'High-density Japanese double twill cotton with architectural deep front knife pleats, tapered ankle cuffs, and reinforced bar-tacked belt loops.',
    specs: {
      origin: 'Okayama, Japan',
      weight: '340 GSM',
      composition: '100% Combed Cotton Twill',
      care: 'Cold hand wash or dry clean'
    }
  },
  {
    id: 'prt-003',
    slug: 'raw-edge-denim-blouson',
    code: 'PRT_003',
    title: '03 RAW EDGE DENIM BLOUSON',
    category: 'OUTERWEAR',
    subCategory: 'OUTERWEAR // JACKETS',
    priceEUR: 280,
    specWeight: '14.5 OZ',
    substrate: 'RAW SELVEDGE DENIM (14OZ)',
    tag: 'CORE CLASSIC',
    colorway: 'DEEP INDIGO',
    colorHexList: ['#1d263b', '#1a1a1a'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    stockLeft: 6,
    badge: '14.5 OZ SELVEDGE',
    sku: 'SKU-KFT-JKT-11',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPxawCDNwcHTeMkMx-XLExPoFjVpqwFRrqcdFC8ftSnEwVdzq6LUHr4damu2YeZdUcz_ahXbbMcog-uAGZkEk4HzTEos0CjrujICAfs9tvxyCg6fP0qRdXGh3q0P24X2m9tCoDE_4NyTE6OIzjRUxVghwRKdONPtIiHt23HqnOHlycEzUOAWnY3oDZyD7VnickWUyZYEUWxSBUdlCffBdlUtWo6jpGBqTMyglUZn-vWgNu00plbF5R',
    description: 'Constructed from unsanforized 14.5oz Japanese red-line selvedge denim. Boxy architectural cut featuring exposed copper hardware, raw lapel hem, and dual deep chest slots.',
    specs: {
      origin: 'Kojima, Japan',
      weight: '14.5 OZ',
      composition: '100% Selvedge Indigo Denim',
      care: 'Raw wear 6 months before first soak'
    }
  },
  {
    id: 'prt-004',
    slug: 'modular-technical-parka',
    code: 'PRT_004',
    title: '04 MODULAR TECHNICAL PARKA',
    category: 'OUTERWEAR',
    subCategory: 'OUTERWEAR // TECHNICAL',
    priceEUR: 360,
    specWeight: '520 GSM',
    substrate: 'RIPSTOP NYLON 6.6',
    tag: 'MODULAR SYSTEM',
    colorway: 'FOREST OLIVE',
    colorHexList: ['#3d443b', '#1a1a1a'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    stockLeft: 4,
    badge: '3-IN-1 IPX-6',
    sku: 'SKU-KFT-TR-04',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRPe6vz8GB0oDj0iL8WS5dBzNY0J7x2RvUJAyBmJBmsR0aIMHJRjZ0pL1NNfd5qufMs4cu0HswOhTRmd_0Djv9xUPQENU35Hfwlkjq1RWdWBlGRHHLmaF5TBp3DYennINJ1r_rPpEs6uw5vLWDnz8EEZCvQBOXQj-quaqOYM5ttzYKSNeApqRAl_-6IfRcJGzAFnr9SNMGuAFwPxf1LxzqwW82nj4kD2ZZIMC99G9dn7GHILRLvpWz',
    description: 'Triple-layer laminated ripstop nylon with fully welded IPX-6 seam tape. Detachable chest utility harness and concealed storm hood.',
    specs: {
      origin: 'Osaka, Japan',
      weight: '520 GSM',
      composition: '100% Cordura Nylon 6.6 3L',
      care: 'Wipe clean / DWR spray refresh'
    }
  },
  {
    id: 'prt-005',
    slug: 'heavy-rigid-waffle-knit',
    code: 'PRT_005',
    title: '05 HEAVY RIGID WAFFLE KNIT',
    category: 'KNITWEAR',
    subCategory: 'KNITWEAR // TOPS',
    priceEUR: 175,
    specWeight: '580 GSM',
    substrate: 'HEAVY COMBED COTTON (380GSM)',
    tag: 'NEW',
    colorway: 'RAW ECRU',
    colorHexList: ['#f5f0e8', '#1a1a1a'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    stockLeft: 12,
    badge: 'UNBLEACHED',
    sku: 'SKU-KFT-KN-05',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-SbiR-QeWKx_MzrAerYCcCJd1p4PGCxfSP-CuV5N985MVPywRPGhAOLxkwqgyT62KJUm8txdWcCp04Gl8VFXE0oWUMefFMVNQlndsGKWhmxsY7S21quePyNgbRhqdIvEAd_P7FbymKc7GCNOjuowhBOPXrFh_JEB8P6_g4M8YsAptv4o9jWcP7bFIVbOcOsRdKruKpn2v5Spu4zBYEEntSLN9NWUcISZgnDHmF9ijVM4hM2_C7xfQ',
    description: 'Heavyweight thermal waffle knit constructed from unbleached organic cotton yarns. Geometric drop shoulder block with raw edge cuffs.',
    specs: {
      origin: 'Porto, Portugal',
      weight: '580 GSM',
      composition: '100% Organic Unbleached Cotton',
      care: 'Machine wash cold delicate'
    }
  },
  {
    id: 'prt-006',
    slug: 'hardware-utility-gilet',
    code: 'PRT_006',
    title: '06 HARDWARE UTILITY GILET',
    category: 'HARDWARE',
    subCategory: 'HARDWARE & OBJECTS',
    priceEUR: 210,
    specWeight: '460 GSM',
    substrate: 'RIPSTOP NYLON 6.6',
    tag: 'RESTOCKED',
    colorway: 'KLEIN BLUE',
    colorHexList: ['#0055ff', '#1a1a1a'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    stockLeft: 5,
    badge: 'BALLISTIC',
    sku: 'SKU-KFT-ACC-06',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByNigztDeKsHDdbYrflOE3CSSvOKOOZsK7F-uYvtDQvIOD6sltUI5i-_zx1h0iCM9bN6y274dInYv8Z_14HgJ3Vvt9zwV_vNO9n-NV5erdrg8p3kvK3mMH_f18aPS4E6tEokeLPC9Ee4eA6452FUGtv9KB0lx8m0of6zOOBuQMGhbJ8RxZtSmyjZHmDXQQ6QdDgXyKSO8A5WKMN2CcnrpKk5dQ7guDY7tjL5uFBgb19A_VWBCNsthZ',
    description: 'Tactical zip flight vest crafted from high-tenacity ballistic nylon. Equipped with dual cargo bellow compartments and FIDLOCK magnetic quick releases.',
    specs: {
      origin: 'Berlin Lab, Germany',
      weight: '460 GSM',
      composition: '1000D Ballistic Cordura',
      care: 'Spot clean only'
    }
  },
  {
    id: 'prt-007',
    slug: 'tactical-wool-bomber-01',
    code: 'ED_01',
    title: 'TACTICAL WOOL BOMBER 01',
    category: 'OUTERWEAR',
    subCategory: 'OUTERWEAR • CHARCOAL / YELLOW',
    priceEUR: 340,
    specWeight: '520 GSM',
    substrate: 'BOILED MERINO WOOL',
    tag: 'HOT ISSUE',
    colorway: 'CHARCOAL',
    colorHexList: ['#1a1a1a', '#ffcc00'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    stockLeft: 4,
    badge: 'ED_01',
    sku: 'SKU-KFT-BMB-01',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7pow_ORV4CLzYjQJdQZS3yXTA7cgRucqHdqJc3Ut6mU3YaedqofwKwBMV6UW5BF1yw5sybNV7GwNeWzEBshAkeJHAUbqBF3mrUlgNNA-0D8qP-qNT3Lrs1nJzpaigvvpa66DGU0TFp2P_M_QSkzmwAX-qeCcmMoj9zje2WqHpXMVkxfawFqJITkuZJVt_hEQAIKi1b-UNKuhRy6ICEDLhojsE91gZu0ho6KIRHnNsjfZ7tDX0z6aM',
    description: 'Heavyweight virgin boiled wool bomber with contrast neon industrial pull tags and matte silver dual sliders.',
    specs: {
      origin: 'Biella, Italy',
      weight: '520 GSM',
      composition: '100% Boiled Wool',
      care: 'Dry clean only'
    }
  },
  {
    id: 'prt-008',
    slug: 'articulated-cargo-pant',
    code: 'ED_02',
    title: 'ARTICULATED CARGO PANT',
    category: 'TROUSERS',
    subCategory: 'BOTTOMS • OLIVE DRAB',
    priceEUR: 220,
    specWeight: '380 GSM',
    substrate: 'HEAVY COMBED COTTON (380GSM)',
    tag: 'NEW CUT',
    colorway: 'OLIVE DRAB',
    colorHexList: ['#3d443b', '#1a1a1a'],
    sizes: ['28', '30', '32', '34'],
    inStock: true,
    stockLeft: 10,
    badge: 'ED_02',
    sku: 'SKU-KFT-CAR-02',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoySP4aL1bcnmu0LnYRNEWAaHWhvT1YukHhMy4q8Hzf4ffdy4tqVO2FtCo1vB7mDcXaB7XAZ9zt_xeb_GqZI4f-ub_SuWGLuvNZrNx-Hb-PUEZXRvBBSizf4qSykilUE8aDeRbVWo19fmhi6yUsxuigJ7LuTfrbwA2Xth5cKROXy4iXysSEl2JhOXfjsnL15lO4tHBKrtGSvIk7r5kot9rP-0NEIuO7cfuNJkyGDKJMH6PCFiQsBaq',
    description: 'Ergonomically pre-bent knee darting with 3D expandable bellows pockets and adjustable webbed ankle cinch straps.',
    specs: {
      origin: 'Okayama, Japan',
      weight: '380 GSM',
      composition: '100% Military Canvas Cotton',
      care: 'Machine wash 30C'
    }
  },
  {
    id: 'prt-009',
    slug: 'bauhaus-mock-neck-knit',
    code: 'ED_03',
    title: 'BAUHAUS MOCK-NECK KNIT',
    category: 'KNITWEAR',
    subCategory: 'KNITWEAR • COBALT / CHALK',
    priceEUR: 195,
    specWeight: '450 GSM',
    substrate: 'BOILED MERINO WOOL',
    tag: 'ARCHIVE 88',
    colorway: 'COBALT / CHALK',
    colorHexList: ['#0055ff', '#f5f0e8'],
    sizes: ['M', 'L', 'XL'],
    inStock: true,
    stockLeft: 2,
    badge: 'ED_03',
    sku: 'SKU-KFT-KN-03',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjS2p3mm-N7ED3d233UeCTxXL587AOErNpShYv85Wv9jUvx0LWjLD-kl9JIdRE0kgQm0wjFsxVMMKHrCAR-Mgd46frTh99gEUlteXpIvY8KqAGIbpzdytAvtT_KPfQPBYWqvgUQDwD3LmvLAkWEMCLTDCBe7XCyjj-goRL_oGXqjrlAE6l-WRA1QsDEPtWxaDvr-reSj4SJJGeOypQUDhsBgEugPEX_qYYFLtl2uhxWbnQ_EfAtGfq',
    description: 'Geometric split-block pattern inspired by 1923 Weimar exhibits. Architectural rib knit collar maintains height without drooping.',
    specs: {
      origin: 'Munich, Germany',
      weight: '450 GSM',
      composition: '100% Merino Wool',
      care: 'Hand wash cold'
    }
  },
  {
    id: 'prt-010',
    slug: 'rigid-chest-rig-bag',
    code: 'ED_04',
    title: 'RIGID CHEST RIG BAG',
    category: 'HARDWARE',
    subCategory: 'EQUIPMENT • 1000D CORDURA',
    priceEUR: 145,
    specWeight: '320 GSM',
    substrate: 'RIPSTOP NYLON 6.6',
    tag: 'OBJECT LAB',
    colorway: 'MATTE BLACK',
    colorHexList: ['#1a1a1a', '#ffcc00'],
    sizes: ['MODULAR ADJUSTABLE'],
    inStock: true,
    stockLeft: 15,
    badge: 'ED_04',
    sku: 'SKU-KFT-BG-04',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoz08wwUEB-K5NO84kPV8OiOLir8yOpKNytWUyx1NHGN29Ar8bC0N2Uv0BnSeFxB2-66KKYiaq2aEyvMGiiWvnRcZ9DxLHGvuGDe9Gm7MAdsUpkCe0yu-YErDg7y4DK2B9ztzTcRc8HJNdRkHRZ6xbwJwedeSVfT-nc-FZVNxsLITqsbbbuqtpnp_bILIgNgpYDY9mvTmY5ZHiW5Eojh24pdlLCiNFu879dbhEueGYBEFAuRI5jDGM',
    description: 'Tactical chest harness pack with reinforced foam front cell, water-repellent AquaGuard zips, and aluminum carabiner clip loops.',
    specs: {
      origin: 'Tokyo Lab, Japan',
      weight: '320 GSM',
      composition: '1000D Invista Cordura',
      care: 'Wipe clean'
    }
  },
  {
    id: 'prt-011',
    slug: 'kraft-modular-chore-jacket',
    code: 'CHORE_09',
    title: 'KRAFT MODULAR CHORE JACKET',
    category: 'OUTERWEAR',
    subCategory: 'RAW ECRU // 450GSM JAPANESE DENIM',
    priceEUR: 320,
    specWeight: '450 GSM',
    substrate: 'RAW SELVEDGE DENIM (14OZ)',
    tag: 'ARCHIVE SPEC',
    colorway: 'RAW ECRU',
    colorHexList: ['#f5f0e8', '#1a1a1a'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    stockLeft: 3,
    badge: 'BATCH #09-BLN',
    sku: 'SKU-KFT-CHR-09',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPt0YC2h6-FzgxuykVuI98Itvlvs3bNUztpDNov-ZGHjWwrQRzkrQDD7s_NEGOQdBCz0qy1S63f-YBkLJTKVoND3x0eD03l-DL2usuaCcv2I0Lz3SAyqT8vt6-U0yYnHjhb8w9cM5JE7Uu59LZTYeSrZ8TtTL5wwxUlXaJPnneSnpl4BN8aZIJO-uE-elWdAVVXqFVwyRDB_x2LjEheu8NLg2UAzKXrtaMksRwD34s4UErvKlGqzBr',
    description: 'Structured heavyweight chore coat in unbleached Japanese raw ecru denim with oversized tool pockets and industrial gunmetal hardware.',
    specs: {
      origin: 'Kojima, Japan',
      weight: '450 GSM',
      composition: '100% Selvedge Unbleached Denim',
      care: 'Dry clean recommended'
    }
  },
  {
    id: 'prt-012',
    slug: 'solid-925-architect-signet-ring',
    code: 'ACC_99',
    title: 'SOLID 925 ARCHITECT SIGNET RING',
    category: 'HARDWARE',
    subCategory: 'OBJECT // PRECIOUS METAL',
    priceEUR: 140,
    specWeight: '24 GRAMS',
    substrate: '925 STERLING SILVER',
    tag: 'PRECIOUS METAL',
    colorway: 'OXIDIZED SILVER',
    colorHexList: ['#d0cbc3'],
    sizes: ['58', '60', '62', '64'],
    inStock: true,
    stockLeft: 7,
    sku: 'SKU-KFT-ACC-99',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtUQ1Ltkn_889Spm3kdBbyfcYE0J6AKZhZ5NwNeIs8nErlPeZZbkawzSXhRBiZiSULyHXYBu3LMCM9qj6KrNAf-oJA5fptsEwDg53YWnR3iyb_JtIav4h37eND-j-PPEIs3PSJrTfn0WcJxJ1ZW7hRKVuch0LkpuoRxMdiumzyz_J9pVnGjQW6OnVi4sguhGHKtxWFzDQ7fa64mO4OtpRMHzZ7lTgBEo60-bPuLVauU-4nOBYv_Rch',
    description: 'Cast in solid 925 sterling silver with brutalist stepped bevel edge and micro-laser engraved serial designation.',
    specs: {
      origin: 'Pforzheim, Germany',
      weight: '24 Grams',
      composition: 'Solid 925 Sterling Silver',
      care: 'Polish with included micro-fiber cloth'
    }
  },
  {
    id: 'prt-013',
    slug: 'heavy-mockneck-cotton-tee',
    code: 'MCK_11',
    title: 'HEAVY MOCKNECK COTTON TEE',
    category: 'OVERSHIRTS',
    subCategory: 'BASE LAYER // MERCERIZED',
    priceEUR: 95,
    specWeight: '320 GSM',
    substrate: 'HEAVY COMBED COTTON (380GSM)',
    tag: 'ESSENTIAL',
    colorway: 'CHALK WHITE',
    colorHexList: ['#f5f0e8', '#1a1a1a'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    stockLeft: 20,
    sku: 'SKU-KFT-MCK-11',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT-cYkudZC9suBH05CZOxeESEJxYmMiIwJWt9Qq3vhPJ68nejhwmunNcVIRWq1nniDh8AJFO1JkllMwsqjBWuag6omwyTwOTh8N7vvafe2jhZclN9fkaRJ-I_FGbL23-PAke9uRyE_LW7TGn8iYx9aN3d-PdkWOYUVexL-joJpwNlEchupBdxXrZOQJbZWqFVyVlptb8BTjG-NojEpaq_30DV7keEGVNB4TBXqfAtcT9Gwhy54syPN',
    description: '320 GSM heavy combed cotton jersey with mercerized sheen, drop shoulder seams, and dense ribbed mock-neck collar.',
    specs: {
      origin: 'Porto, Portugal',
      weight: '320 GSM',
      composition: '100% Mercerized Cotton',
      care: 'Cold wash'
    }
  },
  {
    id: 'prt-014',
    slug: 'square-toe-lug-derby',
    code: 'FT_08',
    title: 'SQUARE-TOE LUG DERBY',
    category: 'HARDWARE',
    subCategory: 'FOOTWEAR // LEATHER',
    priceEUR: 380,
    specWeight: '1200 GRAMS',
    substrate: 'BOX CALF LEATHER',
    tag: 'ATELIER RUN',
    colorway: 'PITCH BLACK',
    colorHexList: ['#1a1a1a'],
    sizes: ['40', '41', '42', '43', '44', '45'],
    inStock: true,
    stockLeft: 4,
    sku: 'SKU-KFT-FT-08',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFpcYNzdskc5I9jGO_Yz_CkUWkuJiQu01RiBdUSakhcVSWA2N8vki9MQYqFJQpnINo7e3Tgm2ZB5_MTBVY7PUFU3TmScMdI4JGJNDHLDMutIqXonfRKGyK0oOnr7mBWJhe6vrVZqlMU1epJ3hhYt0F5ZSNc6LgmYI0H_wLdbyIb1IeLu66qT1RBa5ODtJayRVq8QrVL-igSejrnZgWkguB1IokjDkETcoF6S-MuTj6LbuyCEFGw7jY',
    description: 'Architectural chisel-toe derby in full-grain French box calf leather mounted on aggressive Vibram commando lug soles.',
    specs: {
      origin: 'Civitanova Marche, Italy',
      weight: '1200 Grams Pair',
      composition: '100% French Calfskin & Vibram Rubber',
      care: 'Clean with natural beeswax balm'
    }
  }
];

export const INITIAL_CART: CartItem[] = [
  {
    id: 'cart-item-1',
    productId: 'prt-001',
    title: '01 ARCHITECTURAL BOXY WOOL OVERSHIRT',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdP2C2qArZpFGAQJYTgkN_5J5D1sn5_gzJmZx99bAm6R5QkCsfaJr6fMiK0g4pvt3Qu5Au9I4eEW32w-FQf8UZm3gvab-eJInMaWHq321SWsdV41z9INdDys1FA5DdATVXwjzfLBRSFUn3V162ytxo4qdxfoQaGulb_GcmMJmnaosQ4otWxttkSnqVo3zEEONpzS55CM-2rSTGGMu8k93X-xoigkJhcUGgpUrNCN8JZTKhTEIi39No',
    priceEUR: 260,
    sku: 'SKU-KFT-9402',
    size: 'L',
    color: 'PITCH BLACK',
    quantity: 1
  },
  {
    id: 'cart-item-2',
    productId: 'prt-003',
    title: '03 RAW EDGE DENIM BLOUSON',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPxawCDNwcHTeMkMx-XLExPoFjVpqwFRrqcdFC8ftSnEwVdzq6LUHr4damu2YeZdUcz_ahXbbMcog-uAGZkEk4HzTEos0CjrujICAfs9tvxyCg6fP0qRdXGh3q0P24X2m9tCoDE_4NyTE6OIzjRUxVghwRKdONPtIiHt23HqnOHlycEzUOAWnY3oDZyD7VnickWUyZYEUWxSBUdlCffBdlUtWo6jpGBqTMyglUZn-vWgNu00plbF5R',
    priceEUR: 280,
    sku: 'SKU-KFT-JKT-11',
    size: 'M',
    color: 'DEEP INDIGO',
    quantity: 1
  }
];

export const INITIAL_CART_ITEMS = INITIAL_CART;

export const PRODUCT_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    author: 'MARCEL K.',
    avatarInitials: 'MK',
    verified: true,
    sizeOrdered: 'L',
    colorOrdered: 'PITCH BLACK',
    measurements: '185CM / 78KG',
    stars: 5,
    date: 'OCT 14, 2024',
    headline: '"THE SHOULDER CUT IS PURE BRUTALIST ARCHITECTURE"',
    text: 'I was hesitant about the 480 GSM wool being too stiff, but it falls with an incredible structural boxiness. The front buttons feel like heavy industrial hardware. Paired it with wide wool trousers in Stockholm this week and blocked wind down to 3°C easily.',
    fitVerdict: 'TRUE TO BOXY DESIGN',
    helpfulCount: 42,
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbfhuMsW32oP8zghZL2tiTruAx9g62Yf5JBzNlrdbeHMnqPyeZnmDdxt_1e0-DnApY4Gl0C0McIyWkGGySn5ReBahpZmX-NZXPyI9eUli6HoOBbbg45MJBCeHs62hO_SrSPIu2S65v0rcvGRIyu9NtAc4gFzngWCWI4LvAShEaDiQQAuAKI1W6TMSupqcy184ZrfzSXBg2h_9HBP1F_CsoofGJrh6oOY2MkG4jsIqr2UXrg1m4Ly_f',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCFIeIcpYyQRAzqzOxMESDFZILAZUxvAw5-qAaSmOi55WH2mBWQl33H37ROXsTfNV4pHZaex8qccVEEOENBOlSKRCLC5KxlFmbkkPpkD7TXZq7llRH4z0p-1tcmZdI3yZZ6yP2VuL2Jdin-YamormTquwgc9f_8QQ7z8VGkcGRHBKdjQjmX8ZlHfrI1lKosr9Gm8SxaVCJcWIAd6hi_T7s6DWaXXoeSnOrKowMsTRY_UpN4v1dtmWS1'
    ]
  },
  {
    id: 'rev-02',
    author: 'ELENA L.',
    avatarInitials: 'EL',
    verified: true,
    sizeOrdered: 'S',
    colorOrdered: 'RAW CHALK',
    measurements: '174CM',
    stars: 5,
    date: 'SEP 29, 2024',
    headline: '"EXQUISITE DRAPE IN RAW CHALK"',
    text: 'Bought size S to wear as an oversized jacket. The raw chalk tone is even better in person—not sterile white, but like aged drafting paper. The collar stands up without wilting. Worth every cent.',
    fitVerdict: 'OVERSIZED INTENDED',
    helpfulCount: 19
  },
  {
    id: 'rev-03',
    author: 'JONAS T.',
    avatarInitials: 'JT',
    verified: true,
    sizeOrdered: 'M',
    colorOrdered: 'PITCH BLACK',
    measurements: '180CM',
    stars: 4,
    date: 'SEP 18, 2024',
    headline: '"HEAVY WEIGHT, ARMS ARE SLIGHTLY GENEROUS"',
    text: 'The wool density is unmatched at this price bracket. Note that the sleeves are intentionally long and wide, requiring a single fold if you have shorter arms. Overall an absolute centerpiece in my wardrobe.',
    fitVerdict: 'SLIGHTLY LONG SLEEVES',
    helpfulCount: 11
  }
];

export const MOCK_REVIEWS = PRODUCT_REVIEWS;

export const CURRENCY_RATES: Record<string, { rate: number; symbol: string }> = {
  EUR: { rate: 1.0, symbol: '€' },
  USD: { rate: 1.08, symbol: '$' },
  GBP: { rate: 0.85, symbol: '£' },
  JPY: { rate: 165.0, symbol: '¥' }
};

export function formatPrice(priceEUR: number, currency: string): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.EUR;
  const converted = priceEUR * info.rate;
  if (currency === 'JPY') {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${info.symbol}${converted.toFixed(2)}`;
}
