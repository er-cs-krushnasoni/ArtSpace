// Starter templates for every business type.
// categoryIds is left empty — admins map their own categories after loading.

export const QUIZ_TEMPLATES = {

  nail_art: [
    {
      questionText: "What's your style vibe?",
      options: [
        { text: 'Minimalist & clean', categoryIds: [] },
        { text: 'Bold & colourful', categoryIds: [] },
        { text: 'Glittery & glam', categoryIds: [] },
        { text: 'Cute & quirky', categoryIds: [] },
      ],
    },
    {
      questionText: 'What occasion is this for?',
      options: [
        { text: 'Everyday / work', categoryIds: [] },
        { text: 'Wedding / festive', categoryIds: [] },
        { text: 'Party / night out', categoryIds: [] },
        { text: 'No special occasion', categoryIds: [] },
      ],
    },
    {
      questionText: 'Favourite colour family?',
      options: [
        { text: 'Nudes & neutrals', categoryIds: [] },
        { text: 'Pinks & reds', categoryIds: [] },
        { text: 'Blues & greens', categoryIds: [] },
        { text: 'Purples & blacks', categoryIds: [] },
      ],
    },
    {
      questionText: 'Nail length preference?',
      options: [
        { text: 'Short & practical', categoryIds: [] },
        { text: 'Medium', categoryIds: [] },
        { text: 'Long & dramatic', categoryIds: [] },
      ],
    },
  ],

  mehendi: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Wedding / Bridal', categoryIds: [] },
        { text: 'Festival', categoryIds: [] },
        { text: 'Casual / everyday', categoryIds: [] },
        { text: 'Engagement / party', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which design style do you prefer?',
      options: [
        { text: 'Traditional / classic', categoryIds: [] },
        { text: 'Modern / contemporary', categoryIds: [] },
        { text: 'Indo-Arabic fusion', categoryIds: [] },
        { text: 'Minimalist', categoryIds: [] },
      ],
    },
    {
      questionText: 'Coverage preference?',
      options: [
        { text: 'Full hand & feet', categoryIds: [] },
        { text: 'Half hand', categoryIds: [] },
        { text: 'Finger tips only', categoryIds: [] },
        { text: 'Just a small motif', categoryIds: [] },
      ],
    },
    {
      questionText: 'Regional style preference?',
      options: [
        { text: 'Rajasthani', categoryIds: [] },
        { text: 'Mughlai / Lucknawi', categoryIds: [] },
        { text: 'Arabic', categoryIds: [] },
        { text: 'South Indian', categoryIds: [] },
      ],
    },
  ],

  cake: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday', categoryIds: [] },
        { text: 'Wedding / anniversary', categoryIds: [] },
        { text: 'Baby shower', categoryIds: [] },
        { text: 'Just because!', categoryIds: [] },
      ],
    },
    {
      questionText: 'Flavour preference?',
      options: [
        { text: 'Chocolate', categoryIds: [] },
        { text: 'Vanilla / butterscotch', categoryIds: [] },
        { text: 'Red velvet', categoryIds: [] },
        { text: 'Fruit based', categoryIds: [] },
      ],
    },
    {
      questionText: 'What size do you need?',
      options: [
        { text: 'Small (up to 6 people)', categoryIds: [] },
        { text: 'Medium (up to 15 people)', categoryIds: [] },
        { text: 'Large (15+ people)', categoryIds: [] },
      ],
    },
    {
      questionText: 'Theme / style?',
      options: [
        { text: 'Minimalist / elegant', categoryIds: [] },
        { text: 'Fun & colourful', categoryIds: [] },
        { text: 'Floral', categoryIds: [] },
        { text: 'Character / theme', categoryIds: [] },
      ],
    },
  ],

  makeup_artist: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Bridal / wedding', categoryIds: [] },
        { text: 'Party / event', categoryIds: [] },
        { text: 'Photoshoot', categoryIds: [] },
        { text: 'Everyday glam', categoryIds: [] },
      ],
    },
    {
      questionText: 'Coverage preference?',
      options: [
        { text: 'Natural / no-makeup look', categoryIds: [] },
        { text: 'Medium coverage', categoryIds: [] },
        { text: 'Full glam', categoryIds: [] },
      ],
    },
    {
      questionText: 'Eye makeup style?',
      options: [
        { text: 'Soft & subtle', categoryIds: [] },
        { text: 'Smokey & dramatic', categoryIds: [] },
        { text: 'Colourful & bold', categoryIds: [] },
        { text: 'Classic eyeliner', categoryIds: [] },
      ],
    },
    {
      questionText: 'Lip colour preference?',
      options: [
        { text: 'Nude / MLBB', categoryIds: [] },
        { text: 'Pink / coral', categoryIds: [] },
        { text: 'Red / berry', categoryIds: [] },
        { text: 'Bold / dark', categoryIds: [] },
      ],
    },
  ],

  handmade_jewellery: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Wedding / bridal', categoryIds: [] },
        { text: 'Everyday / office', categoryIds: [] },
        { text: 'Festival / party', categoryIds: [] },
        { text: 'Gift for someone', categoryIds: [] },
      ],
    },
    {
      questionText: 'Metal / material preference?',
      options: [
        { text: 'Gold / gold-plated', categoryIds: [] },
        { text: 'Silver / oxidised', categoryIds: [] },
        { text: 'Rose gold', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & delicate', categoryIds: [] },
        { text: 'Statement & bold', categoryIds: [] },
        { text: 'Traditional & ethnic', categoryIds: [] },
        { text: 'Trendy & modern', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which piece are you looking for?',
      options: [
        { text: 'Necklace / pendant', categoryIds: [] },
        { text: 'Earrings', categoryIds: [] },
        { text: 'Bracelet / bangles', categoryIds: [] },
        { text: 'Ring', categoryIds: [] },
      ],
    },
  ],

  artificial_jewellery: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Wedding / festive', categoryIds: [] },
        { text: 'Everyday / college', categoryIds: [] },
        { text: 'Party / night out', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
      ],
    },
    {
      questionText: 'Finish preference?',
      options: [
        { text: 'Gold tone', categoryIds: [] },
        { text: 'Silver tone', categoryIds: [] },
        { text: 'Oxidised / antique', categoryIds: [] },
        { text: 'Colourful / enamel', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & dainty', categoryIds: [] },
        { text: 'Chunky & statement', categoryIds: [] },
        { text: 'Ethnic / traditional', categoryIds: [] },
        { text: 'Western / fusion', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which piece are you looking for?',
      options: [
        { text: 'Earrings', categoryIds: [] },
        { text: 'Necklace / set', categoryIds: [] },
        { text: 'Bangles / bracelet', categoryIds: [] },
        { text: 'Full jewellery set', categoryIds: [] },
      ],
    },
  ],

  boutique_clothing: [
    {
      questionText: 'What are you shopping for?',
      options: [
        { text: 'Casual / everyday wear', categoryIds: [] },
        { text: 'Festive / ethnic wear', categoryIds: [] },
        { text: 'Party / occasion wear', categoryIds: [] },
        { text: 'Work / office wear', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is your style personality?',
      options: [
        { text: 'Minimal & classic', categoryIds: [] },
        { text: 'Trendy & fashion-forward', categoryIds: [] },
        { text: 'Boho & relaxed', categoryIds: [] },
        { text: 'Glam & bold', categoryIds: [] },
      ],
    },
    {
      questionText: 'Preferred fabric feel?',
      options: [
        { text: 'Light & breathable', categoryIds: [] },
        { text: 'Structured & formal', categoryIds: [] },
        { text: 'Flowy & comfortable', categoryIds: [] },
        { text: 'Rich & luxurious', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette preference?',
      options: [
        { text: 'Neutrals & earth tones', categoryIds: [] },
        { text: 'Pastels & soft hues', categoryIds: [] },
        { text: 'Bright & vibrant', categoryIds: [] },
        { text: 'Dark & moody', categoryIds: [] },
      ],
    },
  ],

  saree_boutique: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Wedding / bridal', categoryIds: [] },
        { text: 'Festival / puja', categoryIds: [] },
        { text: 'Casual / everyday', categoryIds: [] },
        { text: 'Office / formal', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which fabric do you prefer?',
      options: [
        { text: 'Silk / Banarasi', categoryIds: [] },
        { text: 'Cotton / linen', categoryIds: [] },
        { text: 'Chiffon / georgette', categoryIds: [] },
        { text: 'Chanderi / organza', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Heavy embroidered / zari', categoryIds: [] },
        { text: 'Printed / digital print', categoryIds: [] },
        { text: 'Handloom / handwoven', categoryIds: [] },
        { text: 'Minimal / plain with border', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour preference?',
      options: [
        { text: 'Rich & jewel tones', categoryIds: [] },
        { text: 'Pastels & soft shades', categoryIds: [] },
        { text: 'Neutrals & off-white', categoryIds: [] },
        { text: 'Bold & vibrant', categoryIds: [] },
      ],
    },
  ],

  lehenga_boutique: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Bridal / wedding', categoryIds: [] },
        { text: 'Bridesmaid / wedding guest', categoryIds: [] },
        { text: 'Festival / sangeet', categoryIds: [] },
        { text: 'Reception / party', categoryIds: [] },
      ],
    },
    {
      questionText: 'Work / embellishment preference?',
      options: [
        { text: 'Heavy zari / embroidery', categoryIds: [] },
        { text: 'Sequins / mirror work', categoryIds: [] },
        { text: 'Printed / digital print', categoryIds: [] },
        { text: 'Minimal / clean look', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour preference?',
      options: [
        { text: 'Red / maroon / deep tones', categoryIds: [] },
        { text: 'Pink / peach / coral', categoryIds: [] },
        { text: 'Pastels & mint', categoryIds: [] },
        { text: 'Navy / teal / green', categoryIds: [] },
      ],
    },
    {
      questionText: 'Silhouette preference?',
      options: [
        { text: 'Flared / full lehenga', categoryIds: [] },
        { text: 'A-line', categoryIds: [] },
        { text: 'Mermaid / fitted', categoryIds: [] },
        { text: 'Sharara / palazzo style', categoryIds: [] },
      ],
    },
  ],

  ethnic_wear: [
    {
      questionText: 'What are you looking for?',
      options: [
        { text: 'Kurta / kurti', categoryIds: [] },
        { text: 'Suit / salwar set', categoryIds: [] },
        { text: 'Co-ord / fusion set', categoryIds: [] },
        { text: 'Dress / gown', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Daily / casual', categoryIds: [] },
        { text: 'Festival / puja', categoryIds: [] },
        { text: 'Wedding / formal', categoryIds: [] },
        { text: 'Office wear', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Traditional & classic', categoryIds: [] },
        { text: 'Fusion & contemporary', categoryIds: [] },
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Embroidered & detailed', categoryIds: [] },
      ],
    },
    {
      questionText: 'Fabric preference?',
      options: [
        { text: 'Cotton / linen', categoryIds: [] },
        { text: 'Rayon / viscose', categoryIds: [] },
        { text: 'Silk / satin', categoryIds: [] },
        { text: 'Chiffon / georgette', categoryIds: [] },
      ],
    },
  ],

  tattoo_artist: [
    {
      questionText: 'What style are you drawn to?',
      options: [
        { text: 'Fine line / minimalist', categoryIds: [] },
        { text: 'Traditional / old school', categoryIds: [] },
        { text: 'Realism / portrait', categoryIds: [] },
        { text: 'Geometric / mandala', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the tattoo for?',
      options: [
        { text: 'Personal meaning / memorial', categoryIds: [] },
        { text: 'Aesthetic / decoration', categoryIds: [] },
        { text: 'First tattoo / experimenting', categoryIds: [] },
        { text: 'Covering / reworking old tattoo', categoryIds: [] },
      ],
    },
    {
      questionText: 'Preferred placement?',
      options: [
        { text: 'Wrist / forearm', categoryIds: [] },
        { text: 'Back / shoulder', categoryIds: [] },
        { text: 'Ankle / foot', categoryIds: [] },
        { text: 'Neck / behind ear', categoryIds: [] },
      ],
    },
    {
      questionText: 'Size preference?',
      options: [
        { text: 'Tiny / micro', categoryIds: [] },
        { text: 'Small', categoryIds: [] },
        { text: 'Medium', categoryIds: [] },
        { text: 'Large / sleeve', categoryIds: [] },
      ],
    },
  ],

  personalized_gifts: [
    {
      questionText: 'Who is the gift for?',
      options: [
        { text: 'Partner / spouse', categoryIds: [] },
        { text: 'Friend', categoryIds: [] },
        { text: 'Family member', categoryIds: [] },
        { text: 'Colleague / boss', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday', categoryIds: [] },
        { text: 'Anniversary / Valentine\'s', categoryIds: [] },
        { text: 'Wedding / baby shower', categoryIds: [] },
        { text: 'Just because / no occasion', categoryIds: [] },
      ],
    },
    {
      questionText: 'What type of gift are you thinking?',
      options: [
        { text: 'Photo gift / frame / album', categoryIds: [] },
        { text: 'Custom name / initial item', categoryIds: [] },
        { text: 'Hamper / gift box', categoryIds: [] },
        { text: 'Wearable / accessory', categoryIds: [] },
      ],
    },
    {
  questionText: 'What type of personalisation do you want?',
  options: [
    { text: 'Name / initials', categoryIds: [] },
    { text: 'Photo', categoryIds: [] },
    { text: 'Custom message / quote', categoryIds: [] },
    { text: 'Illustration / portrait', categoryIds: [] },
  ],
},
  ],

  wedding_decorator: [
    {
      questionText: 'What event are you decorating?',
      options: [
        { text: 'Wedding ceremony', categoryIds: [] },
        { text: 'Reception', categoryIds: [] },
        { text: 'Mehendi / sangeet', categoryIds: [] },
        { text: 'Engagement / haldi', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is your decor style?',
      options: [
        { text: 'Royal & grand', categoryIds: [] },
        { text: 'Floral & romantic', categoryIds: [] },
        { text: 'Minimal & elegant', categoryIds: [] },
        { text: 'Bohemian / rustic', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette preference?',
      options: [
        { text: 'White & gold', categoryIds: [] },
        { text: 'Pink & blush', categoryIds: [] },
        { text: 'Red & maroon', categoryIds: [] },
        { text: 'Pastel & soft tones', categoryIds: [] },
      ],
    },
    {
  questionText: 'What is the venue type?',
  options: [
    { text: 'Banquet hall / indoor', categoryIds: [] },
    { text: 'Outdoor / garden', categoryIds: [] },
    { text: 'Home / intimate setup', categoryIds: [] },
    { text: 'Destination / resort', categoryIds: [] },
  ],
},
  ],

  home_baker: [
    {
      questionText: 'What are you looking for?',
      options: [
        { text: 'Custom cake', categoryIds: [] },
        { text: 'Cupcakes / mini cakes', categoryIds: [] },
        { text: 'Cookies / brownies', categoryIds: [] },
        { text: 'Festive / seasonal bakes', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday', categoryIds: [] },
        { text: 'Anniversary / celebration', categoryIds: [] },
        { text: 'Corporate / gifting', categoryIds: [] },
        { text: 'Everyday treat', categoryIds: [] },
      ],
    },
    {
      questionText: 'Flavour preference?',
      options: [
        { text: 'Chocolate', categoryIds: [] },
        { text: 'Vanilla / caramel', categoryIds: [] },
        { text: 'Fruit / berry', categoryIds: [] },
        { text: 'Nutty / coffee', categoryIds: [] },
      ],
    },
    {
      questionText: 'Any dietary preference?',
      options: [
        { text: 'No preference', categoryIds: [] },
        { text: 'Eggless', categoryIds: [] },
        { text: 'Vegan', categoryIds: [] },
        { text: 'Gluten-free', categoryIds: [] },
      ],
    },
  ],

  hair_stylist: [
    {
      questionText: 'What service are you looking for?',
      options: [
        { text: 'Haircut & styling', categoryIds: [] },
        { text: 'Hair colour / highlights', categoryIds: [] },
        { text: 'Hair treatment / spa', categoryIds: [] },
        { text: 'Bridal / event styling', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is your hair type?',
      options: [
        { text: 'Straight & fine', categoryIds: [] },
        { text: 'Wavy', categoryIds: [] },
        { text: 'Curly / coily', categoryIds: [] },
        { text: 'Thick & dense', categoryIds: [] },
      ],
    },
    {
      questionText: 'What look are you going for?',
      options: [
        { text: 'Natural & effortless', categoryIds: [] },
        { text: 'Sleek & polished', categoryIds: [] },
        { text: 'Voluminous & glam', categoryIds: [] },
        { text: 'Trendy / experimental', categoryIds: [] },
      ],
    },
    {
      questionText: 'Main hair concern?',
      options: [
        { text: 'Frizz & dryness', categoryIds: [] },
        { text: 'Hair fall / thinning', categoryIds: [] },
        { text: 'Damage & breakage', categoryIds: [] },
        { text: 'Dullness / no shine', categoryIds: [] },
      ],
    },
  ],

  eyelash_artist: [
    {
      questionText: 'What lash look are you going for?',
      options: [
        { text: 'Natural & subtle', categoryIds: [] },
        { text: 'Wispy & feathery', categoryIds: [] },
        { text: 'Glamorous & full', categoryIds: [] },
        { text: 'Dramatic & bold', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Everyday / work', categoryIds: [] },
        { text: 'Wedding / bridal', categoryIds: [] },
        { text: 'Party / event', categoryIds: [] },
        { text: 'Photoshoot', categoryIds: [] },
      ],
    },
    {
      questionText: 'Curl preference?',
      options: [
        { text: 'Straight / J curl', categoryIds: [] },
        { text: 'Natural / B curl', categoryIds: [] },
        { text: 'Medium / C curl', categoryIds: [] },
        { text: 'Dramatic / D curl', categoryIds: [] },
      ],
    },
    {
      questionText: 'Have you had lash extensions before?',
      options: [
        { text: 'First time', categoryIds: [] },
        { text: 'A few times', categoryIds: [] },
        { text: 'Regular client', categoryIds: [] },
      ],
    },
  ],

  bridal_stylist: [
    {
      questionText: 'What bridal service do you need?',
      options: [
        { text: 'Full bridal makeup & hair', categoryIds: [] },
        { text: 'Makeup only', categoryIds: [] },
        { text: 'Hair styling only', categoryIds: [] },
        { text: 'Pre-bridal / trial session', categoryIds: [] },
      ],
    },
    {
      questionText: 'What bridal look are you envisioning?',
      options: [
        { text: 'Traditional & heavy', categoryIds: [] },
        { text: 'Soft & dewy', categoryIds: [] },
        { text: 'Modern & minimal', categoryIds: [] },
        { text: 'Dramatic & editorial', categoryIds: [] },
      ],
    },
    {
      questionText: 'Skin tone?',
      options: [
        { text: 'Fair / light', categoryIds: [] },
        { text: 'Medium / wheatish', categoryIds: [] },
        { text: 'Dusky / olive', categoryIds: [] },
        { text: 'Deep / rich', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which function is this for?',
      options: [
        { text: 'Wedding ceremony', categoryIds: [] },
        { text: 'Reception', categoryIds: [] },
        { text: 'Mehendi / haldi', categoryIds: [] },
        { text: 'Sangeet / engagement', categoryIds: [] },
      ],
    },
  ],

  handmade_crafts: [
    {
      questionText: 'What are you looking for?',
      options: [
        { text: 'Home decor', categoryIds: [] },
        { text: 'Gift item', categoryIds: [] },
        { text: 'Wearable / accessory', categoryIds: [] },
        { text: 'Kids / hobby craft', categoryIds: [] },
      ],
    },
    {
      questionText: 'What style speaks to you?',
      options: [
        { text: 'Boho & earthy', categoryIds: [] },
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Colourful & playful', categoryIds: [] },
        { text: 'Traditional & ethnic', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the purpose?',
      options: [
        { text: 'Personal use', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Home styling', categoryIds: [] },
        { text: 'Special occasion', categoryIds: [] },
      ],
    },
    {
  questionText: 'What material do you prefer?',
  options: [
    { text: 'Wood / natural', categoryIds: [] },
    { text: 'Fabric / textile', categoryIds: [] },
    { text: 'Clay / resin', categoryIds: [] },
    { text: 'Mixed / no preference', categoryIds: [] },
  ],
},
  ],

  resin_art: [
    {
      questionText: 'What resin piece are you looking for?',
      options: [
        { text: 'Jewellery / accessories', categoryIds: [] },
        { text: 'Home decor / tray', categoryIds: [] },
        { text: 'Personalised gift', categoryIds: [] },
        { text: 'Coasters / tableware', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour / aesthetic preference?',
      options: [
        { text: 'Pastel & soft', categoryIds: [] },
        { text: 'Bold & vibrant', categoryIds: [] },
        { text: 'Ocean / galaxy themes', categoryIds: [] },
        { text: 'Neutral & earthy', categoryIds: [] },
      ],
    },
    {
      questionText: 'Do you want inclusions?',
      options: [
        { text: 'Dried flowers', categoryIds: [] },
        { text: 'Glitter / foil', categoryIds: [] },
        { text: 'Photos / personalisation', categoryIds: [] },
        { text: 'Clean / no inclusions', categoryIds: [] },
      ],
    },
    {
      questionText: 'Is this a gift or for yourself?',
      options: [
        { text: 'For myself', categoryIds: [] },
        { text: 'Gift for someone', categoryIds: [] },
        { text: 'Home styling', categoryIds: [] },
      ],
    },
  ],

  crochet: [
    {
      questionText: 'What crochet item are you looking for?',
      options: [
        { text: 'Bags / totes', categoryIds: [] },
        { text: 'Clothing / tops', categoryIds: [] },
        { text: 'Home decor / wall hangings', categoryIds: [] },
        { text: 'Accessories / scrunchies', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour preference?',
      options: [
        { text: 'Neutral & earthy', categoryIds: [] },
        { text: 'Pastels', categoryIds: [] },
        { text: 'Vibrant & colourful', categoryIds: [] },
        { text: 'Dark & moody', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style vibe?',
      options: [
        { text: 'Boho & relaxed', categoryIds: [] },
        { text: 'Minimalist & clean', categoryIds: [] },
        { text: 'Cottagecore / floral', categoryIds: [] },
        { text: 'Y2K / trendy', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Everyday use', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Special occasion', categoryIds: [] },
        { text: 'Home styling', categoryIds: [] },
      ],
    },
  ],

  candle_brand: [
    {
      questionText: 'What scent family do you prefer?',
      options: [
        { text: 'Floral & fresh', categoryIds: [] },
        { text: 'Woody & earthy', categoryIds: [] },
        { text: 'Sweet & warm', categoryIds: [] },
        { text: 'Clean & citrus', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the candle for?',
      options: [
        { text: 'Home ambience / décor', categoryIds: [] },
        { text: 'Self-care / relaxation', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Festive / celebration', categoryIds: [] },
      ],
    },
    {
      questionText: 'Candle type preference?',
      options: [
        { text: 'Soy wax / clean burn', categoryIds: [] },
        { text: 'Luxury / designer jar', categoryIds: [] },
        { text: 'Pillar / sculptural', categoryIds: [] },
        { text: 'Travel / tin size', categoryIds: [] },
      ],
    },
    {
      questionText: 'Aesthetic preference?',
      options: [
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Boho & earthy', categoryIds: [] },
        { text: 'Luxury & dark', categoryIds: [] },
        { text: 'Pastel & cute', categoryIds: [] },
      ],
    },
  ],

  handmade_soap: [
    {
      questionText: 'What is your skin type?',
      options: [
        { text: 'Dry & sensitive', categoryIds: [] },
        { text: 'Oily & acne-prone', categoryIds: [] },
        { text: 'Normal / combination', categoryIds: [] },
        { text: 'Mature / dull skin', categoryIds: [] },
      ],
    },
    {
      questionText: 'What do you want the soap to do?',
      options: [
        { text: 'Moisturise & nourish', categoryIds: [] },
        { text: 'Brighten & glow', categoryIds: [] },
        { text: 'Cleanse & detox', categoryIds: [] },
        { text: 'Soothe & calm', categoryIds: [] },
      ],
    },
    {
      questionText: 'Scent preference?',
      options: [
        { text: 'Floral (rose, lavender)', categoryIds: [] },
        { text: 'Fresh & citrus', categoryIds: [] },
        { text: 'Earthy & herbal', categoryIds: [] },
        { text: 'Unscented', categoryIds: [] },
      ],
    },
    {
      questionText: 'Any preferences?',
      options: [
        { text: 'Vegan / cruelty-free', categoryIds: [] },
        { text: 'No artificial fragrance', categoryIds: [] },
        { text: 'Natural / herbal ingredients', categoryIds: [] },
        { text: 'No special preference', categoryIds: [] },
      ],
    },
  ],

  handmade_skincare: [
    {
      questionText: 'What is your skin type?',
      options: [
        { text: 'Dry & flaky', categoryIds: [] },
        { text: 'Oily & shiny', categoryIds: [] },
        { text: 'Combination', categoryIds: [] },
        { text: 'Sensitive / reactive', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is your main skin concern?',
      options: [
        { text: 'Acne & breakouts', categoryIds: [] },
        { text: 'Dullness & pigmentation', categoryIds: [] },
        { text: 'Dryness & dehydration', categoryIds: [] },
        { text: 'Anti-ageing / fine lines', categoryIds: [] },
      ],
    },
    {
      questionText: 'What product are you looking for?',
      options: [
        { text: 'Face serum / oil', categoryIds: [] },
        { text: 'Moisturiser / cream', categoryIds: [] },
        { text: 'Scrub / mask', categoryIds: [] },
        { text: 'Full skincare set', categoryIds: [] },
      ],
    },
    {
      questionText: 'Any ingredient preferences?',
      options: [
        { text: 'Ayurvedic / herbal', categoryIds: [] },
        { text: 'Vitamin C / brightening', categoryIds: [] },
        { text: 'Retinol / anti-ageing', categoryIds: [] },
        { text: 'No specific preference', categoryIds: [] },
      ],
    },
  ],

  balloon_decoration: [
    {
      questionText: 'What event are you decorating?',
      options: [
        { text: 'Birthday party', categoryIds: [] },
        { text: 'Baby shower', categoryIds: [] },
        { text: 'Wedding / engagement', categoryIds: [] },
        { text: 'Corporate / brand event', categoryIds: [] },
      ],
    },
    {
      questionText: 'What type of decoration?',
      options: [
        { text: 'Balloon arch / garland', categoryIds: [] },
        { text: 'Balloon bouquet', categoryIds: [] },
        { text: 'Backdrop setup', categoryIds: [] },
        { text: 'Full room decoration', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour theme?',
      options: [
        { text: 'Pink & gold', categoryIds: [] },
        { text: 'Blue & silver', categoryIds: [] },
        { text: 'Pastel mix', categoryIds: [] },
        { text: 'Custom / tell me later', categoryIds: [] },
      ],
    },
    {
      questionText: 'Approximate guest count?',
      options: [
        { text: 'Intimate (under 20)', categoryIds: [] },
        { text: 'Small (20–50)', categoryIds: [] },
        { text: 'Medium (50–100)', categoryIds: [] },
        { text: 'Large (100+)', categoryIds: [] },
      ],
    },
  ],

  florist: [
    {
      questionText: 'What are the flowers for?',
      options: [
        { text: 'Wedding / ceremony', categoryIds: [] },
        { text: 'Gifting / bouquet', categoryIds: [] },
        { text: 'Home / office decor', categoryIds: [] },
        { text: 'Festival / puja', categoryIds: [] },
      ],
    },
    {
      questionText: 'Flower style preference?',
      options: [
        { text: 'Classic roses', categoryIds: [] },
        { text: 'Wildflower / boho mix', categoryIds: [] },
        { text: 'Tropical & exotic', categoryIds: [] },
        { text: 'Traditional / marigold', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette?',
      options: [
        { text: 'White & green', categoryIds: [] },
        { text: 'Pink & blush', categoryIds: [] },
        { text: 'Red & bold', categoryIds: [] },
        { text: 'Vibrant & mixed', categoryIds: [] },
      ],
    },
    {
  questionText: 'Packaging preference?',
  options: [
    { text: 'Classic bouquet wrap', categoryIds: [] },
    { text: 'Box arrangement', categoryIds: [] },
    { text: 'Basket / vase', categoryIds: [] },
    { text: 'No preference', categoryIds: [] },
  ],
},
  ],

  event_planner: [
    {
      questionText: 'What type of event are you planning?',
      options: [
        { text: 'Wedding / engagement', categoryIds: [] },
        { text: 'Birthday / anniversary', categoryIds: [] },
        { text: 'Corporate / brand event', categoryIds: [] },
        { text: 'Baby shower / naming ceremony', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is your event vibe?',
      options: [
        { text: 'Grand & traditional', categoryIds: [] },
        { text: 'Elegant & minimal', categoryIds: [] },
        { text: 'Fun & colourful', categoryIds: [] },
        { text: 'Intimate & cosy', categoryIds: [] },
      ],
    },
    {
      questionText: 'How many guests are expected?',
      options: [
        { text: 'Under 30', categoryIds: [] },
        { text: '30 – 100', categoryIds: [] },
        { text: '100 – 300', categoryIds: [] },
        { text: '300+', categoryIds: [] },
      ],
    },
    {
      questionText: 'What support do you need?',
      options: [
        { text: 'Full event management', categoryIds: [] },
        { text: 'Decor & styling only', categoryIds: [] },
        { text: 'Vendor coordination', categoryIds: [] },
        { text: 'Just consultation', categoryIds: [] },
      ],
    },
  ],

  chocolate_bouquet: [
    {
      questionText: 'Who is the chocolate bouquet for?',
      options: [
        { text: 'Partner / spouse', categoryIds: [] },
        { text: 'Friend / best friend', categoryIds: [] },
        { text: 'Family member', categoryIds: [] },
        { text: 'Colleague / teacher', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday', categoryIds: [] },
        { text: 'Valentine\'s / anniversary', categoryIds: [] },
        { text: 'Thank you / appreciation', categoryIds: [] },
        { text: 'Festival / celebration', categoryIds: [] },
      ],
    },
    {
      questionText: 'Chocolate preference?',
      options: [
        { text: 'Milk chocolate', categoryIds: [] },
        { text: 'Dark chocolate', categoryIds: [] },
        { text: 'White chocolate', categoryIds: [] },
        { text: 'Mixed / assorted', categoryIds: [] },
      ],
    },
    {
      questionText: 'Size preference?',
      options: [
        { text: 'Small (5–10 pieces)', categoryIds: [] },
        { text: 'Medium (10–20 pieces)', categoryIds: [] },
        { text: 'Large (20+ pieces)', categoryIds: [] },
      ],
    },
  ],

  return_gifts: [
    {
      questionText: 'What is the event?',
      options: [
        { text: 'Wedding', categoryIds: [] },
        { text: 'Baby shower / naming', categoryIds: [] },
        { text: 'Birthday party', categoryIds: [] },
        { text: 'Festival / puja', categoryIds: [] },
      ],
    },
    {
      questionText: 'Who are the guests?',
      options: [
        { text: 'Adults / all ages', categoryIds: [] },
        { text: 'Kids mainly', categoryIds: [] },
        { text: 'Women / ladies', categoryIds: [] },
        { text: 'Mixed crowd', categoryIds: [] },
      ],
    },
    {
      questionText: 'Gift type preference?',
      options: [
        { text: 'Edible / food items', categoryIds: [] },
        { text: 'Utility / usable', categoryIds: [] },
        { text: 'Decorative / aesthetic', categoryIds: [] },
        { text: 'Personalised / custom', categoryIds: [] },
      ],
    },
    {
  questionText: 'Packaging preference?',
  options: [
    { text: 'Individual wrapped', categoryIds: [] },
    { text: 'Small gift box', categoryIds: [] },
    { text: 'Potli / fabric bag', categoryIds: [] },
    { text: 'No preference', categoryIds: [] },
  ],
},
  ],

  invitation_designer: [
    {
      questionText: 'What is the invitation for?',
      options: [
        { text: 'Wedding / engagement', categoryIds: [] },
        { text: 'Birthday / anniversary', categoryIds: [] },
        { text: 'Baby shower / naming', categoryIds: [] },
        { text: 'Corporate / event', categoryIds: [] },
      ],
    },
    {
      questionText: 'Format preference?',
      options: [
        { text: 'Digital / WhatsApp invite', categoryIds: [] },
        { text: 'Printed card', categoryIds: [] },
        { text: 'Box / luxury invite', categoryIds: [] },
        { text: 'Both digital & print', categoryIds: [] },
      ],
    },
    {
      questionText: 'Design style?',
      options: [
        { text: 'Traditional & ornate', categoryIds: [] },
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Floral & romantic', categoryIds: [] },
        { text: 'Quirky & fun', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette preference?',
      options: [
        { text: 'Gold & cream', categoryIds: [] },
        { text: 'Pink & blush', categoryIds: [] },
        { text: 'Royal blue & gold', categoryIds: [] },
        { text: 'Custom — I have a theme', categoryIds: [] },
      ],
    },
  ],

  custom_nameplate: [
    {
      questionText: 'Where will the nameplate be placed?',
      options: [
        { text: 'Main door / entrance', categoryIds: [] },
        { text: 'Room door', categoryIds: [] },
        { text: 'Office / desk', categoryIds: [] },
        { text: 'Gift / gifting purpose', categoryIds: [] },
      ],
    },
    {
      questionText: 'Material preference?',
      options: [
        { text: 'Wood', categoryIds: [] },
        { text: 'Acrylic', categoryIds: [] },
        { text: 'Metal', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Decorative / ornate', categoryIds: [] },
        { text: 'Modern / geometric', categoryIds: [] },
        { text: 'Traditional / ethnic', categoryIds: [] },
      ],
    },
    {
      questionText: 'Do you want any extra elements?',
      options: [
        { text: 'LED lights', categoryIds: [] },
        { text: 'Family name / house name', categoryIds: [] },
        { text: 'Door number only', categoryIds: [] },
        { text: 'Custom design / logo', categoryIds: [] },
      ],
    },
  ],

  pottery: [
    {
      questionText: 'What pottery piece are you looking for?',
      options: [
        { text: 'Mug / cup', categoryIds: [] },
        { text: 'Bowl / plate', categoryIds: [] },
        { text: 'Vase / planter', categoryIds: [] },
        { text: 'Decorative / gifting piece', categoryIds: [] },
      ],
    },
    {
      questionText: 'Aesthetic preference?',
      options: [
        { text: 'Rustic & earthy', categoryIds: [] },
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Colourful & playful', categoryIds: [] },
        { text: 'Japanese / wabi-sabi', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Daily use', categoryIds: [] },
        { text: 'Home decor', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Special occasion', categoryIds: [] },
      ],
    },
    {
      questionText: 'Glaze / finish preference?',
      options: [
        { text: 'Matte & textured', categoryIds: [] },
        { text: 'Glossy & smooth', categoryIds: [] },
        { text: 'Speckled / natural', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
  ],

  clay_art: [
    {
      questionText: 'What clay art piece are you interested in?',
      options: [
        { text: 'Jewellery / earrings', categoryIds: [] },
        { text: 'Figurine / sculpture', categoryIds: [] },
        { text: 'Home decor item', categoryIds: [] },
        { text: 'Personalised gift', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Cute & miniature', categoryIds: [] },
        { text: 'Floral & detailed', categoryIds: [] },
        { text: 'Abstract & modern', categoryIds: [] },
        { text: 'Character / custom', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour preference?',
      options: [
        { text: 'Pastels', categoryIds: [] },
        { text: 'Earthy & neutral', categoryIds: [] },
        { text: 'Bold & bright', categoryIds: [] },
        { text: 'White / minimal', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal use', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Home styling', categoryIds: [] },
        { text: 'Collection', categoryIds: [] },
      ],
    },
  ],

  digital_portrait: [
    {
      questionText: 'What type of portrait do you want?',
      options: [
        { text: 'Realistic / photo-like', categoryIds: [] },
        { text: 'Illustrated / cartoon', categoryIds: [] },
        { text: 'Watercolour / painterly', categoryIds: [] },
        { text: 'Line art / minimal', categoryIds: [] },
      ],
    },
    {
      questionText: 'Who is the portrait of?',
      options: [
        { text: 'Myself', categoryIds: [] },
        { text: 'Couple', categoryIds: [] },
        { text: 'Family / group', categoryIds: [] },
        { text: 'Pet', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Gift / surprise', categoryIds: [] },
        { text: 'Print & frame at home', categoryIds: [] },
        { text: 'Wedding / anniversary', categoryIds: [] },
        { text: 'Profile / avatar', categoryIds: [] },
      ],
    },
    {
      questionText: 'Background preference?',
      options: [
        { text: 'Plain / minimal', categoryIds: [] },
        { text: 'Scenic / themed', categoryIds: [] },
        { text: 'Floral / decorative', categoryIds: [] },
        { text: 'No background', categoryIds: [] },
      ],
    },
  ],

  home_decor: [
    {
      questionText: 'What type of decor are you looking for?',
      options: [
        { text: 'Wall art / hangings', categoryIds: [] },
        { text: 'Table / shelf decor', categoryIds: [] },
        { text: 'Planters / vases', categoryIds: [] },
        { text: 'Lighting / lamps', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is your home aesthetic?',
      options: [
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Boho & eclectic', categoryIds: [] },
        { text: 'Traditional & ethnic', categoryIds: [] },
        { text: 'Cosy & cottagecore', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which room is this for?',
      options: [
        { text: 'Living room', categoryIds: [] },
        { text: 'Bedroom', categoryIds: [] },
        { text: 'Kitchen / dining', categoryIds: [] },
        { text: 'Entrance / hallway', categoryIds: [] },
      ],
    },
    {
      questionText: 'Is this for yourself or gifting?',
      options: [
        { text: 'For my home', categoryIds: [] },
        { text: 'Gifting / housewarming', categoryIds: [] },
        { text: 'Both', categoryIds: [] },
      ],
    },
  ],

  wall_decor: [
    {
      questionText: 'What wall decor style do you like?',
      options: [
        { text: 'Macrame / textile', categoryIds: [] },
        { text: 'Framed art / prints', categoryIds: [] },
        { text: 'Mirrors / metal art', categoryIds: [] },
        { text: 'Wooden / carved panels', categoryIds: [] },
      ],
    },
    {
      questionText: 'Home aesthetic?',
      options: [
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Boho & layered', categoryIds: [] },
        { text: 'Traditional / ethnic', categoryIds: [] },
        { text: 'Industrial / modern', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which room?',
      options: [
        { text: 'Living room', categoryIds: [] },
        { text: 'Bedroom', categoryIds: [] },
        { text: 'Kids room', categoryIds: [] },
        { text: 'Office / study', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette preference?',
      options: [
        { text: 'Neutrals & beige', categoryIds: [] },
        { text: 'White & wood tones', categoryIds: [] },
        { text: 'Earthy & terracotta', categoryIds: [] },
        { text: 'Bold & statement', categoryIds: [] },
      ],
    },
  ],

  macrame: [
    {
      questionText: 'What macrame piece are you looking for?',
      options: [
        { text: 'Wall hanging', categoryIds: [] },
        { text: 'Plant hanger', categoryIds: [] },
        { text: 'Bag / purse', categoryIds: [] },
        { text: 'Table runner / coaster', categoryIds: [] },
      ],
    },
    {
      questionText: 'Size preference?',
      options: [
        { text: 'Small / mini', categoryIds: [] },
        { text: 'Medium', categoryIds: [] },
        { text: 'Large / statement piece', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour preference?',
      options: [
        { text: 'Natural / undyed cotton', categoryIds: [] },
        { text: 'Earthy & boho tones', categoryIds: [] },
        { text: 'Pastel & soft', categoryIds: [] },
        { text: 'Dark & moody', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Home styling', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Wedding / event decor', categoryIds: [] },
        { text: 'Outdoor / balcony', categoryIds: [] },
      ],
    },
  ],

  furniture_decor: [
    {
      questionText: 'What are you looking for?',
      options: [
        { text: 'Decorative accent piece', categoryIds: [] },
        { text: 'Storage / functional decor', categoryIds: [] },
        { text: 'Seating / poufs', categoryIds: [] },
        { text: 'Shelving / display', categoryIds: [] },
      ],
    },
    {
      questionText: 'Interior style?',
      options: [
        { text: 'Scandinavian / minimal', categoryIds: [] },
        { text: 'Rustic / farmhouse', categoryIds: [] },
        { text: 'Boho / eclectic', categoryIds: [] },
        { text: 'Contemporary / urban', categoryIds: [] },
      ],
    },
    {
      questionText: 'Material preference?',
      options: [
        { text: 'Wood / reclaimed wood', categoryIds: [] },
        { text: 'Metal / industrial', categoryIds: [] },
        { text: 'Wicker / cane / rattan', categoryIds: [] },
        { text: 'Mixed materials', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which space is this for?',
      options: [
        { text: 'Living room', categoryIds: [] },
        { text: 'Bedroom', categoryIds: [] },
        { text: 'Balcony / outdoor', categoryIds: [] },
        { text: 'Office / workspace', categoryIds: [] },
      ],
    },
  ],

  fashion_accessories: [
    {
      questionText: 'What accessory are you looking for?',
      options: [
        { text: 'Hair accessories', categoryIds: [] },
        { text: 'Belts / waist accessories', categoryIds: [] },
        { text: 'Sunglasses / eyewear', categoryIds: [] },
        { text: 'Scarves / stoles', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & classic', categoryIds: [] },
        { text: 'Trendy & statement', categoryIds: [] },
        { text: 'Boho & earthy', categoryIds: [] },
        { text: 'Sporty & casual', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Everyday / casual', categoryIds: [] },
        { text: 'Office / work', categoryIds: [] },
        { text: 'Party / event', categoryIds: [] },
        { text: 'Festival / ethnic', categoryIds: [] },
      ],
    },
    {
  questionText: 'Colour preference?',
  options: [
    { text: 'Neutrals & nude tones', categoryIds: [] },
    { text: 'Pastels', categoryIds: [] },
    { text: 'Bold & vibrant', categoryIds: [] },
    { text: 'Dark & moody', categoryIds: [] },
  ],
},
  ],

  handbag_brand: [
    {
      questionText: 'What bag are you looking for?',
      options: [
        { text: 'Tote / shoulder bag', categoryIds: [] },
        { text: 'Sling / crossbody', categoryIds: [] },
        { text: 'Clutch / potli', categoryIds: [] },
        { text: 'Backpack', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Everyday use', categoryIds: [] },
        { text: 'Work / college', categoryIds: [] },
        { text: 'Party / event', categoryIds: [] },
        { text: 'Wedding / festive', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & structured', categoryIds: [] },
        { text: 'Boho & textured', categoryIds: [] },
        { text: 'Bold & colourful', categoryIds: [] },
        { text: 'Ethnic / embroidered', categoryIds: [] },
      ],
    },
    {
      questionText: 'Material preference?',
      options: [
        { text: 'Vegan leather', categoryIds: [] },
        { text: 'Fabric / canvas', categoryIds: [] },
        { text: 'Jute / natural fibre', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
  ],

  bridal_accessories: [
    {
      questionText: 'Which bridal accessory are you looking for?',
      options: [
        { text: 'Maang tikka / matha patti', categoryIds: [] },
        { text: 'Nath / nose ring', categoryIds: [] },
        { text: 'Haath phool / bajuband', categoryIds: [] },
        { text: 'Full bridal set', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which function is it for?',
      options: [
        { text: 'Wedding ceremony', categoryIds: [] },
        { text: 'Engagement', categoryIds: [] },
        { text: 'Mehendi / haldi', categoryIds: [] },
        { text: 'Reception', categoryIds: [] },
      ],
    },
    {
      questionText: 'Finish preference?',
      options: [
        { text: 'Gold / kundan', categoryIds: [] },
        { text: 'Silver / oxidised', categoryIds: [] },
        { text: 'Polki / meenakari', categoryIds: [] },
        { text: 'Pearl / floral', categoryIds: [] },
      ],
    },
    {
      questionText: 'Outfit colour to match?',
      options: [
        { text: 'Red / maroon', categoryIds: [] },
        { text: 'Pink / peach', categoryIds: [] },
        { text: 'Green / teal', categoryIds: [] },
        { text: 'Other — I\'ll share details', categoryIds: [] },
      ],
    },
  ],

  custom_footwear: [
    {
      questionText: 'What type of footwear are you looking for?',
      options: [
        { text: 'Bridal / ethnic heels', categoryIds: [] },
        { text: 'Flats / juttis', categoryIds: [] },
        { text: 'Casual / everyday', categoryIds: [] },
        { text: 'Kolhapuri / handcrafted', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Wedding / festive', categoryIds: [] },
        { text: 'Everyday / casual', categoryIds: [] },
        { text: 'Office / formal', categoryIds: [] },
        { text: 'Party / event', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Embroidered / embellished', categoryIds: [] },
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Bold & colourful', categoryIds: [] },
        { text: 'Classic leather look', categoryIds: [] },
      ],
    },
    {
      questionText: 'Heel height preference?',
      options: [
        { text: 'Flat / no heel', categoryIds: [] },
        { text: 'Low heel (1–2 inch)', categoryIds: [] },
        { text: 'Medium (2–3 inch)', categoryIds: [] },
        { text: 'High heel (3+ inch)', categoryIds: [] },
      ],
    },
  ],

  watch_accessories: [
    {
      questionText: 'What are you looking for?',
      options: [
        { text: 'Watch strap / band', categoryIds: [] },
        { text: 'Watch case / cover', categoryIds: [] },
        { text: 'Jewellery to pair with watch', categoryIds: [] },
        { text: 'Watch as a gift', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Classic & minimal', categoryIds: [] },
        { text: 'Sporty & casual', categoryIds: [] },
        { text: 'Luxury & formal', categoryIds: [] },
        { text: 'Trendy & fun', categoryIds: [] },
      ],
    },
    {
      questionText: 'Who is it for?',
      options: [
        { text: 'Myself', categoryIds: [] },
        { text: 'Partner', categoryIds: [] },
        { text: 'Friend / family', categoryIds: [] },
        { text: 'Corporate gift', categoryIds: [] },
      ],
    },
    {
  questionText: 'Strap / material preference?',
  options: [
    { text: 'Leather', categoryIds: [] },
    { text: 'Metal / stainless steel', categoryIds: [] },
    { text: 'Silicone / sport', categoryIds: [] },
    { text: 'Fabric / NATO strap', categoryIds: [] },
  ],
},
  ],

  dessert_business: [
    {
      questionText: 'What dessert are you craving?',
      options: [
        { text: 'Chocolate-based', categoryIds: [] },
        { text: 'Fruit & cream', categoryIds: [] },
        { text: 'Cheesecake / mousse', categoryIds: [] },
        { text: 'Traditional / Indian sweets', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday / celebration', categoryIds: [] },
        { text: 'Gifting / hamper', categoryIds: [] },
        { text: 'Everyday treat', categoryIds: [] },
        { text: 'Corporate / bulk order', categoryIds: [] },
      ],
    },
    {
      questionText: 'Serving preference?',
      options: [
        { text: 'Individual portions', categoryIds: [] },
        { text: 'Jar / cup dessert', categoryIds: [] },
        { text: 'Party tray / bulk', categoryIds: [] },
        { text: 'Gift box', categoryIds: [] },
      ],
    },
    {
      questionText: 'Any dietary preference?',
      options: [
        { text: 'No preference', categoryIds: [] },
        { text: 'Eggless', categoryIds: [] },
        { text: 'Sugar-free / low sugar', categoryIds: [] },
        { text: 'Vegan', categoryIds: [] },
      ],
    },
  ],

  donut_shop: [
    {
      questionText: 'What flavour are you in the mood for?',
      options: [
        { text: 'Classic glazed', categoryIds: [] },
        { text: 'Chocolate / nutella', categoryIds: [] },
        { text: 'Fruity / berry', categoryIds: [] },
        { text: 'Exotic / unique flavours', categoryIds: [] },
      ],
    },
    {
      questionText: 'What are you ordering for?',
      options: [
        { text: 'Myself / everyday treat', categoryIds: [] },
        { text: 'Birthday / celebration', categoryIds: [] },
        { text: 'Party / bulk order', categoryIds: [] },
        { text: 'Gift box', categoryIds: [] },
      ],
    },
    {
      questionText: 'Topping preference?',
      options: [
        { text: 'Sprinkles & funfetti', categoryIds: [] },
        { text: 'Drizzle & glaze', categoryIds: [] },
        { text: 'Filled / stuffed', categoryIds: [] },
        { text: 'Minimal / simple', categoryIds: [] },
      ],
    },
    {
      questionText: 'How many are you ordering?',
      options: [
        { text: '1–3 (just for me)', categoryIds: [] },
        { text: 'Half dozen (6)', categoryIds: [] },
        { text: 'Full dozen (12)', categoryIds: [] },
        { text: 'Bulk / custom quantity', categoryIds: [] },
      ],
    },
  ],

  macaron_business: [
    {
      questionText: 'What flavour family do you prefer?',
      options: [
        { text: 'Classic (vanilla, chocolate, pistachio)', categoryIds: [] },
        { text: 'Fruity (raspberry, lemon, mango)', categoryIds: [] },
        { text: 'Floral (rose, lavender)', categoryIds: [] },
        { text: 'Indulgent (salted caramel, nutella)', categoryIds: [] },
      ],
    },
    {
      questionText: 'What are you ordering for?',
      options: [
        { text: 'Personal treat', categoryIds: [] },
        { text: 'Gifting / hamper', categoryIds: [] },
        { text: 'Wedding / event favour', categoryIds: [] },
        { text: 'Corporate gift', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour / aesthetic preference?',
      options: [
        { text: 'Pastel & soft', categoryIds: [] },
        { text: 'Bold & vibrant', categoryIds: [] },
        { text: 'White & minimal', categoryIds: [] },
        { text: 'Custom colour theme', categoryIds: [] },
      ],
    },
    {
      questionText: 'Box size?',
      options: [
        { text: 'Small (4–6 pieces)', categoryIds: [] },
        { text: 'Medium (9–12 pieces)', categoryIds: [] },
        { text: 'Large (16–24 pieces)', categoryIds: [] },
        { text: 'Bulk / event order', categoryIds: [] },
      ],
    },
  ],

  mithai_sweets: [
    {
      questionText: 'What type of mithai are you looking for?',
      options: [
        { text: 'Classic (ladoo, barfi, halwa)', categoryIds: [] },
        { text: 'Bengali sweets (rasgulla, sandesh)', categoryIds: [] },
        { text: 'Dry fruit / premium sweets', categoryIds: [] },
        { text: 'Sugar-free / diabetic-friendly', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Festival / puja', categoryIds: [] },
        { text: 'Wedding / celebration', categoryIds: [] },
        { text: 'Gifting / return gifts', categoryIds: [] },
        { text: 'Everyday / personal', categoryIds: [] },
      ],
    },
    {
      questionText: 'Packaging preference?',
      options: [
        { text: 'Simple / loose packing', categoryIds: [] },
        { text: 'Gift box', categoryIds: [] },
        { text: 'Luxury box / premium', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
    {
      questionText: 'Quantity?',
      options: [
        { text: 'Small box (250–500g)', categoryIds: [] },
        { text: 'Medium box (500g–1kg)', categoryIds: [] },
        { text: 'Large / bulk order', categoryIds: [] },
      ],
    },
  ],

  gift_hamper: [
    {
      questionText: 'Who is the hamper for?',
      options: [
        { text: 'Partner / spouse', categoryIds: [] },
        { text: 'Friend / best friend', categoryIds: [] },
        { text: 'Family member', categoryIds: [] },
        { text: 'Corporate / client', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday', categoryIds: [] },
        { text: 'Festival (Diwali / Eid / Christmas)', categoryIds: [] },
        { text: 'Wedding / baby shower', categoryIds: [] },
        { text: 'Thank you / appreciation', categoryIds: [] },
      ],
    },
    {
      questionText: 'What type of hamper?',
      options: [
        { text: 'Snacks & treats', categoryIds: [] },
        { text: 'Skincare / self-care', categoryIds: [] },
        { text: 'Personalised / custom items', categoryIds: [] },
        { text: 'Mixed / surprise', categoryIds: [] },
      ],
    },
    {
  questionText: 'Packaging preference?',
  options: [
    { text: 'Classic gift box', categoryIds: [] },
    { text: 'Luxury / premium box', categoryIds: [] },
    { text: 'Wicker basket', categoryIds: [] },
    { text: 'Eco-friendly / sustainable', categoryIds: [] },
  ],
},
  ],

  festival_gifts: [
    {
      questionText: 'Which festival are you shopping for?',
      options: [
        { text: 'Diwali', categoryIds: [] },
        { text: 'Eid / Raksha Bandhan', categoryIds: [] },
        { text: 'Christmas / New Year', categoryIds: [] },
        { text: 'Other / not occasion-specific', categoryIds: [] },
      ],
    },
    {
      questionText: 'Who is the gift for?',
      options: [
        { text: 'Family', categoryIds: [] },
        { text: 'Friends', categoryIds: [] },
        { text: 'Colleagues / clients', categoryIds: [] },
        { text: 'Everyone — bulk gifting', categoryIds: [] },
      ],
    },
    {
      questionText: 'Gift type preference?',
      options: [
        { text: 'Sweets & edibles', categoryIds: [] },
        { text: 'Decor & home items', categoryIds: [] },
        { text: 'Personalised / custom', categoryIds: [] },
        { text: 'Hamper / gift box', categoryIds: [] },
      ],
    },
    {
  questionText: 'Packaging preference?',
  options: [
    { text: 'Simple wrap', categoryIds: [] },
    { text: 'Gift box', categoryIds: [] },
    { text: 'Potli / fabric bag', categoryIds: [] },
    { text: 'No preference', categoryIds: [] },
  ],
},
  ],

  rakhi_business: [
    {
      questionText: 'What type of rakhi are you looking for?',
      options: [
        { text: 'Traditional / thread rakhi', categoryIds: [] },
        { text: 'Designer / embellished rakhi', categoryIds: [] },
        { text: 'Personalised / name rakhi', categoryIds: [] },
        { text: 'Kids / cartoon rakhi', categoryIds: [] },
      ],
    },
    {
      questionText: 'Do you want a rakhi set?',
      options: [
        { text: 'Just the rakhi', categoryIds: [] },
        { text: 'Rakhi + roli / chawal', categoryIds: [] },
        { text: 'Full gift hamper with sweets', categoryIds: [] },
        { text: 'Bhaiya-bhabhi set', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & elegant', categoryIds: [] },
        { text: 'Heavy / designer', categoryIds: [] },
        { text: 'Cute & colourful', categoryIds: [] },
        { text: 'Spiritual / traditional', categoryIds: [] },
      ],
    },
    {
      questionText: 'Quantity?',
      options: [
        { text: '1 rakhi', categoryIds: [] },
        { text: '2–5 rakhis', categoryIds: [] },
        { text: '5+ (bulk / gifting)', categoryIds: [] },
      ],
    },
  ],

  diwali_hamper: [
    {
      questionText: 'Who are you gifting the hamper to?',
      options: [
        { text: 'Family', categoryIds: [] },
        { text: 'Friends', categoryIds: [] },
        { text: 'Colleagues / corporate', categoryIds: [] },
        { text: 'Clients / business partners', categoryIds: [] },
      ],
    },
    {
      questionText: 'What should the hamper include?',
      options: [
        { text: 'Sweets & dry fruits', categoryIds: [] },
        { text: 'Decor & diyas', categoryIds: [] },
        { text: 'Skincare & wellness', categoryIds: [] },
        { text: 'Mixed surprise items', categoryIds: [] },
      ],
    },
    {
      questionText: 'Packaging preference?',
      options: [
        { text: 'Standard gift box', categoryIds: [] },
        { text: 'Luxury / premium box', categoryIds: [] },
        { text: 'Tray with wrapping', categoryIds: [] },
        { text: 'Eco-friendly packaging', categoryIds: [] },
      ],
    },
    {
  questionText: 'Quantity needed?',
  options: [
    { text: 'Just 1–2 hampers', categoryIds: [] },
    { text: '5–15 hampers', categoryIds: [] },
    { text: '15–50 hampers', categoryIds: [] },
    { text: '50+ (bulk order)', categoryIds: [] },
  ],
},
  ],

  scrapbook: [
    {
      questionText: 'What is the scrapbook for?',
      options: [
        { text: 'Couple / relationship memories', categoryIds: [] },
        { text: 'Birthday / friendship', categoryIds: [] },
        { text: 'Travel memories', categoryIds: [] },
        { text: 'Family / baby memories', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Cute & pastel', categoryIds: [] },
        { text: 'Vintage / rustic', categoryIds: [] },
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Colourful & playful', categoryIds: [] },
      ],
    },
    {
      questionText: 'Size preference?',
      options: [
        { text: 'Mini / pocket size', categoryIds: [] },
        { text: 'A5 / medium', categoryIds: [] },
        { text: 'A4 / large', categoryIds: [] },
      ],
    },
    {
      questionText: 'Do you want it personalised?',
      options: [
        { text: 'Yes — with names / dates', categoryIds: [] },
        { text: 'Yes — with photos printed', categoryIds: [] },
        { text: 'Semi-DIY (I\'ll fill it)', categoryIds: [] },
        { text: 'Fully made by you', categoryIds: [] },
      ],
    },
  ],

  memory_album: [
    {
      questionText: 'What is the memory album for?',
      options: [
        { text: 'Wedding / couple', categoryIds: [] },
        { text: 'Baby / first year', categoryIds: [] },
        { text: 'Birthday / milestone', categoryIds: [] },
        { text: 'Friendship / group memories', categoryIds: [] },
      ],
    },
    {
      questionText: 'Album style?',
      options: [
        { text: 'Classic photo book', categoryIds: [] },
        { text: 'Handmade / scrapbook style', categoryIds: [] },
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Themed / story-based', categoryIds: [] },
      ],
    },
    {
      questionText: 'How many photos approximately?',
      options: [
        { text: 'Up to 20', categoryIds: [] },
        { text: '20 – 50', categoryIds: [] },
        { text: '50 – 100', categoryIds: [] },
        { text: '100+', categoryIds: [] },
      ],
    },
    {
      questionText: 'Do you want personalised text / captions?',
      options: [
        { text: 'Yes — I\'ll share the text', categoryIds: [] },
        { text: 'Yes — please write for me', categoryIds: [] },
        { text: 'Photos only, no text', categoryIds: [] },
      ],
    },
  ],

  handmade_toys: [
    {
      questionText: 'What age group is the toy for?',
      options: [
        { text: 'Baby (0–2 years)', categoryIds: [] },
        { text: 'Toddler (2–5 years)', categoryIds: [] },
        { text: 'Kids (5–10 years)', categoryIds: [] },
        { text: 'Collector / adult', categoryIds: [] },
      ],
    },
    {
      questionText: 'What type of toy?',
      options: [
        { text: 'Soft toy / plushie', categoryIds: [] },
        { text: 'Wooden / educational', categoryIds: [] },
        { text: 'Doll / figurine', categoryIds: [] },
        { text: 'Activity / sensory toy', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Birthday gift', categoryIds: [] },
        { text: 'Baby shower gift', categoryIds: [] },
        { text: 'Everyday play', categoryIds: [] },
        { text: 'Keepsake / collection', categoryIds: [] },
      ],
    },
    {
      questionText: 'Any theme preference?',
      options: [
        { text: 'Animals / nature', categoryIds: [] },
        { text: 'Characters / cartoon', categoryIds: [] },
        { text: 'Food / fantasy', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
  ],

  pet_accessories: [
    {
      questionText: 'What pet is this for?',
      options: [
        { text: 'Dog', categoryIds: [] },
        { text: 'Cat', categoryIds: [] },
        { text: 'Bird', categoryIds: [] },
        { text: 'Other / small pet', categoryIds: [] },
      ],
    },
    {
      questionText: 'What accessory are you looking for?',
      options: [
        { text: 'Collar / leash / harness', categoryIds: [] },
        { text: 'Clothing / costume', categoryIds: [] },
        { text: 'Toys / chews', categoryIds: [] },
        { text: 'Bed / mat / carrier', categoryIds: [] },
      ],
    },
    {
      questionText: 'Pet size?',
      options: [
        { text: 'Tiny / teacup', categoryIds: [] },
        { text: 'Small', categoryIds: [] },
        { text: 'Medium', categoryIds: [] },
        { text: 'Large', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Cute & colourful', categoryIds: [] },
        { text: 'Minimal & neutral', categoryIds: [] },
        { text: 'Personalised / name tag', categoryIds: [] },
        { text: 'Matching with owner', categoryIds: [] },
      ],
    },
  ],

  acrylic_art: [
    {
      questionText: 'What acrylic piece are you looking for?',
      options: [
        { text: 'Painting / wall art', categoryIds: [] },
        { text: 'Jewellery / accessories', categoryIds: [] },
        { text: 'Decor / gift item', categoryIds: [] },
        { text: 'Custom portrait', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Abstract / fluid art', categoryIds: [] },
        { text: 'Realistic / detailed', categoryIds: [] },
        { text: 'Floral / nature', categoryIds: [] },
        { text: 'Geometric / modern', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour mood?',
      options: [
        { text: 'Bold & vibrant', categoryIds: [] },
        { text: 'Pastel & soft', categoryIds: [] },
        { text: 'Dark & moody', categoryIds: [] },
        { text: 'Earthy & neutral', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Home styling', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Office / workspace', categoryIds: [] },
        { text: 'Collection / display', categoryIds: [] },
      ],
    },
  ],

  handmade_stationery: [
    {
      questionText: 'What stationery are you looking for?',
      options: [
        { text: 'Notebooks / journals', categoryIds: [] },
        { text: 'Greeting cards', categoryIds: [] },
        { text: 'Stickers / washi tape', categoryIds: [] },
        { text: 'Planners / organisers', categoryIds: [] },
      ],
    },
    {
      questionText: 'Aesthetic preference?',
      options: [
        { text: 'Cute & kawaii', categoryIds: [] },
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Vintage / retro', categoryIds: [] },
        { text: 'Floral & botanical', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal use / journaling', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Office / work', categoryIds: [] },
        { text: 'Kids / school', categoryIds: [] },
      ],
    },
    {
      questionText: 'Personalisation needed?',
      options: [
        { text: 'Yes — name / initials', categoryIds: [] },
        { text: 'Yes — custom message', categoryIds: [] },
        { text: 'No — ready-made is fine', categoryIds: [] },
      ],
    },
  ],

  phone_case: [
    {
      questionText: 'What phone model do you have?',
      options: [
        { text: 'iPhone', categoryIds: [] },
        { text: 'Samsung', categoryIds: [] },
        { text: 'OnePlus / Realme / Oppo', categoryIds: [] },
        { text: 'Other Android', categoryIds: [] },
      ],
    },
    {
      questionText: 'What design style do you prefer?',
      options: [
        { text: 'Floral & pretty', categoryIds: [] },
        { text: 'Minimal & aesthetic', categoryIds: [] },
        { text: 'Bold & colourful', categoryIds: [] },
        { text: 'Personalised / custom', categoryIds: [] },
      ],
    },
    {
      questionText: 'Case type preference?',
      options: [
        { text: 'Transparent with print', categoryIds: [] },
        { text: 'Solid colour / matte', categoryIds: [] },
        { text: 'Glitter / shimmer', categoryIds: [] },
        { text: '3D / raised elements', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal use', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Matching with friend / partner', categoryIds: [] },
      ],
    },
  ],

  tumbler_mug: [
    {
      questionText: 'What type of product are you looking for?',
      options: [
        { text: 'Coffee mug', categoryIds: [] },
        { text: 'Tumbler / travel cup', categoryIds: [] },
        { text: 'Water bottle', categoryIds: [] },
        { text: 'Glass / sipper', categoryIds: [] },
      ],
    },
    {
      questionText: 'Design preference?',
      options: [
        { text: 'Name / initials', categoryIds: [] },
        { text: 'Quotes / text', categoryIds: [] },
        { text: 'Illustration / art', categoryIds: [] },
        { text: 'Photo print', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style vibe?',
      options: [
        { text: 'Cute & pastel', categoryIds: [] },
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Bold & expressive', categoryIds: [] },
        { text: 'Dark & moody', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Daily personal use', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Office use', categoryIds: [] },
        { text: 'Corporate / bulk gifting', categoryIds: [] },
      ],
    },
  ],

  keychain: [
    {
      questionText: 'What keychain type are you looking for?',
      options: [
        { text: 'Name / initial keychain', categoryIds: [] },
        { text: 'Photo keychain', categoryIds: [] },
        { text: 'Character / cute keychain', categoryIds: [] },
        { text: 'Couple / matching keychains', categoryIds: [] },
      ],
    },
    {
      questionText: 'Material preference?',
      options: [
        { text: 'Acrylic', categoryIds: [] },
        { text: 'Resin', categoryIds: [] },
        { text: 'Leather / faux leather', categoryIds: [] },
        { text: 'Metal / engraved', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal use', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Return gift / bulk', categoryIds: [] },
        { text: 'Valentine\'s / friendship day', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Cute & fun', categoryIds: [] },
        { text: 'Minimal & elegant', categoryIds: [] },
        { text: 'Bold & colourful', categoryIds: [] },
        { text: 'Sentimental / personalised', categoryIds: [] },
      ],
    },
  ],

  fridge_magnet: [
    {
      questionText: 'What magnet design are you looking for?',
      options: [
        { text: 'City / travel souvenir', categoryIds: [] },
        { text: 'Personalised / name', categoryIds: [] },
        { text: 'Photo magnet', categoryIds: [] },
        { text: 'Cute / fun illustration', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Home use / collection', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Return gift / bulk order', categoryIds: [] },
        { text: 'Wedding / event favour', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Colourful & playful', categoryIds: [] },
        { text: 'Vintage / retro', categoryIds: [] },
        { text: 'Artistic / illustrated', categoryIds: [] },
      ],
    },
    {
      questionText: 'Quantity?',
      options: [
        { text: '1–3 pieces', categoryIds: [] },
        { text: '5–10 pieces', categoryIds: [] },
        { text: '10–25 pieces', categoryIds: [] },
        { text: '25+ (bulk)', categoryIds: [] },
      ],
    },
  ],

  wedding_favors: [
    {
      questionText: 'What type of wedding favour?',
      options: [
        { text: 'Edible / food items', categoryIds: [] },
        { text: 'Utility / usable item', categoryIds: [] },
        { text: 'Decorative / aesthetic', categoryIds: [] },
        { text: 'Personalised / custom', categoryIds: [] },
      ],
    },
    {
      questionText: 'Who are the guests?',
      options: [
        { text: 'All ages / mixed', categoryIds: [] },
        { text: 'Mainly women', categoryIds: [] },
        { text: 'Corporate / formal', categoryIds: [] },
        { text: 'Kids & family', categoryIds: [] },
      ],
    },
    {
  questionText: 'Do you want personalisation?',
  options: [
    { text: 'Yes — names / date', categoryIds: [] },
    { text: 'Yes — custom message', categoryIds: [] },
    { text: 'No — standard is fine', categoryIds: [] },
  ],
},
    {
      questionText: 'Quantity needed?',
      options: [
        { text: 'Under 50', categoryIds: [] },
        { text: '50 – 150', categoryIds: [] },
        { text: '150 – 300', categoryIds: [] },
        { text: '300+', categoryIds: [] },
      ],
    },
  ],

  kids_accessories: [
    {
      questionText: 'What accessory are you looking for?',
      options: [
        { text: 'Hair clips / bands / bows', categoryIds: [] },
        { text: 'Bags / backpacks', categoryIds: [] },
        { text: 'Jewellery / bracelets', categoryIds: [] },
        { text: 'Headbands / crowns', categoryIds: [] },
      ],
    },
    {
      questionText: 'Age group?',
      options: [
        { text: 'Baby (0–2 years)', categoryIds: [] },
        { text: 'Toddler (2–5 years)', categoryIds: [] },
        { text: 'Kids (5–10 years)', categoryIds: [] },
        { text: 'Tween (10–13 years)', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Cute & colourful', categoryIds: [] },
        { text: 'Floral & pretty', categoryIds: [] },
        { text: 'Character / themed', categoryIds: [] },
        { text: 'Minimal & neutral', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Everyday use', categoryIds: [] },
        { text: 'Birthday party', categoryIds: [] },
        { text: 'Festival / special occasion', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
      ],
    },
  ],

  baby_gifts: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Baby shower', categoryIds: [] },
        { text: 'Newborn / birth gift', categoryIds: [] },
        { text: 'First birthday', categoryIds: [] },
        { text: 'Naming ceremony', categoryIds: [] },
      ],
    },
    {
      questionText: 'Baby\'s gender?',
      options: [
        { text: 'Girl', categoryIds: [] },
        { text: 'Boy', categoryIds: [] },
        { text: 'Neutral / don\'t know yet', categoryIds: [] },
      ],
    },
    {
      questionText: 'What type of gift?',
      options: [
        { text: 'Clothing / outfit', categoryIds: [] },
        { text: 'Soft toy / plushie', categoryIds: [] },
        { text: 'Personalised keepsake', categoryIds: [] },
        { text: 'Gift hamper / set', categoryIds: [] },
      ],
    },
    {
  questionText: 'Personalisation needed?',
  options: [
    { text: 'Yes — baby\'s name', categoryIds: [] },
    { text: 'Yes — birth date / details', categoryIds: [] },
    { text: 'No — ready-made is fine', categoryIds: [] },
  ],
},
  ],

  custom_led_gifts: [
    {
      questionText: 'What LED gift are you looking for?',
      options: [
        { text: 'LED name / letter sign', categoryIds: [] },
        { text: 'Photo LED frame / lamp', categoryIds: [] },
        { text: 'LED neon sign', categoryIds: [] },
        { text: 'LED gift box / surprise', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday', categoryIds: [] },
        { text: 'Anniversary / Valentine\'s', categoryIds: [] },
        { text: 'Wedding / engagement', categoryIds: [] },
        { text: 'Just because / no occasion', categoryIds: [] },
      ],
    },
    {
      questionText: 'Who is it for?',
      options: [
        { text: 'Partner / spouse', categoryIds: [] },
        { text: 'Friend / best friend', categoryIds: [] },
        { text: 'Family member', categoryIds: [] },
        { text: 'For my own home', categoryIds: [] },
      ],
    },
    {
      questionText: 'Light colour preference?',
      options: [
        { text: 'Warm white', categoryIds: [] },
        { text: 'Cool white', categoryIds: [] },
        { text: 'Colour-changing / RGB', categoryIds: [] },
        { text: 'Custom colour', categoryIds: [] },
      ],
    },
  ],

  handmade_perfume: [
    {
      questionText: 'What scent family do you prefer?',
      options: [
        { text: 'Floral (rose, jasmine, lavender)', categoryIds: [] },
        { text: 'Woody & musky (oud, sandalwood)', categoryIds: [] },
        { text: 'Fresh & citrus (bergamot, lemon)', categoryIds: [] },
        { text: 'Sweet & gourmand (vanilla, caramel)', categoryIds: [] },
      ],
    },
    {
      questionText: 'When do you wear perfume most?',
      options: [
        { text: 'Everyday / office', categoryIds: [] },
        { text: 'Evening / date night', categoryIds: [] },
        { text: 'Special occasions', categoryIds: [] },
        { text: 'All the time — I love fragrance!', categoryIds: [] },
      ],
    },
    {
      questionText: 'Longevity preference?',
      options: [
        { text: 'Light & subtle (EDT)', categoryIds: [] },
        { text: 'Moderate lasting (EDP)', categoryIds: [] },
        { text: 'Long-lasting & strong', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
    {
      questionText: 'Is this for yourself or gifting?',
      options: [
        { text: 'For myself', categoryIds: [] },
        { text: 'Gift for someone', categoryIds: [] },
        { text: 'Both / undecided', categoryIds: [] },
      ],
    },
  ],

  organic_beauty: [
    {
      questionText: 'What is your skin type?',
      options: [
        { text: 'Dry & sensitive', categoryIds: [] },
        { text: 'Oily & acne-prone', categoryIds: [] },
        { text: 'Normal / combination', categoryIds: [] },
        { text: 'Mature / ageing', categoryIds: [] },
      ],
    },
    {
      questionText: 'What product are you looking for?',
      options: [
        { text: 'Face care (serum / moisturiser)', categoryIds: [] },
        { text: 'Hair care (oil / mask)', categoryIds: [] },
        { text: 'Body care (scrub / butter)', categoryIds: [] },
        { text: 'Full skincare set', categoryIds: [] },
      ],
    },
    {
      questionText: 'Any ingredient preference?',
      options: [
        { text: 'Ayurvedic / herbal', categoryIds: [] },
        { text: 'Vitamin C / brightening', categoryIds: [] },
        { text: 'Rose / floral extracts', categoryIds: [] },
        { text: 'No specific preference', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is your main concern?',
      options: [
        { text: 'Acne & blemishes', categoryIds: [] },
        { text: 'Dullness & uneven tone', categoryIds: [] },
        { text: 'Dryness & hydration', categoryIds: [] },
        { text: 'Anti-ageing / fine lines', categoryIds: [] },
      ],
    },
  ],

  handmade_bags: [
    {
      questionText: 'What type of bag are you looking for?',
      options: [
        { text: 'Tote bag', categoryIds: [] },
        { text: 'Sling / crossbody', categoryIds: [] },
        { text: 'Clutch / pouch', categoryIds: [] },
        { text: 'Backpack', categoryIds: [] },
      ],
    },
    {
      questionText: 'Material preference?',
      options: [
        { text: 'Fabric / canvas', categoryIds: [] },
        { text: 'Jute / natural fibre', categoryIds: [] },
        { text: 'Crochet / knit', categoryIds: [] },
        { text: 'Leather / vegan leather', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Boho & earthy', categoryIds: [] },
        { text: 'Minimal & structured', categoryIds: [] },
        { text: 'Bold & printed', categoryIds: [] },
        { text: 'Ethnic / embroidered', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Everyday / casual use', categoryIds: [] },
        { text: 'Work / college', categoryIds: [] },
        { text: 'Beach / travel', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
      ],
    },
  ],

  beaded_jewellery: [
    {
      questionText: 'What beaded piece are you looking for?',
      options: [
        { text: 'Bracelet / anklet', categoryIds: [] },
        { text: 'Necklace', categoryIds: [] },
        { text: 'Earrings', categoryIds: [] },
        { text: 'Full set', categoryIds: [] },
      ],
    },
    {
      questionText: 'Bead type preference?',
      options: [
        { text: 'Crystal / glass beads', categoryIds: [] },
        { text: 'Natural stone / gemstone', categoryIds: [] },
        { text: 'Seed beads / miyuki', categoryIds: [] },
        { text: 'Pearl / shell', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style vibe?',
      options: [
        { text: 'Boho & layered', categoryIds: [] },
        { text: 'Minimal & dainty', categoryIds: [] },
        { text: 'Colourful & fun', categoryIds: [] },
        { text: 'Elegant & classic', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Everyday wear', categoryIds: [] },
        { text: 'Festival / ethnic', categoryIds: [] },
        { text: 'Beach / vacation', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
      ],
    },
  ],

  silver_jewellery: [
    {
      questionText: 'What silver piece are you looking for?',
      options: [
        { text: 'Ring', categoryIds: [] },
        { text: 'Earrings', categoryIds: [] },
        { text: 'Necklace / pendant', categoryIds: [] },
        { text: 'Bracelet / bangle', categoryIds: [] },
      ],
    },
    {
      questionText: 'Finish preference?',
      options: [
        { text: 'Polished / shiny', categoryIds: [] },
        { text: 'Oxidised / antique', categoryIds: [] },
        { text: 'Matte', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Traditional & ethnic', categoryIds: [] },
        { text: 'Statement & bold', categoryIds: [] },
        { text: 'Delicate & layered', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Everyday / gifting', categoryIds: [] },
        { text: 'Wedding / festive', categoryIds: [] },
        { text: 'Office / formal', categoryIds: [] },
        { text: 'Special milestone', categoryIds: [] },
      ],
    },
  ],

  bridal_jewellery_rental: [
    {
      questionText: 'Which function is the jewellery for?',
      options: [
        { text: 'Wedding ceremony', categoryIds: [] },
        { text: 'Reception', categoryIds: [] },
        { text: 'Engagement / roka', categoryIds: [] },
        { text: 'Mehendi / sangeet', categoryIds: [] },
      ],
    },
    {
      questionText: 'What set are you looking for?',
      options: [
        { text: 'Full bridal set (necklace + earrings + maang tikka)', categoryIds: [] },
        { text: 'Necklace & earrings only', categoryIds: [] },
        { text: 'Statement earrings only', categoryIds: [] },
        { text: 'Bangles / haath phool / other', categoryIds: [] },
      ],
    },
    {
      questionText: 'Finish preference?',
      options: [
        { text: 'Gold / kundan', categoryIds: [] },
        { text: 'Polki / meenakari', categoryIds: [] },
        { text: 'Silver / oxidised', categoryIds: [] },
        { text: 'Pearl / floral', categoryIds: [] },
      ],
    },
    {
      questionText: 'Outfit colour to coordinate?',
      options: [
        { text: 'Red / maroon', categoryIds: [] },
        { text: 'Pink / peach', categoryIds: [] },
        { text: 'Green / teal', categoryIds: [] },
        { text: 'Ivory / pastel', categoryIds: [] },
      ],
    },
  ],

  artificial_flower_decor: [
    {
      questionText: 'What floral decor are you looking for?',
      options: [
        { text: 'Flower arrangement / centrepiece', categoryIds: [] },
        { text: 'Garland / string of flowers', categoryIds: [] },
        { text: 'Wall hanging / floral panel', categoryIds: [] },
        { text: 'Wreath / door decor', categoryIds: [] },
      ],
    },
    {
      questionText: 'Where will it be placed?',
      options: [
        { text: 'Living room', categoryIds: [] },
        { text: 'Bedroom / dressing area', categoryIds: [] },
        { text: 'Event / wedding decor', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Romantic / pink & white', categoryIds: [] },
        { text: 'Boho & wildflower', categoryIds: [] },
        { text: 'Tropical & vibrant', categoryIds: [] },
        { text: 'Minimal & green', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette?',
      options: [
        { text: 'Pastels & blush', categoryIds: [] },
        { text: 'White & green', categoryIds: [] },
        { text: 'Bold & vibrant', categoryIds: [] },
        { text: 'Match my home theme', categoryIds: [] },
      ],
    },
  ],

  festive_decor: [
    {
      questionText: 'Which festival are you decorating for?',
      options: [
        { text: 'Diwali', categoryIds: [] },
        { text: 'Navratri / Durga Puja', categoryIds: [] },
        { text: 'Christmas / New Year', categoryIds: [] },
        { text: 'Other / general festive', categoryIds: [] },
      ],
    },
    {
      questionText: 'What decor items are you looking for?',
      options: [
        { text: 'Diyas / candles / lanterns', categoryIds: [] },
        { text: 'Torans / door hangings', categoryIds: [] },
        { text: 'Rangoli / floor art', categoryIds: [] },
        { text: 'Full decor set', categoryIds: [] },
      ],
    },
    {
      questionText: 'Decor style preference?',
      options: [
        { text: 'Traditional & vibrant', categoryIds: [] },
        { text: 'Minimal & elegant', categoryIds: [] },
        { text: 'Rustic & earthy', categoryIds: [] },
        { text: 'Glam & golden', categoryIds: [] },
      ],
    },
    {
      questionText: 'Is this for home or gifting?',
      options: [
        { text: 'Home decoration', categoryIds: [] },
        { text: 'Gifting / hamper', categoryIds: [] },
        { text: 'Both', categoryIds: [] },
      ],
    },
  ],

  home_styling: [
    {
      questionText: 'Which space do you want to style?',
      options: [
        { text: 'Living room', categoryIds: [] },
        { text: 'Bedroom', categoryIds: [] },
        { text: 'Kitchen / dining', categoryIds: [] },
        { text: 'Balcony / outdoor', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is your interior style?',
      options: [
        { text: 'Modern & minimal', categoryIds: [] },
        { text: 'Boho & eclectic', categoryIds: [] },
        { text: 'Traditional & ethnic', categoryIds: [] },
        { text: 'Cosy & cottagecore', categoryIds: [] },
      ],
    },
    {
      questionText: 'What do you need most?',
      options: [
        { text: 'Decor accessories / accents', categoryIds: [] },
        { text: 'Textiles (cushions, throws, curtains)', categoryIds: [] },
        { text: 'Art & wall decor', categoryIds: [] },
        { text: 'Full room styling consultation', categoryIds: [] },
      ],
    },
    {
  questionText: 'What is your timeline?',
  options: [
    { text: 'Immediate / ASAP', categoryIds: [] },
    { text: 'Within a month', categoryIds: [] },
    { text: 'Planning ahead (2–3 months)', categoryIds: [] },
    { text: 'Just exploring ideas', categoryIds: [] },
  ],
},
  ],

  diy_craft_kits: [
    {
      questionText: 'What type of DIY kit are you looking for?',
      options: [
        { text: 'Painting / art kit', categoryIds: [] },
        { text: 'Candle / soap making', categoryIds: [] },
        { text: 'Jewellery making', categoryIds: [] },
        { text: 'Resin / clay craft', categoryIds: [] },
      ],
    },
    {
      questionText: 'Who is the kit for?',
      options: [
        { text: 'Myself — I love crafting', categoryIds: [] },
        { text: 'Kids / beginners', categoryIds: [] },
        { text: 'Gift for a creative friend', categoryIds: [] },
        { text: 'Group activity / workshop', categoryIds: [] },
      ],
    },
    {
      questionText: 'Skill level?',
      options: [
        { text: 'Complete beginner', categoryIds: [] },
        { text: 'Some craft experience', categoryIds: [] },
        { text: 'Intermediate', categoryIds: [] },
        { text: 'Advanced / hobbyist', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Personal hobby / fun', categoryIds: [] },
        { text: 'Birthday gift', categoryIds: [] },
        { text: 'Kids activity', categoryIds: [] },
        { text: 'Team / group activity', categoryIds: [] },
      ],
    },
  ],

  embroidery_art: [
    {
      questionText: 'What embroidery piece are you looking for?',
      options: [
        { text: 'Framed wall art', categoryIds: [] },
        { text: 'Clothing / patch', categoryIds: [] },
        { text: 'Personalised gift', categoryIds: [] },
        { text: 'Home decor (cushion / hoop)', categoryIds: [] },
      ],
    },
    {
      questionText: 'Design style?',
      options: [
        { text: 'Floral & botanical', categoryIds: [] },
        { text: 'Portrait / custom', categoryIds: [] },
        { text: 'Quote / text', categoryIds: [] },
        { text: 'Abstract / modern', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette?',
      options: [
        { text: 'Soft & pastel', categoryIds: [] },
        { text: 'Neutral & earthy', categoryIds: [] },
        { text: 'Bold & vibrant', categoryIds: [] },
        { text: 'Monochrome / minimal', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Home décor', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Special occasion', categoryIds: [] },
        { text: 'Personal collection', categoryIds: [] },
      ],
    },
  ],

  fabric_painting: [
    {
      questionText: 'What fabric art are you looking for?',
      options: [
        { text: 'Painted saree / dupatta', categoryIds: [] },
        { text: 'Painted tote bag', categoryIds: [] },
        { text: 'Painted cushion / home textile', categoryIds: [] },
        { text: 'Painted canvas / wall art', categoryIds: [] },
      ],
    },
    {
      questionText: 'Design style?',
      options: [
        { text: 'Floral & traditional', categoryIds: [] },
        { text: 'Abstract / contemporary', categoryIds: [] },
        { text: 'Madhubani / folk art', categoryIds: [] },
        { text: 'Custom / personalised', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour mood?',
      options: [
        { text: 'Vibrant & bold', categoryIds: [] },
        { text: 'Pastel & soft', categoryIds: [] },
        { text: 'Earthy & natural', categoryIds: [] },
        { text: 'Monochrome / minimal', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal use / wear', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
        { text: 'Home décor', categoryIds: [] },
        { text: 'Special occasion', categoryIds: [] },
      ],
    },
  ],

  handmade_bookmarks: [
    {
      questionText: 'What type of bookmark?',
      options: [
        { text: 'Tassel bookmark', categoryIds: [] },
        { text: 'Resin / acrylic', categoryIds: [] },
        { text: 'Pressed flower / botanical', categoryIds: [] },
        { text: 'Personalised / name', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style vibe?',
      options: [
        { text: 'Cute & pastel', categoryIds: [] },
        { text: 'Minimal & elegant', categoryIds: [] },
        { text: 'Vintage / bookish', categoryIds: [] },
        { text: 'Bold & colourful', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal use', categoryIds: [] },
        { text: 'Gift for a book lover', categoryIds: [] },
        { text: 'Return gift / bulk', categoryIds: [] },
        { text: 'School / stationery set', categoryIds: [] },
      ],
    },
    {
      questionText: 'Quantity?',
      options: [
        { text: '1–3 pieces', categoryIds: [] },
        { text: '5–10 pieces', categoryIds: [] },
        { text: '10–25 pieces', categoryIds: [] },
        { text: '25+ (bulk)', categoryIds: [] },
      ],
    },
  ],

  miniature_art: [
    {
      questionText: 'What miniature art piece are you looking for?',
      options: [
        { text: 'Miniature painting', categoryIds: [] },
        { text: 'Miniature furniture / room', categoryIds: [] },
        { text: 'Miniature food art', categoryIds: [] },
        { text: 'Custom miniature figurine', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal collection / display', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Home décor accent', categoryIds: [] },
        { text: 'Special occasion keepsake', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Realistic & detailed', categoryIds: [] },
        { text: 'Cute & cartoon-like', categoryIds: [] },
        { text: 'Traditional / cultural', categoryIds: [] },
        { text: 'Fantasy / whimsical', categoryIds: [] },
      ],
    },
    {
      questionText: 'Theme preference?',
      options: [
        { text: 'Nature & garden', categoryIds: [] },
        { text: 'Kitchen / food', categoryIds: [] },
        { text: 'Wedding / couple', categoryIds: [] },
        { text: 'Custom — I\'ll share details', categoryIds: [] },
      ],
    },
  ],

  bottle_art: [
    {
      questionText: 'What bottle art piece are you looking for?',
      options: [
        { text: 'Painted glass bottle / vase', categoryIds: [] },
        { text: 'Personalised message bottle', categoryIds: [] },
        { text: 'Decorative / home accent', categoryIds: [] },
        { text: 'Gift / keepsake bottle', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Floral & hand-painted', categoryIds: [] },
        { text: 'Bohemian / earthy', categoryIds: [] },
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Glam / metallic', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Home décor', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Wedding / event centrepiece', categoryIds: [] },
        { text: 'Collection', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette preference?',
      options: [
        { text: 'Pastel & soft', categoryIds: [] },
        { text: 'Bold & vibrant', categoryIds: [] },
        { text: 'Earthy & neutral', categoryIds: [] },
        { text: 'Gold / metallic tones', categoryIds: [] },
      ],
    },
  ],

  handmade_frames: [
    {
      questionText: 'What type of frame are you looking for?',
      options: [
        { text: 'Photo frame', categoryIds: [] },
        { text: 'Mirror frame', categoryIds: [] },
        { text: 'Multi-photo / collage frame', categoryIds: [] },
        { text: 'Personalised / name frame', categoryIds: [] },
      ],
    },
    {
      questionText: 'Material preference?',
      options: [
        { text: 'Wood / rustic', categoryIds: [] },
        { text: 'Resin / acrylic', categoryIds: [] },
        { text: 'Rope / fabric wrapped', categoryIds: [] },
        { text: 'Mixed material', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Boho / vintage', categoryIds: [] },
        { text: 'Floral / decorative', categoryIds: [] },
        { text: 'Bold & statement', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Home décor', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Wedding / anniversary', categoryIds: [] },
        { text: 'Office / workspace', categoryIds: [] },
      ],
    },
  ],

  couple_gifts: [
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Anniversary', categoryIds: [] },
        { text: 'Valentine\'s Day', categoryIds: [] },
        { text: 'Wedding gift', categoryIds: [] },
        { text: 'Just because / surprise', categoryIds: [] },
      ],
    },
    {
      questionText: 'What type of couple gift?',
      options: [
        { text: 'Personalised keepsake', categoryIds: [] },
        { text: 'Matching accessories', categoryIds: [] },
        { text: 'Photo gift / frame', categoryIds: [] },
        { text: 'Experience / hamper', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Romantic & sentimental', categoryIds: [] },
        { text: 'Cute & fun', categoryIds: [] },
        { text: 'Elegant & minimal', categoryIds: [] },
        { text: 'Bold & expressive', categoryIds: [] },
      ],
    },
    {
  questionText: 'Personalisation preference?',
  options: [
    { text: 'Names / initials', categoryIds: [] },
    { text: 'Photo / portrait', categoryIds: [] },
    { text: 'Custom message / date', categoryIds: [] },
    { text: 'No personalisation needed', categoryIds: [] },
  ],
},
  ],

  anime_merchandise: [
    {
      questionText: 'What merch are you looking for?',
      options: [
        { text: 'Prints / posters', categoryIds: [] },
        { text: 'Stickers / keychains', categoryIds: [] },
        { text: 'Clothing / hoodies', categoryIds: [] },
        { text: 'Figurines / collectibles', categoryIds: [] },
      ],
    },
    {
      questionText: 'Which fandom / genre?',
      options: [
        { text: 'Shonen (Naruto, DBZ, Demon Slayer)', categoryIds: [] },
        { text: 'Shojo / romance', categoryIds: [] },
        { text: 'Isekai / fantasy', categoryIds: [] },
        { text: 'Custom / my favourite', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal collection', categoryIds: [] },
        { text: 'Gift for a fan', categoryIds: [] },
        { text: 'Room décor', categoryIds: [] },
        { text: 'Event / cosplay', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Cute & chibi', categoryIds: [] },
        { text: 'Fan art / illustrated', categoryIds: [] },
        { text: 'Minimal / aesthetic', categoryIds: [] },
        { text: 'Bold & graphic', categoryIds: [] },
      ],
    },
  ],

  handmade_plushies: [
    {
      questionText: 'What type of plushie?',
      options: [
        { text: 'Animal / creature', categoryIds: [] },
        { text: 'Food / object plushie', categoryIds: [] },
        { text: 'Custom / portrait plushie', categoryIds: [] },
        { text: 'Character / fandom', categoryIds: [] },
      ],
    },
    {
      questionText: 'What size?',
      options: [
        { text: 'Tiny / keychain size', categoryIds: [] },
        { text: 'Small (palm-sized)', categoryIds: [] },
        { text: 'Medium', categoryIds: [] },
        { text: 'Large / huggable', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal / collection', categoryIds: [] },
        { text: 'Gift for someone special', categoryIds: [] },
        { text: 'Baby / kids gift', categoryIds: [] },
        { text: 'Pet portrait / memorial', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Cute & kawaii', categoryIds: [] },
        { text: 'Realistic / detailed', categoryIds: [] },
        { text: 'Minimal & simple', categoryIds: [] },
        { text: 'Whimsical / fantasy', categoryIds: [] },
      ],
    },
  ],

  wedding_hamper: [
    {
      questionText: 'Who is the hamper for?',
      options: [
        { text: 'Bride & groom (as a gift)', categoryIds: [] },
        { text: 'Wedding guests / return gift', categoryIds: [] },
        { text: 'Bridal party / bridesmaid', categoryIds: [] },
        { text: 'Corporate / client wedding gift', categoryIds: [] },
      ],
    },
    {
      questionText: 'What should the hamper include?',
      options: [
        { text: 'Sweets & edibles', categoryIds: [] },
        { text: 'Skincare & self-care', categoryIds: [] },
        { text: 'Personalised items', categoryIds: [] },
        { text: 'Mixed / curated surprise', categoryIds: [] },
      ],
    },
    {
      questionText: 'Packaging preference?',
      options: [
        { text: 'Elegant gift box', categoryIds: [] },
        { text: 'Luxury / premium packaging', categoryIds: [] },
        { text: 'Tray with wrap', categoryIds: [] },
        { text: 'Eco-friendly / sustainable', categoryIds: [] },
      ],
    },
    {
  questionText: 'Quantity?',
  options: [
    { text: '1–5 hampers', categoryIds: [] },
    { text: '5–20 hampers', categoryIds: [] },
    { text: '20–50 hampers', categoryIds: [] },
    { text: '50+ (bulk)', categoryIds: [] },
  ],
},
  ],

  luxury_gift_box: [
    {
      questionText: 'Who is this luxury gift for?',
      options: [
        { text: 'Partner / spouse', categoryIds: [] },
        { text: 'Parent / senior family member', categoryIds: [] },
        { text: 'Client / corporate', categoryIds: [] },
        { text: 'Best friend / close family', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday / milestone', categoryIds: [] },
        { text: 'Anniversary / wedding', categoryIds: [] },
        { text: 'Festival / corporate gifting', categoryIds: [] },
        { text: 'Just because / appreciation', categoryIds: [] },
      ],
    },
    {
      questionText: 'What should the box include?',
      options: [
        { text: 'Gourmet / artisan food items', categoryIds: [] },
        { text: 'Skincare & wellness', categoryIds: [] },
        { text: 'Personalised keepsakes', categoryIds: [] },
        { text: 'Curated luxury surprise', categoryIds: [] },
      ],
    },
    {
  questionText: 'Presentation preference?',
  options: [
    { text: 'Classic luxury box', categoryIds: [] },
    { text: 'Handcrafted / artisan packaging', categoryIds: [] },
    { text: 'Minimalist / sleek', categoryIds: [] },
    { text: 'Over-the-top / dramatic reveal', categoryIds: [] },
  ],
},
  ],

  car_decor: [
    {
      questionText: 'What car decor are you looking for?',
      options: [
        { text: 'Rear-view mirror hanging', categoryIds: [] },
        { text: 'Dashboard figurine / idol', categoryIds: [] },
        { text: 'Steering wheel cover', categoryIds: [] },
        { text: 'Seat / interior accessory', categoryIds: [] },
      ],
    },
    {
      questionText: 'Theme preference?',
      options: [
        { text: 'Spiritual / deity', categoryIds: [] },
        { text: 'Aesthetic / boho', categoryIds: [] },
        { text: 'Fun / quirky', categoryIds: [] },
        { text: 'Minimal / classy', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal use', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'New car celebration', categoryIds: [] },
        { text: 'Festival / occasion', categoryIds: [] },
      ],
    },
    {
      questionText: 'Material preference?',
      options: [
        { text: 'Crystal / gemstone', categoryIds: [] },
        { text: 'Wood / natural', categoryIds: [] },
        { text: 'Metal', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
  ],

  spiritual_decor: [
    {
      questionText: 'What spiritual decor are you looking for?',
      options: [
        { text: 'Wall hanging / art', categoryIds: [] },
        { text: 'Idol / figurine', categoryIds: [] },
        { text: 'Crystal / gemstone decor', categoryIds: [] },
        { text: 'Incense / ritual accessories', categoryIds: [] },
      ],
    },
    {
      questionText: 'Spiritual tradition / theme?',
      options: [
        { text: 'Hindu / Vedic', categoryIds: [] },
        { text: 'Buddhist / Zen', categoryIds: [] },
        { text: 'Celestial / astrology', categoryIds: [] },
        { text: 'General spiritual / energy', categoryIds: [] },
      ],
    },
    {
      questionText: 'Where will it be placed?',
      options: [
        { text: 'Prayer / puja room', categoryIds: [] },
        { text: 'Living room / entrance', categoryIds: [] },
        { text: 'Bedroom', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Traditional & ornate', categoryIds: [] },
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Rustic & earthy', categoryIds: [] },
        { text: 'Luxurious & detailed', categoryIds: [] },
      ],
    },
  ],

  puja_decor: [
    {
      questionText: 'What puja decor are you looking for?',
      options: [
        { text: 'Puja thali / accessories', categoryIds: [] },
        { text: 'Diyas / candles', categoryIds: [] },
        { text: 'Decorative torans / hangings', categoryIds: [] },
        { text: 'Full puja setup', categoryIds: [] },
      ],
    },
    {
      questionText: 'What occasion is it for?',
      options: [
        { text: 'Daily puja / home mandir', categoryIds: [] },
        { text: 'Diwali / Navratri', categoryIds: [] },
        { text: 'Wedding / gruhapravesh', categoryIds: [] },
        { text: 'Gifting', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Traditional & classic', categoryIds: [] },
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Ornate & decorated', categoryIds: [] },
        { text: 'Eco-friendly / natural', categoryIds: [] },
      ],
    },
    {
      questionText: 'Material preference?',
      options: [
        { text: 'Brass / metal', categoryIds: [] },
        { text: 'Clay / terracotta', categoryIds: [] },
        { text: 'Wood', categoryIds: [] },
        { text: 'No preference', categoryIds: [] },
      ],
    },
  ],

  resin_gifts: [
    {
      questionText: 'What resin gift are you looking for?',
      options: [
        { text: 'Personalised name / initial piece', categoryIds: [] },
        { text: 'Photo resin gift', categoryIds: [] },
        { text: 'Decorative tray / coaster', categoryIds: [] },
        { text: 'Jewellery / wearable', categoryIds: [] },
      ],
    },
    {
      questionText: 'Who is it for?',
      options: [
        { text: 'Partner / spouse', categoryIds: [] },
        { text: 'Friend / best friend', categoryIds: [] },
        { text: 'Family member', categoryIds: [] },
        { text: 'Myself / home', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour / aesthetic?',
      options: [
        { text: 'Pastel & soft', categoryIds: [] },
        { text: 'Ocean / galaxy theme', categoryIds: [] },
        { text: 'Bold & vibrant', categoryIds: [] },
        { text: 'Gold / metallic', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Birthday', categoryIds: [] },
        { text: 'Anniversary / Valentine\'s', categoryIds: [] },
        { text: 'Housewarming', categoryIds: [] },
        { text: 'No occasion / just because', categoryIds: [] },
      ],
    },
  ],

  handmade_trinkets: [
    {
      questionText: 'What type of trinket are you looking for?',
      options: [
        { text: 'Charm / small figurine', categoryIds: [] },
        { text: 'Decorative box / tray', categoryIds: [] },
        { text: 'Wearable / accessory', categoryIds: [] },
        { text: 'Desk / shelf accent', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Cute & whimsical', categoryIds: [] },
        { text: 'Minimal & modern', categoryIds: [] },
        { text: 'Vintage / antique feel', categoryIds: [] },
        { text: 'Quirky & unique', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'Personal collection / display', categoryIds: [] },
        { text: 'Gift', categoryIds: [] },
        { text: 'Home décor', categoryIds: [] },
        { text: 'Return gift / favour', categoryIds: [] },
      ],
    },
    {
  questionText: 'Size preference?',
  options: [
    { text: 'Tiny / miniature', categoryIds: [] },
    { text: 'Small', categoryIds: [] },
    { text: 'Medium', categoryIds: [] },
    { text: 'No preference', categoryIds: [] },
  ],
},
  ],

  aesthetic_lifestyle: [
    {
      questionText: 'What aesthetic are you drawn to?',
      options: [
        { text: 'Cottagecore / cosy', categoryIds: [] },
        { text: 'Dark academia / moody', categoryIds: [] },
        { text: 'Minimal / clean girl', categoryIds: [] },
        { text: 'Y2K / retro', categoryIds: [] },
      ],
    },
    {
      questionText: 'What product type are you looking for?',
      options: [
        { text: 'Room / desk décor', categoryIds: [] },
        { text: 'Stationery / journaling', categoryIds: [] },
        { text: 'Accessories / wearable', categoryIds: [] },
        { text: 'Gift / lifestyle set', categoryIds: [] },
      ],
    },
    {
      questionText: 'Colour palette?',
      options: [
        { text: 'Neutrals & beige', categoryIds: [] },
        { text: 'Pastel & soft pink', categoryIds: [] },
        { text: 'Dark & moody tones', categoryIds: [] },
        { text: 'Bold & eclectic', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is it for?',
      options: [
        { text: 'My own space / use', categoryIds: [] },
        { text: 'Gift for a friend', categoryIds: [] },
        { text: 'Content creation / aesthetic setup', categoryIds: [] },
        { text: 'Just browsing for inspo', categoryIds: [] },
      ],
    },
  ],

  luxury_boutique: [
    {
      questionText: 'What are you shopping for?',
      options: [
        { text: 'Luxury clothing / outfit', categoryIds: [] },
        { text: 'Premium accessories', categoryIds: [] },
        { text: 'Luxury gift for someone', categoryIds: [] },
        { text: 'Exclusive home / lifestyle piece', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Wedding / black-tie event', categoryIds: [] },
        { text: 'Corporate / formal', categoryIds: [] },
        { text: 'Special celebration', categoryIds: [] },
        { text: 'Everyday luxury', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Classic & timeless', categoryIds: [] },
        { text: 'Contemporary & editorial', categoryIds: [] },
        { text: 'Opulent & ornate', categoryIds: [] },
        { text: 'Quiet luxury / minimal', categoryIds: [] },
      ],
    },
    {
  questionText: 'Fabric / material preference?',
  options: [
    { text: 'Silk / pure silk', categoryIds: [] },
    { text: 'Linen / premium cotton', categoryIds: [] },
    { text: 'Velvet / brocade', categoryIds: [] },
    { text: 'No preference — quality matters most', categoryIds: [] },
  ],
},
  ],

  other: [
    {
      questionText: 'What are you looking for?',
      options: [
        { text: 'Something for myself', categoryIds: [] },
        { text: 'A gift for someone', categoryIds: [] },
        { text: 'For a special occasion', categoryIds: [] },
        { text: 'Just browsing', categoryIds: [] },
      ],
    },
    {
      questionText: 'What is the occasion?',
      options: [
        { text: 'Everyday use', categoryIds: [] },
        { text: 'Festival / celebration', categoryIds: [] },
        { text: 'Wedding', categoryIds: [] },
        { text: 'No occasion', categoryIds: [] },
      ],
    },
    {
      questionText: 'Style preference?',
      options: [
        { text: 'Minimal & clean', categoryIds: [] },
        { text: 'Colourful & bold', categoryIds: [] },
        { text: 'Traditional / ethnic', categoryIds: [] },
        { text: 'Modern / trendy', categoryIds: [] },
      ],
    },
    {
  questionText: 'How soon do you need it?',
  options: [
    { text: 'Urgent / within days', categoryIds: [] },
    { text: 'Within a week', categoryIds: [] },
    { text: 'No rush', categoryIds: [] },
    { text: 'Just browsing', categoryIds: [] },
  ],
},
  ],

};