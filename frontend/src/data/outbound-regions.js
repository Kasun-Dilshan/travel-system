import parisImg from '../assets/paris.webp';
import dubaiImg from '../assets/dubai.webp';
import tokyoImg from '../assets/tokyo.webp';
import londonImg from '../assets/london.webp';
import singaporeImg from '../assets/singapore.webp';

/**
 * Outbound destinations hierarchy: Continent → Country.
 * `matchKeys` are used to filter packages that belong to a country.
 */
export const OUTBOUND_CONTINENTS = [
  {
    id: 'asia',
    name: 'Asia',
    description: 'Temples, neon cities, desert luxury, and vibrant food cultures.',
    image: tokyoImg,
    localizations: {
      de: { name: 'Asien', description: 'Tempel, Neonstädte, Wüstenluxus und lebendige Esskultur.' },
      fr: { name: 'Asie', description: 'Temples, villes néon, luxe du désert et cultures culinaires vibrantes.' },
      zh: { name: '亚洲', description: '寺庙、霓虹都市、沙漠奢华与丰富美食文化。' },
      jp: { name: 'アジア', description: '寺院、ネオン都市、砂漠のラグジュアリー、活気ある食文化。' },
      ar: { name: 'آسيا', description: 'معابد ومدن نيون وفخامة صحراوية وثقافات طعام نابضة.' },
      hi: { name: 'एशिया', description: 'मंदिर, नियॉन शहर, रेगिस्तानी लक्ज़री और जीवंत भोजन संस्कृति।' },
    },
    countries: [
      {
        id: 'japan',
        name: 'Japan',
        description: 'Neon streets and ancient culture.',
        fullDescription:
          'Japan blends neon districts like Shibuya and Shinjuku with serene shrines, world-class cuisine, and meticulous design. From cherry blossoms to autumn colors, experience temples, day trips to Hakone or Nikkō, and unforgettable city energy.',
        image: tokyoImg,
        images: [tokyoImg],
        matchKeys: ['japan', 'tokyo', 'osaka', 'kyoto'],
        facts: [
          { label: 'Continent', value: 'Asia' },
          { label: 'Capital', value: 'Tokyo' },
          { label: 'Best time', value: 'Mar–May, Oct–Nov' },
          { label: 'Highlights', value: 'Temples, cuisine, neon cities' },
        ],
        tips: [
          { label: 'Capital', value: 'Tokyo' },
          { label: 'Language', value: 'Japanese' },
          { label: 'Currency', value: 'Japanese Yen' },
          { label: 'Religion', value: 'Shinto and Buddhism' },
          { label: 'Time Zone', value: 'UTC+9' },
          { label: 'Best time', value: 'Mar–May, Oct–Nov' },
        ],
        highlights: [
          {
            id: 'tokyo',
            name: 'Tokyo',
            image: tokyoImg,
            description:
              'One of the world’s main economic centres, Tokyo is the capital city of Japan and a city that presents a different view of itself at every turn. Starkly modern, it becomes a jewel box at night with a glittering display of neon and fluorescent lights. But you can retreat to quiet residential back streets and sculpted gardens and still find the harmony, scale and simplicity the Japanese have prized for centuries. Look down one street and you’ll see nothing but neon and concrete, but around the corner, you may find yourself in the bonsai-lined courtyard of a traditional inn.',
          },
          {
            id: 'mount-fuji',
            name: 'Mount Fuji',
            image: tokyoImg,
            description:
              'This almost perfectly conical volcano is a familiar symbol of Japan and located approximately 100 kilometres southwest of Tokyo. Mount Fuji known as Fuji-san is 3,776 metres high and beautifully snow-capped in winter. Considered as one of Japan’s 3 sacred mountains it has been a known pilgrimage site for centuries. Other scenic areas close to Mount Fuji include Hakone, small mountains with hot spring resorts, forest hiking, and a large lake.',
          },
          {
            id: 'hiroshima',
            name: 'Hiroshima',
            image: tokyoImg,
            description:
              'When the first atomic bomb exploded over Hiroshima on 6 August 1945, the city became an immediate symbol for the horrors of war. Today, Hiroshima has several moving reminders of that day. The centrepiece is the A-Bomb Dome; across the street is Peace Park, where you’ll find the Cenotaph for the Victims and the Atomic Bomb Museum. The most moving monument is the Children’s Peace Memorial, traditionally expressed in the folding of paper cranes.',
          },
          {
            id: 'miyajima',
            name: 'Miyajima Island',
            image: tokyoImg,
            description:
              'The island of Miyajima lies just off the coast from Hiroshima, a short ferry ride away. The main reasons to go are the solitude, the view and the Shrine of Itsukushima, built on wooden piers over the water. The shrine’s torii—the huge gate at the entrance to a Shinto shrine—stands out at the head of a bay; its orange paint, stunning against the blue water, has made this one of the most photographed places in Japan.',
          },
          {
            id: 'kyoto',
            name: 'Kyoto',
            image: tokyoImg,
            description:
              'If you can visit only one city in Japan, Kyoto is the one. This ancient city was the capital of Japan for more than a thousand years and is still considered the country’s spiritual capital. Kyoto is graced with an abundance of temples, palaces, gardens, and museums. At night, stroll through Pontocho, the traditional night-time entertainment spot—one of the most romantic streets in Japan. Fans of Memoirs of a Geisha might like to stroll around the Gion neighbourhood.',
          },
          {
            id: 'tranquil-gardens',
            name: 'Tranquil Gardens',
            image: tokyoImg,
            description:
              'Journey through Japan’s enchanting, serene gardens. Lose yourself in the peaceful embrace of Ritsurin Koen, the nation’s largest and most exquisite garden, with ponds, hills, and lush greenery year-round. Delight in the timeless elegance of Okayama Korakuen, celebrated as one of Japan’s premier gardens. Enjoy a leisurely amble through picturesque Suizenji Garden in Kumamoto, a tranquil sanctuary that beckons travellers with its serene beauty.',
          },
        ],
        localizations: {
          de: {
            name: 'Japan',
            description: 'Neonstraßen und alte Kultur.',
            fullDescription: 'Japan vereint leuchtende Viertel wie Shibuya und Shinjuku mit ruhigen Schreinen, exzellenter Küche und modernem Design.',
            facts: [
              { label: 'Continent', value: 'Asien' },
              { label: 'Capital', value: 'Tokio' },
              { label: 'Best time', value: 'Mar-Mai, Okt-Nov' },
              { label: 'Highlights', value: 'Tempel, Küche, Neonstädte' },
            ],
          },
          fr: {
            name: 'Japon',
            description: 'Rues néon et culture ancienne.',
            fullDescription: 'Le Japon mêle quartiers lumineux, sanctuaires paisibles, gastronomie de haut niveau et design moderne.',
            facts: [
              { label: 'Continent', value: 'Asie' },
              { label: 'Capital', value: 'Tokyo' },
              { label: 'Best time', value: 'mars-mai, oct-nov' },
              { label: 'Highlights', value: 'Temples, cuisine, villes néon' },
            ],
          },
          zh: {
            name: '日本',
            description: '霓虹街区与古老文化并存。',
            fullDescription: '日本融合了涩谷新宿的霓虹活力、宁静神社与高水准美食，四季皆有独特风景。',
            facts: [
              { label: 'Continent', value: '亚洲' },
              { label: 'Capital', value: '东京' },
              { label: 'Best time', value: '3-5月，10-11月' },
              { label: 'Highlights', value: '寺庙，美食，霓虹都市' },
            ],
          },
          jp: {
            name: '日本',
            description: 'ネオン街と伝統文化の融合。',
            fullDescription: '日本は渋谷や新宿のネオン、静かな神社、世界的なグルメが共存する国です。季節ごとの景色も楽しめます。',
            facts: [
              { label: 'Continent', value: 'アジア' },
              { label: 'Capital', value: '東京' },
              { label: 'Best time', value: '3-5月、10-11月' },
              { label: 'Highlights', value: '寺社、グルメ、ネオン都市' },
            ],
          },
          ar: {
            name: 'اليابان',
            description: 'شوارع نيون وثقافة عريقة.',
            fullDescription: 'اليابان تمزج بين أحياء النيون المبهرة والمعابد الهادئة والمطبخ الراقي.',
            facts: [
              { label: 'Continent', value: 'آسيا' },
              { label: 'Capital', value: 'طوكيو' },
              { label: 'Best time', value: 'مارس-مايو، اكتوبر-نوفمبر' },
              { label: 'Highlights', value: 'المعابد، الطعام، مدن النيون' },
            ],
          },
          hi: {
            name: 'जापान',
            description: 'नियॉन गलियां और प्राचीन संस्कृति।',
            fullDescription: 'जापान में शिबुया-शिंजुकु की चमक, शांत मंदिर और शानदार भोजन का अद्भुत मिश्रण है।',
            facts: [
              { label: 'Continent', value: 'एशिया' },
              { label: 'Capital', value: 'टोक्यो' },
              { label: 'Best time', value: 'मार्च-मई, अक्टूबर-नवंबर' },
              { label: 'Highlights', value: 'मंदिर, भोजन, नियॉन शहर' },
            ],
          },
        },
      },
      {
        id: 'uae',
        name: 'United Arab Emirates',
        description: 'Futuristic skylines and desert luxury.',
        fullDescription:
          'The UAE blends ultramodern architecture—Burj Khalifa, Palm Jumeirah—with Arabian heritage. Shop in vast malls, dine on global cuisine, take a desert safari, or relax on pristine beaches. A hub for luxury stays, events, and stopovers.',
        image: dubaiImg,
        images: [dubaiImg],
        matchKeys: ['uae', 'dubai', 'abu dhabi', 'emirates'],
        facts: [
          { label: 'Continent', value: 'Asia' },
          { label: 'Capital', value: 'Abu Dhabi' },
          { label: 'Best time', value: 'Nov–Mar' },
          { label: 'Highlights', value: 'Burj Khalifa, desert safari' },
        ],
        tips: [
          { label: 'Capital', value: 'Abu Dhabi' },
          { label: 'Language', value: 'Arabic' },
          { label: 'Currency', value: 'UAE Dirham' },
          { label: 'Religion', value: 'Islam' },
          { label: 'Time Zone', value: 'UTC+4' },
          { label: 'Best time', value: 'Nov–Mar' },
        ],
        highlights: [
          {
            id: 'dubai',
            name: 'Dubai',
            image: dubaiImg,
            description:
              'Dubai is a city of ambition—home to the Burj Khalifa, Palm Jumeirah, and some of the world’s most striking architecture. Between glittering malls, marina evenings, and desert horizons just beyond the skyline, it offers a polished mix of luxury, culture, and adventure.',
          },
          {
            id: 'desert-safari',
            name: 'Desert Safari',
            image: dubaiImg,
            description:
              'Leave the city behind for golden dunes, sunset views, and classic Arabian hospitality. A desert safari brings dune driving, camel rides, and traditional entertainment under starlit skies—an unforgettable contrast to the ultramodern coast.',
          },
          {
            id: 'abu-dhabi',
            name: 'Abu Dhabi',
            image: dubaiImg,
            description:
              'The capital blends grand mosques, cultural landmarks, and waterfront calm. From the Sheikh Zayed Grand Mosque to Louvre Abu Dhabi and island escapes, Abu Dhabi rewards travellers seeking heritage alongside modern comfort.',
          },
          {
            id: 'marina',
            name: 'Marina & Coast',
            image: dubaiImg,
            description:
              'The UAE’s coastline sparkles with marina promenades, beach clubs, and evening cruises. Stroll waterfront walkways, dine with skyline views, and enjoy the easy luxury that makes this region a favourite stopover and holiday destination.',
          },
        ],
        localizations: {
          de: {
            name: 'Vereinigte Arabische Emirate',
            description: 'Futuristische Skyline und Wüstenluxus.',
            fullDescription: 'Die VAE verbinden ultramoderne Architektur mit arabischem Erbe. Erleben Sie Shopping, internationale Küche und Wüstensafaris.',
            facts: [
              { label: 'Continent', value: 'Asien' },
              { label: 'Capital', value: 'Abu Dhabi' },
              { label: 'Best time', value: 'Nov-Mar' },
              { label: 'Highlights', value: 'Burj Khalifa, Wüstensafari' },
            ],
          },
          fr: {
            name: 'Émirats arabes unis',
            description: 'Horizons futuristes et luxe du désert.',
            fullDescription: 'Les EAU mêlent architecture ultramoderne et héritage arabe. Profitez des centres commerciaux, de la cuisine internationale et des safaris dans le désert.',
            facts: [
              { label: 'Continent', value: 'Asie' },
              { label: 'Capital', value: 'Abou Dabi' },
              { label: 'Best time', value: 'nov-mars' },
              { label: 'Highlights', value: 'Burj Khalifa, safari dans le désert' },
            ],
          },
          zh: {
            name: '阿联酋',
            description: '未来天际线与沙漠奢华。',
            fullDescription: '阿联酋将现代地标与阿拉伯文化融合。可体验大型购物中心、国际美食与沙漠冲沙。',
            facts: [
              { label: 'Continent', value: '亚洲' },
              { label: 'Capital', value: '阿布扎比' },
              { label: 'Best time', value: '11月-3月' },
              { label: 'Highlights', value: '哈利法塔，沙漠冲沙' },
            ],
          },
          jp: {
            name: 'アラブ首長国連邦',
            description: '未来都市の景観と砂漠ラグジュアリー。',
            fullDescription: 'UAEは近代建築とアラビア文化が共存する国です。砂漠サファリやショッピングを満喫できます。',
            facts: [
              { label: 'Continent', value: 'アジア' },
              { label: 'Capital', value: 'アブダビ' },
              { label: 'Best time', value: '11月-3月' },
              { label: 'Highlights', value: 'ブルジュ・ハリファ、砂漠サファリ' },
            ],
          },
          ar: {
            name: 'الإمارات العربية المتحدة',
            description: 'أفق مستقبلي وفخامة الصحراء.',
            fullDescription: 'الإمارات تمزج بين العمارة الحديثة جدا والتراث العربي. يمكنك التسوق وخوض سفاري صحراوية والاسترخاء على الشواطئ.',
            facts: [
              { label: 'Continent', value: 'آسيا' },
              { label: 'Capital', value: 'أبوظبي' },
              { label: 'Best time', value: 'نوفمبر-مارس' },
              { label: 'Highlights', value: 'برج خليفة، سفاري الصحراء' },
            ],
          },
          hi: {
            name: 'संयुक्त अरब अमीरात',
            description: 'भविष्यवादी स्काईलाइन और रेगिस्तानी लक्जरी।',
            fullDescription: 'यूएई में आधुनिक पहचान के साथ अरब विरासत का अनोखा मेल है। यहां लग्जरी स्टे और डेजर्ट सफारी मिलते हैं।',
            facts: [
              { label: 'Continent', value: 'एशिया' },
              { label: 'Capital', value: 'अबू धाबी' },
              { label: 'Best time', value: 'नवंबर-मार्च' },
              { label: 'Highlights', value: 'बुर्ज खलीफा, डेजर्ट सफारी' },
            ],
          },
        },
      },
      {
        id: 'singapore',
        name: 'Singapore',
        description: 'A garden city with vibrant beats.',
        fullDescription:
          'Singapore is a compact city-state of hawker food, Gardens by the Bay, diverse neighborhoods from Chinatown to Little India, and seamless transport. Ideal for families and food lovers, it works as a standalone trip or a gateway to Southeast Asia.',
        image: singaporeImg,
        images: [singaporeImg],
        matchKeys: ['singapore'],
        facts: [
          { label: 'Continent', value: 'Asia' },
          { label: 'Capital', value: 'Singapore' },
          { label: 'Best time', value: 'Year-round (Feb–Apr drier)' },
          { label: 'Highlights', value: 'Gardens, food, Marina Bay' },
        ],
        tips: [
          { label: 'Capital', value: 'Singapore' },
          { label: 'Language', value: 'English, Malay, Mandarin, Tamil' },
          { label: 'Currency', value: 'Singapore Dollar' },
          { label: 'Religion', value: 'Multi-religious' },
          { label: 'Time Zone', value: 'UTC+8' },
          { label: 'Best time', value: 'Year-round' },
        ],
        highlights: [
          {
            id: 'marina-bay',
            name: 'Marina Bay',
            image: singaporeImg,
            description:
              'Marina Bay is Singapore’s iconic waterfront—home to Gardens by the Bay, the Marina Bay Sands skyline, and evening light shows that reflect across the water. It’s the perfect place to feel the city’s futuristic pulse.',
          },
          {
            id: 'hawker-food',
            name: 'Hawker Food',
            image: singaporeImg,
            description:
              'Singapore’s hawker centres are a UNESCO-recognised food culture. From chilli crab and Hainanese chicken rice to laksa and satay, every neighbourhood offers affordable, unforgettable flavours shared at communal tables.',
          },
          {
            id: 'cultural-quarters',
            name: 'Cultural Quarters',
            image: singaporeImg,
            description:
              'Wander Chinatown, Little India, and Kampong Glam to experience Singapore’s multicultural soul. Temples, mosques, shophouses, and street markets sit side by side in a compact, walkable city.',
          },
          {
            id: 'gardens',
            name: 'Garden City',
            image: singaporeImg,
            description:
              'True to its garden-city reputation, Singapore blends parks, waterfront promenades, and vertical greenery into everyday life. From Botanic Gardens to neighbourhood parks, nature is never far from the skyline.',
          },
        ],
        localizations: {
          de: {
            name: 'Singapur',
            description: 'Eine Gartenstadt mit lebendiger Energie.',
            fullDescription: 'Singapur ist kompakt und voller Kontraste: Hawker-Food, Gardens by the Bay, Chinatown und Little India.',
            facts: [
              { label: 'Continent', value: 'Asien' },
              { label: 'Capital', value: 'Singapur' },
              { label: 'Best time', value: 'Ganzjährig (Feb-Apr trockener)' },
              { label: 'Highlights', value: 'Gardens, Streetfood, Marina Bay' },
            ],
          },
          fr: {
            name: 'Singapour',
            description: 'Une ville-jardin au rythme vibrant.',
            fullDescription: 'Singapour est une cité-état moderne, connue pour ses hawker centers, Gardens by the Bay et ses quartiers multiculturels.',
            facts: [
              { label: 'Continent', value: 'Asie' },
              { label: 'Capital', value: 'Singapour' },
              { label: 'Best time', value: "Toute l'année (fév-avr plus sec)" },
              { label: 'Highlights', value: 'Gardens, cuisine, Marina Bay' },
            ],
          },
          zh: {
            name: '新加坡',
            description: '充满活力的花园城市。',
            fullDescription: '新加坡交通便捷，融合多元文化与美食体验。可游览滨海湾花园、牛车水、小印度等地。',
            facts: [
              { label: 'Continent', value: '亚洲' },
              { label: 'Capital', value: '新加坡' },
              { label: 'Best time', value: '全年（2-4月较干燥）' },
              { label: 'Highlights', value: '花园，美食，滨海湾' },
            ],
          },
          jp: {
            name: 'シンガポール',
            description: '活気あふれるガーデンシティ。',
            fullDescription: 'シンガポールはホーカーグルメ、多文化エリア、ガーデンズ・バイ・ザ・ベイが魅力の都市国家です。',
            facts: [
              { label: 'Continent', value: 'アジア' },
              { label: 'Capital', value: 'シンガポール' },
              { label: 'Best time', value: '通年（2-4月は比較的乾季）' },
              { label: 'Highlights', value: 'ガーデンズ、グルメ、マリーナベイ' },
            ],
          },
          ar: {
            name: 'سنغافورة',
            description: 'مدينة حدائق بنبض حيوي.',
            fullDescription: 'سنغافورة مدينة حديثة ومضغوطة تشتهر بالطعام المتنوع وحدائق الخليج والأحياء الثقافية المختلفة.',
            facts: [
              { label: 'Continent', value: 'آسيا' },
              { label: 'Capital', value: 'سنغافورة' },
              { label: 'Best time', value: 'طوال العام (فبراير-ابريل اكثر جفافا)' },
              { label: 'Highlights', value: 'الحدائق، الطعام، مارينا باي' },
            ],
          },
          hi: {
            name: 'सिंगापुर',
            description: 'एक गार्डन सिटी, जीवंत अनुभवों के साथ।',
            fullDescription: 'सिंगापुर एक कॉम्पैक्ट और आधुनिक शहर-देश है, जहां हॉकर्स फूड और गार्डन्स बाय द बे खास आकर्षण हैं।',
            facts: [
              { label: 'Continent', value: 'एशिया' },
              { label: 'Capital', value: 'सिंगापुर' },
              { label: 'Best time', value: 'साल भर (फरवरी-अप्रैल अपेक्षाकृत सूखा)' },
              { label: 'Highlights', value: 'गार्डन्स, भोजन, मरीना बे' },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'europe',
    name: 'Europe',
    description: 'Historic capitals, romance, art, and timeless landmarks.',
    image: parisImg,
    localizations: {
      de: { name: 'Europa', description: 'Historische Hauptstädte, Romantik, Kunst und zeitlose Wahrzeichen.' },
      fr: { name: 'Europe', description: 'Capitales historiques, romance, art et monuments intemporels.' },
      zh: { name: '欧洲', description: '历史名城、浪漫氛围、艺术与永恒地标。' },
      jp: { name: 'ヨーロッパ', description: '歴史ある首都、ロマンス、芸術、時代を超えた名所。' },
      ar: { name: 'أوروبا', description: 'عواصم تاريخية ورومانسية وفن ومعالم خالدة.' },
      hi: { name: 'यूरोप', description: 'ऐतिहासिक राजधानियाँ, रोमांस, कला और कालातीत स्थल।' },
    },
    countries: [
      {
        id: 'france',
        name: 'France',
        description: 'The land of light, romance, and cuisine.',
        fullDescription:
          'France needs little introduction: Paris with the Eiffel Tower and the Louvre, café terraces, and the Seine at sunset. Beyond the capital, discover art, fashion, countryside charm, and world-famous cuisine—from bistros to Michelin stars.',
        image: parisImg,
        images: [parisImg],
        matchKeys: ['france', 'paris', 'lyon', 'nice'],
        facts: [
          { label: 'Continent', value: 'Europe' },
          { label: 'Capital', value: 'Paris' },
          { label: 'Best time', value: 'Apr–Jun, Sep–Oct' },
          { label: 'Highlights', value: 'Louvre, Eiffel Tower, cuisine' },
        ],
        tips: [
          { label: 'Capital', value: 'Paris' },
          { label: 'Language', value: 'French' },
          { label: 'Currency', value: 'Euro' },
          { label: 'Religion', value: 'Predominantly Christian' },
          { label: 'Time Zone', value: 'UTC+1' },
          { label: 'Best time', value: 'Apr–Jun, Sep–Oct' },
        ],
        highlights: [
          {
            id: 'paris',
            name: 'Paris',
            image: parisImg,
            description:
              'Paris is the city of light—cafés, boulevards, and landmarks that need little introduction. From the Eiffel Tower and the Louvre to Seine sunsets and Montmartre lanes, every corner offers a postcard moment.',
          },
          {
            id: 'louvre',
            name: 'Louvre & Museums',
            image: parisImg,
            description:
              'France’s museum culture is world-class. The Louvre alone could fill days, while the Orsay, Rodin, and countless smaller galleries reveal Impressionism, sculpture, and contemporary art across the capital and beyond.',
          },
          {
            id: 'cuisine',
            name: 'French Cuisine',
            image: parisImg,
            description:
              'From neighbourhood bistros to Michelin stars, French cuisine is a highlight in its own right. Fresh bread, cheese markets, wine tasting, and long café lunches are part of the everyday rhythm of travel here.',
          },
          {
            id: 'countryside',
            name: 'Countryside Charm',
            image: parisImg,
            description:
              'Beyond Paris, France opens into châteaux, vineyards, and coastal villages. Day trips and regional stays reveal slower rhythms—lavender fields, river towns, and markets that feel worlds away from the capital.',
          },
        ],
        localizations: {
          de: {
            name: 'Frankreich',
            description: 'Das Land des Lichts, der Romantik und der Küche.',
            fullDescription: 'Frankreich begeistert mit Paris, Eiffelturm, Louvre und französischer Küche von Bistros bis Fine Dining.',
            facts: [
              { label: 'Continent', value: 'Europa' },
              { label: 'Capital', value: 'Paris' },
              { label: 'Best time', value: 'Apr-Jun, Sep-Okt' },
              { label: 'Highlights', value: 'Louvre, Eiffelturm, Küche' },
            ],
          },
          fr: {
            name: 'France',
            description: 'Le pays de la lumière, du romantisme et de la gastronomie.',
            fullDescription: 'La France réunit la Tour Eiffel, le Louvre, les terrasses de café et une cuisine mondialement renommée.',
            facts: [
              { label: 'Continent', value: 'Europe' },
              { label: 'Capital', value: 'Paris' },
              { label: 'Best time', value: 'avr-juin, sep-oct' },
              { label: 'Highlights', value: 'Louvre, Tour Eiffel, cuisine' },
            ],
          },
          zh: {
            name: '法国',
            description: '光之国、浪漫与美食之地。',
            fullDescription: '法国拥有埃菲尔铁塔、卢浮宫、塞纳河黄昏和迷人的咖啡文化，以及享誉世界的法式美食。',
            facts: [
              { label: 'Continent', value: '欧洲' },
              { label: 'Capital', value: '巴黎' },
              { label: 'Best time', value: '4-6月，9-10月' },
              { label: 'Highlights', value: '卢浮宫，埃菲尔铁塔，美食' },
            ],
          },
          jp: {
            name: 'フランス',
            description: '光とロマンス、美食の国。',
            fullDescription: 'フランスはエッフェル塔、ルーヴル、セーヌ川の夕景、カフェ文化が魅力です。',
            facts: [
              { label: 'Continent', value: 'ヨーロッパ' },
              { label: 'Capital', value: 'パリ' },
              { label: 'Best time', value: '4-6月、9-10月' },
              { label: 'Highlights', value: 'ルーヴル、エッフェル塔、美食' },
            ],
          },
          ar: {
            name: 'فرنسا',
            description: 'بلاد النور والرومانسية والمطبخ.',
            fullDescription: 'فرنسا تجمع بين برج إيفل ومتحف اللوفر وضفاف السين والمطبخ الفرنسي الشهير.',
            facts: [
              { label: 'Continent', value: 'أوروبا' },
              { label: 'Capital', value: 'باريس' },
              { label: 'Best time', value: 'ابريل-يونيو، سبتمبر-اكتوبر' },
              { label: 'Highlights', value: 'اللوفر، برج إيفل، المطبخ' },
            ],
          },
          hi: {
            name: 'फ्रांस',
            description: 'रोशनी, रोमांस और भोजन की भूमि।',
            fullDescription: 'फ्रांस में एफिल टॉवर, लौवर, सीन नदी के किनारे कैफे और शानदार फ्रेंच भोजन मिलता है।',
            facts: [
              { label: 'Continent', value: 'यूरोप' },
              { label: 'Capital', value: 'पेरिस' },
              { label: 'Best time', value: 'अप्रैल-जून, सितंबर-अक्टूबर' },
              { label: 'Highlights', value: 'लौवर, एफिल टॉवर, भोजन' },
            ],
          },
        },
      },
      {
        id: 'united-kingdom',
        name: 'United Kingdom',
        description: 'Historic landmarks and modern energy.',
        fullDescription:
          'The United Kingdom offers royal palaces, the Thames, West End theatre, and museums—many of which are free. From Borough Market to Notting Hill, historic pubs to skyline views from the Shard, London and beyond suit first visits and return trips alike.',
        image: londonImg,
        images: [londonImg],
        matchKeys: ['united kingdom', 'uk', 'london', 'england', 'britain'],
        facts: [
          { label: 'Continent', value: 'Europe' },
          { label: 'Capital', value: 'London' },
          { label: 'Best time', value: 'May–Sep' },
          { label: 'Highlights', value: 'Museums, theatre, markets' },
        ],
        tips: [
          { label: 'Capital', value: 'London' },
          { label: 'Language', value: 'English' },
          { label: 'Currency', value: 'Pound Sterling' },
          { label: 'Religion', value: 'Multi-faith' },
          { label: 'Time Zone', value: 'UTC+0' },
          { label: 'Best time', value: 'May–Sep' },
        ],
        highlights: [
          {
            id: 'london',
            name: 'London',
            image: londonImg,
            description:
              'London blends royal pageantry with creative energy—Buckingham Palace, the Thames, West End theatre, and neighbourhoods that each feel like a city of their own. Historic pubs and skyline views from the Shard sit side by side.',
          },
          {
            id: 'museums',
            name: 'World-Class Museums',
            image: londonImg,
            description:
              'Many of the UK’s finest museums are free to enter. The British Museum, National Gallery, Tate Modern, and Natural History Museum make culture an easy daily highlight for first-time visitors and return travellers alike.',
          },
          {
            id: 'markets',
            name: 'Markets & Neighbourhoods',
            image: londonImg,
            description:
              'From Borough Market to Notting Hill and Camden, London’s markets and neighbourhoods reward wandering. Street food, vintage finds, and local character make every afternoon feel like a discovery.',
          },
          {
            id: 'theatre',
            name: 'Theatre & Nightlife',
            image: londonImg,
            description:
              'West End shows, comedy clubs, and riverside evenings give London nights a special charge. Catch a musical, stroll the South Bank, or settle into a historic pub for a classic British evening.',
          },
        ],
        localizations: {
          de: {
            name: 'Vereinigtes Königreich',
            description: 'Historische Wahrzeichen und moderne Energie.',
            fullDescription: 'Das Vereinigte Königreich bietet Königspaläste, Museen, Theater und lebendige Viertel von London bis darüber hinaus.',
            facts: [
              { label: 'Continent', value: 'Europa' },
              { label: 'Capital', value: 'London' },
              { label: 'Best time', value: 'Mai-Sep' },
              { label: 'Highlights', value: 'Museen, Theater, Märkte' },
            ],
          },
          fr: {
            name: 'Royaume-Uni',
            description: 'Monuments historiques et énergie moderne.',
            fullDescription: 'Le Royaume-Uni combine palais royaux, théâtres du West End, musées renommés et quartiers vibrants.',
            facts: [
              { label: 'Continent', value: 'Europe' },
              { label: 'Capital', value: 'Londres' },
              { label: 'Best time', value: 'mai-sept' },
              { label: 'Highlights', value: 'Musées, théâtre, marchés' },
            ],
          },
          zh: {
            name: '英国',
            description: '历史地标与现代活力并存。',
            fullDescription: '英国拥有皇室建筑、泰晤士河、西区剧院和众多博物馆，传统与现代完美融合。',
            facts: [
              { label: 'Continent', value: '欧洲' },
              { label: 'Capital', value: '伦敦' },
              { label: 'Best time', value: '5月-9月' },
              { label: 'Highlights', value: '博物馆，剧院，市集' },
            ],
          },
          jp: {
            name: 'イギリス',
            description: '歴史的ランドマークと現代的な活気。',
            fullDescription: 'イギリスは王室文化、テムズ川、劇場、美術館が魅力です。歴史地区から最新スポットまで多彩な体験ができます。',
            facts: [
              { label: 'Continent', value: 'ヨーロッパ' },
              { label: 'Capital', value: 'ロンドン' },
              { label: 'Best time', value: '5月-9月' },
              { label: 'Highlights', value: '博物館、劇場、マーケット' },
            ],
          },
          ar: {
            name: 'المملكة المتحدة',
            description: 'معالم تاريخية وطاقة عصرية.',
            fullDescription: 'المملكة المتحدة تجمع بين القصور الملكية والمسارح والمتاحف والأسواق المتنوعة.',
            facts: [
              { label: 'Continent', value: 'أوروبا' },
              { label: 'Capital', value: 'لندن' },
              { label: 'Best time', value: 'مايو-سبتمبر' },
              { label: 'Highlights', value: 'متاحف، مسارح، أسواق' },
            ],
          },
          hi: {
            name: 'यूनाइटेड किंगडम',
            description: 'ऐतिहासिक पहचान और आधुनिक ऊर्जा।',
            fullDescription: 'यूके में शाही महल, थेम्स नदी, वेस्ट एंड थिएटर और विश्वस्तरीय म्यूजियम का शानदार मेल है।',
            facts: [
              { label: 'Continent', value: 'यूरोप' },
              { label: 'Capital', value: 'लंदन' },
              { label: 'Best time', value: 'मई-सितंबर' },
              { label: 'Highlights', value: 'म्यूजियम, थिएटर, मार्केट' },
            ],
          },
        },
      },
    ],
  },
];

export function getContinentById(continentId, continents = OUTBOUND_CONTINENTS) {
  return (continents || OUTBOUND_CONTINENTS).find((c) => c.id === continentId) || null;
}

export function getCountryById(continentId, countryId, continents = OUTBOUND_CONTINENTS) {
  const continent = getContinentById(continentId, continents);
  if (!continent) return { continent: null, country: null };
  const country = continent.countries.find((c) => c.id === countryId) || null;
  return { continent, country };
}

/**
 * Prefer API catalog; fill empty rich fields (images/highlights/localizations)
 * from the static seed when IDs match.
 */
export function mergeContinentsWithFallback(apiContinents, fallback = OUTBOUND_CONTINENTS) {
  if (!Array.isArray(apiContinents) || apiContinents.length === 0) {
    return fallback;
  }

  return apiContinents.map((region) => {
    const fbRegion = fallback.find((r) => r.id === region.id);
    return {
      ...(fbRegion || {}),
      ...region,
      image: region.image || fbRegion?.image || '',
      description: region.description || fbRegion?.description || '',
      localizations: {
        ...(fbRegion?.localizations || {}),
        ...(region.localizations || {}),
      },
      countries: (region.countries || []).map((country) => {
        const fbCountry = fbRegion?.countries?.find((c) => c.id === country.id);
        const pickArray = (apiVal, fbVal) =>
          (Array.isArray(apiVal) && apiVal.length > 0) ? apiVal : (fbVal || []);
        return {
          ...(fbCountry || {}),
          ...country,
          image: country.image || fbCountry?.image || '',
          images: pickArray(country.images, fbCountry?.images),
          matchKeys: pickArray(country.matchKeys, fbCountry?.matchKeys),
          facts: pickArray(country.facts, fbCountry?.facts),
          tips: pickArray(country.tips, fbCountry?.tips),
          highlights: pickArray(country.highlights, fbCountry?.highlights),
          description: country.description || fbCountry?.description || '',
          fullDescription: country.fullDescription || fbCountry?.fullDescription || '',
          localizations: {
            ...(fbCountry?.localizations || {}),
            ...(country.localizations || {}),
          },
        };
      }),
    };
  });
}

/** Match outbound packages to a country (prefer saved countryId; fall back to matchKeys). */
export function filterPackagesByCountry(packages, country, continentId = null) {
  if (!country || !packages?.length) return [];
  const keys = (country.matchKeys || []).map((k) => k.toLowerCase());
  return packages.filter((pkg) => {
    const pkgCountryId = String(pkg.countryId || '').trim();
    if (pkgCountryId) {
      if (pkgCountryId !== country.id) return false;
      const pkgContinentId = String(pkg.continentId || '').trim();
      if (continentId && pkgContinentId && pkgContinentId !== continentId) return false;
      return true;
    }
    // Legacy / demo packages without an explicit destination link
    if (!keys.length) return false;
    const haystack = `${pkg.title || ''} ${pkg.description || ''}`.toLowerCase();
    return keys.some((key) => haystack.includes(key));
  });
}

export function mergeOutboundPackages(apiPackages = [], demoPackages = []) {
  const merged = [];
  const seenIds = new Set();
  const seenTitles = new Set();
  const pushUnique = (list) => {
    list.forEach((pkg) => {
      const idKey = String(pkg._id ?? pkg.id ?? '');
      const titleKey = String(pkg.title || '').trim().toLowerCase();
      if (idKey && seenIds.has(idKey)) return;
      if (titleKey && seenTitles.has(titleKey)) return;
      if (idKey) seenIds.add(idKey);
      if (titleKey) seenTitles.add(titleKey);
      merged.push(pkg);
    });
  };
  pushUnique(apiPackages);
  pushUnique(demoPackages);
  return merged;
}
