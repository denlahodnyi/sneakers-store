import { Gender, type DiscountType } from '@sneakers-store/contracts';

type ProductsSeed = {
  brand_id: number;
  category_id: number;
  name: string;
  description: null | string;
  gender: Gender;
  is_active: boolean;
  is_featured: boolean;
  _variants: {
    color_id: number;
    name: null | string;
    slug: null | string;
    _skus: {
      size_id: number;
      stock_qty: number;
      base_price: number;
      is_active: boolean;
    }[];
    _images: {
      public_id: string;
      url: string;
      width: number | null;
      height: number | null;
      alt: string | null;
    }[];
    _discounts: {
      discount_type: DiscountType;
      discount_value: number;
      is_active: boolean;
    }[];
  }[];
}[];

const products: ProductsSeed = [
  {
    // id: uuid,
    brand_id: 7,
    category_id: 2,
    name: 'M RUNNER PREMIUM LEATHER',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: false,
    _variants: [
      {
        // id: uuid,
        // product_id: uuid,
        color_id: 3,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-chorni-shkiryani-krosivky-m-runner-premium-leather-tommy-hilfiger-fm0fm05277-chornyi_gk6peb',
            url: '/v1737212044/cholovichi-chorni-shkiryani-krosivky-m-runner-premium-leather-tommy-hilfiger-fm0fm05277-chornyi_gk6peb.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            // id: uuid,
            // product_id: uuid,
            // product_var_id: uuid,
            size_id: 2,
            // sku: random str,
            stock_qty: 5,
            base_price: 200_00,
            is_active: true,
          },
          {
            size_id: 3,
            stock_qty: 5,
            base_price: 200_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 6,
    category_id: 2,
    name: 'D-CAGE',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 1,
        name: null,
        slug: null,
        _images: [
          {
            public_id: 'hzghp7j53dhdkhymccz0',
            url: '/v1737032031/hzghp7j53dhdkhymccz0.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
          {
            public_id:
              'cholovichi-krosivky-d-cage-diesel-y03444-p6918-riznokolorovyi_1_fm2178',
            url: '/v1737206601/cholovichi-krosivky-d-cage-diesel-y03444-p6918-riznokolorovyi_1_fm2178.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 2,
            stock_qty: 5,
            base_price: 255_00,
            is_active: true,
          },
          {
            size_id: 3,
            stock_qty: 5,
            base_price: 255_00,
            is_active: true,
          },
          {
            size_id: 4,
            stock_qty: 5,
            base_price: 255_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 2,
            is_active: true,
          },
        ],
      },
      {
        color_id: 3,
        name: null,
        slug: null,
        _images: [
          {
            public_id: 'vzqcdkjkpzhfeunx1tu8',
            url: '/v1737032225/vzqcdkjkpzhfeunx1tu8.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
          {
            public_id: 'g3asihj2kvyljkxuduzf',
            url: '/v1737056818/g3asihj2kvyljkxuduzf.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 4,
            stock_qty: 6,
            base_price: 255_00,
            is_active: true,
          },
          {
            size_id: 5,
            stock_qty: 6,
            base_price: 255_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 4,
    category_id: 5,
    name: 'UA U Phantom 4 Storm',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: false,
    _variants: [
      {
        color_id: 9,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'krosivky-ua-u-phantom-4-storm-under-armour-3027625-101-siryi_d7nyda',
            url: '/v1737212319/krosivky-ua-u-phantom-4-storm-under-armour-3027625-101-siryi_d7nyda.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 7,
            stock_qty: 10,
            base_price: 190_00,
            is_active: true,
          },
          {
            size_id: 8,
            stock_qty: 5,
            base_price: 200_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'FIXED',
            discount_value: 10_00,
            is_active: true,
          },
        ],
      },
      {
        color_id: 3,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'chorni-krosivky-ua-u-phantom-4-storm-under-armour-3027625-001-chornyi_khazn0',
            url: '/v1737212318/chorni-krosivky-ua-u-phantom-4-storm-under-armour-3027625-001-chornyi_khazn0.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 9,
            stock_qty: 10,
            base_price: 205_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 2,
    category_id: 8,
    name: 'VERSAIR',
    description: null,
    gender: Gender.WOMEN,
    is_active: true,
    is_featured: false,
    _variants: [
      {
        color_id: 4,
        name: null,
        slug: null,
        _images: [
          {
            public_id: '325ecb9c2ef74bcf9718f1cef3790a4a_gd2a78',
            url: '/v1737208563/325ecb9c2ef74bcf9718f1cef3790a4a_gd2a78.webp',
            width: 1801,
            height: 2600,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 1,
            stock_qty: 8,
            base_price: 130_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 1,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 1,
    category_id: 1,
    name: 'NITEBALL',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 9,
        name: null,
        slug: null,
        _images: [
          {
            public_id: 'e129b09a98da4eabb99d09bf2b044aa3_m4okze',
            url: '/v1737201907/e129b09a98da4eabb99d09bf2b044aa3_m4okze.webp',
            width: 1801,
            height: 2600,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 5,
            stock_qty: 4,
            base_price: 120_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 9,
    category_id: 1,
    name: 'PS 200 TOP',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 1,
        name: null,
        slug: null,
        _images: [
          {
            public_id: 'a0fa8c64734b4c038db054707155e5c3_prass7',
            url: '/t_1801x2000/v1737209221/a0fa8c64734b4c038db054707155e5c3_prass7.webp',
            width: 1801,
            height: 2000,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 4,
            stock_qty: 2,
            base_price: 170_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 3,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 2,
    category_id: 1,
    name: 'AIR MAX DN ISA',
    description: null,
    gender: Gender.WOMEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 10,
        name: null,
        slug: null,
        _images: [
          {
            public_id: 'f1cf690ba93544b0900e0a146a111f34_w1e3mb',
            url: '/v1737208564/f1cf690ba93544b0900e0a146a111f34_w1e3mb.webp',
            width: 1801,
            height: 2600,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 1,
            stock_qty: 6,
            base_price: 150_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 9,
    category_id: 3,
    name: 'PS100',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 2,
        name: null,
        slug: null,
        _images: [
          {
            public_id: 'c354503775d446a7a5025cf8b886d049_sjd7i9',
            url: '/t_1801x2000/v1737209221/c354503775d446a7a5025cf8b886d049_sjd7i9.webp',
            width: 1801,
            height: 2000,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 4,
            stock_qty: 3,
            base_price: 190_00,
            is_active: true,
          },
          {
            size_id: 5,
            stock_qty: 2,
            base_price: 199_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 1.5,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 6,
    category_id: 2,
    name: 'D-AIRSPEED LOW',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 1,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-krosivky-d-airspeed-low-diesel-y03436-p6907-riznokolorovyi_alvreu',
            url: '/v1737206601/cholovichi-krosivky-d-airspeed-low-diesel-y03436-p6907-riznokolorovyi_alvreu.jpg',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 2,
            stock_qty: 4,
            base_price: 240_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'FIXED',
            discount_value: 40_00,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 4,
    category_id: 5,
    name: 'CURRY 12 DUB NATION',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: false,
    _variants: [
      {
        color_id: 3,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'chorni-krosivky-curry-12-dub-nation-under-armour-3027630-001-chornyi_ztfudt',
            url: '/v1737212317/chorni-krosivky-curry-12-dub-nation-under-armour-3027630-001-chornyi_ztfudt.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 7,
            stock_qty: 10,
            base_price: 205_00,
            is_active: true,
          },
          {
            size_id: 8,
            stock_qty: 10,
            base_price: 210_00,
            is_active: true,
          },
          {
            size_id: 9,
            stock_qty: 10,
            base_price: 216_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 10,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 2,
    category_id: 1,
    name: 'UAIR MAX 90',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 9,
        name: null,
        slug: null,
        _images: [
          {
            public_id: 'cc0dd101c0484b6c9377867e416cf15b_uk6fsi',
            url: '/v1737208563/cc0dd101c0484b6c9377867e416cf15b_uk6fsi.webp',
            width: 1801,
            height: 2600,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 3,
            stock_qty: 5,
            base_price: 120_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 4,
    category_id: 8,
    name: 'UA W Project Rock 7',
    description: null,
    gender: Gender.WOMEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 10,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'zhinochi-bezhevi-krosivky-ua-w-project-rock-7-under-armour-3027601-200-bezhevyi_mitpyr',
            url: '/v1737212320/zhinochi-bezhevi-krosivky-ua-w-project-rock-7-under-armour-3027601-200-bezhevyi_mitpyr.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 7,
            stock_qty: 6,
            base_price: 200_00,
            is_active: true,
          },
          {
            size_id: 8,
            stock_qty: 6,
            base_price: 210_00,
            is_active: true,
          },
          {
            size_id: 9,
            stock_qty: 6,
            base_price: 210_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 15,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 2,
    category_id: 1,
    name: 'FLYKNIT HAVEN',
    description: null,
    gender: Gender.WOMEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 6,
        name: null,
        slug: null,
        _images: [
          {
            public_id: 'b679ad884c894b78a6b4e5241cd9d11d_znlznx',
            url: '/v1737209096/b679ad884c894b78a6b4e5241cd9d11d_znlznx.webp',
            width: 1801,
            height: 2600,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 7,
            stock_qty: 3,
            base_price: 110_00,
            is_active: true,
          },
          {
            size_id: 8,
            stock_qty: 3,
            base_price: 110_00,
            is_active: true,
          },
          {
            size_id: 9,
            stock_qty: 3,
            base_price: 110_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 6,
    category_id: 2,
    name: 'S-TYCHE D',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: false,
    _variants: [
      {
        color_id: 9,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-siri-krosivky-s-tyche-d-diesel-y03345-pr173-siryi_krj0ev',
            url: '/v1737212316/cholovichi-siri-krosivky-s-tyche-d-diesel-y03345-pr173-siryi_krj0ev.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 4,
            stock_qty: 8,
            base_price: 242_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 40,
            is_active: true,
          },
        ],
      },
      {
        color_id: 3,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-chorni-krosivky-s-tyche-d-diesel-y03345-pr173-chornyi_qak41x',
            url: '/v1737212314/cholovichi-chorni-krosivky-s-tyche-d-diesel-y03345-pr173-chornyi_qak41x.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 4,
            stock_qty: 12,
            base_price: 240_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 40,
            is_active: true,
          },
        ],
      },
      {
        color_id: 9,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-siri-zamshevi-krosivky-tyche-diesel-y03345-pr173-bilyi_l46wx8',
            url: '/v1737212317/cholovichi-siri-zamshevi-krosivky-tyche-diesel-y03345-pr173-bilyi_l46wx8.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 4,
            stock_qty: 11,
            base_price: 240_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 35,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 6,
    category_id: 3,
    name: 'S-UKIYO V2 MID',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 1,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-shkiryani-khaitopy-s-ukiyo-v2-mid-diesel-y03364-p5576-chornyi_cvhfcp',
            url: '/v1737212314/cholovichi-shkiryani-khaitopy-s-ukiyo-v2-mid-diesel-y03364-p5576-chornyi_cvhfcp.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 4,
            stock_qty: 6,
            base_price: 250_00,
            is_active: true,
          },
          {
            size_id: 5,
            stock_qty: 6,
            base_price: 250_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'PERCENTAGE',
            discount_value: 15,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 7,
    category_id: 2,
    name: 'M RUNNER X VENTILE MIX',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 10,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-bezhevi-krosivky-m-runner-x-ventile-mix-tommy-hilfiger-fm0fm05062-bilyi_ny7cig',
            url: '/v1737212043/cholovichi-bezhevi-krosivky-m-runner-x-ventile-mix-tommy-hilfiger-fm0fm05062-bilyi_ny7cig.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 3,
            stock_qty: 9,
            base_price: 160_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 4,
    category_id: 7,
    name: 'UA Lockdown 7 Low',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: false,
    _variants: [
      {
        color_id: 4,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'chervoni-krosivky-ua-lockdown-7-low-under-armour-3028512-600-chervonyi_eh6ysf',
            url: '/v1737212313/chervoni-krosivky-ua-lockdown-7-low-under-armour-3028512-600-chervonyi_eh6ysf.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 9,
            stock_qty: 10,
            base_price: 90_00,
            is_active: true,
          },
          {
            size_id: 10,
            stock_qty: 10,
            base_price: 90_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 7,
    category_id: 2,
    name: 'FASTON MIX ESS',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: false,
    _variants: [
      {
        color_id: 9,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-siri-krosivky-faston-mix-ess-tommy-hilfiger-fm0fm05141-siryi_cbdope',
            url: '/v1737212045/cholovichi-siri-krosivky-faston-mix-ess-tommy-hilfiger-fm0fm05141-siryi_cbdope.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 2,
            stock_qty: 7,
            base_price: 120_00,
            is_active: true,
          },
          {
            size_id: 3,
            stock_qty: 10,
            base_price: 120_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
  {
    brand_id: 7,
    category_id: 2,
    name: 'TJM RETRO BASKET ESS',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: true,
    _variants: [
      {
        color_id: 4,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'cholovichi-chervoni-snikersy-tjm-retro-basket-ess-tommy-jeans-em0em01395-chervonyi_evlpmo',
            url: '/v1737212044/cholovichi-chervoni-snikersy-tjm-retro-basket-ess-tommy-jeans-em0em01395-chervonyi_evlpmo.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 4,
            stock_qty: 10,
            base_price: 220_00,
            is_active: true,
          },
        ],
        _discounts: [
          {
            discount_type: 'FIXED',
            discount_value: 40_00,
            is_active: true,
          },
        ],
      },
    ],
  },
  {
    brand_id: 3,
    category_id: 6,
    name: 'FUTURE 7 ULTIMATE FG/AG Football Boots',
    description: null,
    gender: Gender.MEN,
    is_active: true,
    is_featured: false,
    _variants: [
      {
        color_id: 5,
        name: null,
        slug: null,
        _images: [
          {
            public_id:
              'syni-butsy-future-7-ultimate-fgag-football-boots-uniseks-puma-107916_pcf7zf',
            url: '/v1737209439/syni-butsy-future-7-ultimate-fgag-football-boots-uniseks-puma-107916_pcf7zf.webp',
            width: 1376,
            height: 2060,
            alt: '',
          },
        ],
        _skus: [
          {
            size_id: 8,
            stock_qty: 4,
            base_price: 200_00,
            is_active: true,
          },
        ],
        _discounts: [],
      },
    ],
  },
];

export default products;
