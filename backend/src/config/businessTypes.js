// Single source of truth for all valid business types.
// Add or remove types here — Tenant model enum and controller validation
// both pull from this list automatically.

const BUSINESS_TYPES = [
  'nail_art', 'mehendi', 'jewellery', 'cake', 'makeup_artist',
  'handmade_jewellery', 'artificial_jewellery', 'boutique_clothing',
  'saree_boutique', 'lehenga_boutique', 'ethnic_wear', 'tattoo_artist',
  'personalized_gifts', 'wedding_decorator', 'home_baker', 'hair_stylist',
  'eyelash_artist', 'bridal_stylist', 'handmade_crafts', 'resin_art',
  'crochet', 'candle_brand', 'handmade_soap', 'handmade_skincare',
  'balloon_decoration', 'florist', 'event_planner', 'chocolate_bouquet',
  'return_gifts', 'invitation_designer', 'custom_nameplate', 'pottery',
  'clay_art', 'digital_portrait', 'home_decor', 'wall_decor', 'macrame',
  'furniture_decor', 'fashion_accessories', 'handbag_brand',
  'bridal_accessories', 'custom_footwear', 'watch_accessories',
  'dessert_business', 'donut_shop', 'macaron_business', 'mithai_sweets',
  'gift_hamper', 'festival_gifts', 'rakhi_business', 'diwali_hamper',
  'scrapbook', 'memory_album', 'handmade_toys', 'pet_accessories',
  'acrylic_art', 'handmade_stationery', 'phone_case', 'tumbler_mug',
  'keychain', 'fridge_magnet', 'wedding_favors', 'kids_accessories',
  'baby_gifts', 'custom_led_gifts', 'handmade_perfume', 'organic_beauty',
  'handmade_bags', 'beaded_jewellery', 'silver_jewellery',
  'bridal_jewellery_rental', 'artificial_flower_decor', 'festive_decor',
  'home_styling', 'diy_craft_kits', 'embroidery_art', 'fabric_painting',
  'handmade_bookmarks', 'miniature_art', 'bottle_art', 'handmade_frames',
  'couple_gifts', 'anime_merchandise', 'handmade_plushies', 'wedding_hamper',
  'luxury_gift_box', 'car_decor', 'spiritual_decor', 'puja_decor',
  'resin_gifts', 'handmade_trinkets', 'aesthetic_lifestyle', 'luxury_boutique',
  'generic',
];

module.exports = { BUSINESS_TYPES };