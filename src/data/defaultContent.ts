import type { HomeContent, SiteContent, SiteSettings } from '../types';

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroEyebrow: 'SERIES 2025 // EDITION 04',
  heroTitle: 'GEOMETRIC\nUTILITY\nCOLLECTION',
  heroSubtitle:
    'Form stripped to structural essence. Heavyweight 480GSM Japanese canvas, welded sealed seams, and modular clip attachments engineered for extreme metropolitan transit.',
  lookbook: [
    {
      id: 'default-look-01',
      title: 'KRAFT OVERSIZED M-65 ARCHIVAL PARKA',
      caption: 'SAND OCHRE • DUAL FIDLOCK ATTACHMENT',
      link: '',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAp6ZpElAE3guBTSU4dS8RvSkDfcfM_FvXPL7Po56QtkTy-qxHu4Lfl4ppobrZPaZ_IzjKNCtHv5gVtbrYpIoysQKjWti6yJu87hXBjx26LPAg30XUzlRbuOFzz5Ce_ONKEpeSEzf4WHd-qUDruoqMhXNslqrb3tnBOYm7JOrYowiDHPvsMmnEK_jlfKgKxVcI-HrT_U96eYhXnJVP66heT8W0Gj5tHg8LA2nV8B42wpPufXqgueAnb',
      imageAlt: 'KRAFT oversized M-65 archival parka',
    },
  ],
  editorialTitle: '"A CHAIR, A BUILDING, A JACKET: EACH IS AN EXERCISE IN PURE LOAD AND TENSION."',
  editorialBody:
    'Founded on the belief that garments are portable architectures, KRAFT rejects decorative ornament. Every seam serves kinetic necessity; every pocket dimensions itself around concrete tools of contemporary city inhabitants.',
  editorialImageUrl: null,
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement: 'COMPLIMENTARY SHIPPING OVER €300',
  footerTagline:
    'STRICTLY FUNCTIONAL RELEASES, ARCHIVAL DROPS, AND FORM-FOLLOWS-FUNCTION DESIGN ESSAYS. ZERO SPAM.',
  socialLinks: [
    { label: 'INSTAGRAM', icon: 'photo_camera', href: 'https://instagram.com' },
    { label: 'TIKTOK', icon: 'play_circle', href: 'https://tiktok.com' },
    { label: 'PINTEREST', icon: 'push_pin', href: 'https://pinterest.com' },
    { label: 'YOUTUBE LABS', icon: 'smart_display', href: 'https://youtube.com' },
  ],
  storeLocations: [
    { name: 'BERLIN MITTE', address: 'TORSTRASSE 140', hours: 'OPEN 10-19' },
    { name: 'TOKYO AOYAMA', address: 'MINAMI-AOYAMA 5-CHOME', hours: 'OPEN 11-20' },
    { name: 'NEW YORK SOHO', address: 'MERCER ST', hours: 'OPEN 11-19' },
    { name: 'LONDON SHOREDITCH', address: 'REDCHURCH ST', hours: 'OPEN 10-18' },
  ],
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  home: DEFAULT_HOME_CONTENT,
  settings: DEFAULT_SITE_SETTINGS,
};
