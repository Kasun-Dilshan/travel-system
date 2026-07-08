import parisImg from '../assets/paris.webp';
import dubaiImg from '../assets/dubai.webp';
import tokyoImg from '../assets/tokyo.webp';
import londonImg from '../assets/london.webp';
import singaporeImg from '../assets/singapore.webp';

export const OUTBOUND_DESTINATIONS = [
  {
    id: 'paris',
    name: 'Paris',
    description: 'The city of light and romance.',
    fullDescription:
      'Paris needs little introduction: the Eiffel Tower, the Louvre, café terraces, and the Seine at sunset. Stroll Montmartre, browse the Marais, and savor French cuisine from bistros to Michelin stars. Art, fashion, and history converge in one of the world’s most visited capitals.',
    image: parisImg,
    images: [parisImg],
    facts: [
      { label: 'Country', value: 'France' },
      { label: 'Best time', value: 'Apr–Jun, Sep–Oct' },
      { label: 'Highlights', value: 'Louvre, Eiffel Tower' },
    ],
    localizations: {
      de: {
        name: 'Paris',
        description: 'Die Stadt des Lichts und der Romantik.',
        fullDescription: 'Paris begeistert mit Eiffelturm, Louvre, charmanten Cafes und Spaziergangen an der Seine. Entdecken Sie Montmartre, den Marais und die franzosische Kuche von Bistros bis Fine Dining.',
        facts: [
          { label: 'Country', value: 'Frankreich' },
          { label: 'Best time', value: 'Apr-Jun, Sep-Okt' },
          { label: 'Highlights', value: 'Louvre, Eiffelturm' },
        ],
      },
      fr: {
        name: 'Paris',
        description: 'La ville lumiere et du romantisme.',
        fullDescription: 'Paris reunit la Tour Eiffel, le Louvre, les terrasses de cafe et la Seine au coucher du soleil. Flanez a Montmartre, explorez le Marais et savourez la cuisine francaise.',
        facts: [
          { label: 'Country', value: 'France' },
          { label: 'Best time', value: 'avr-juin, sep-oct' },
          { label: 'Highlights', value: 'Louvre, Tour Eiffel' },
        ],
      },
      zh: {
        name: '巴黎',
        description: '光之城与浪漫之都。',
        fullDescription: '巴黎拥有埃菲尔铁塔、卢浮宫、塞纳河黄昏和迷人的咖啡文化。漫步蒙马特与玛黑区，体验法式美食与艺术氛围。',
        facts: [
          { label: 'Country', value: '法国' },
          { label: 'Best time', value: '4-6月，9-10月' },
          { label: 'Highlights', value: '卢浮宫，埃菲尔铁塔' },
        ],
      },
      jp: {
        name: 'パリ',
        description: '光とロマンスの街。',
        fullDescription: 'パリはエッフェル塔、ルーヴル、セーヌ川の夕景、カフェ文化が魅力です。モンマルトルやマレ地区を歩き、フランス料理と芸術を満喫できます。',
        facts: [
          { label: 'Country', value: 'フランス' },
          { label: 'Best time', value: '4-6月、9-10月' },
          { label: 'Highlights', value: 'ルーヴル、エッフェル塔' },
        ],
      },
      ar: {
        name: 'باريس',
        description: 'مدينة النور والرومانسية.',
        fullDescription: 'باريس تجمع بين برج إيفل ومتحف اللوفر وضفاف السين والمقاهي الانيقة. استمتع بجولات في مونمارتر ولو ماريه وتذوق المطبخ الفرنسي.',
        facts: [
          { label: 'Country', value: 'فرنسا' },
          { label: 'Best time', value: 'ابريل-يونيو، سبتمبر-اكتوبر' },
          { label: 'Highlights', value: 'اللوفر، برج إيفل' },
        ],
      },
      hi: {
        name: 'पेरिस',
        description: 'रोशनी और रोमांस का शहर।',
        fullDescription: 'पेरिस में एफिल टॉवर, लौवर, सीन नदी के किनारे कैफे और शानदार कला संस्कृति मिलती है। मॉन्टमार्ट्रे और मरैस की सैर के साथ फ्रेंच भोजन का आनंद लें।',
        facts: [
          { label: 'Country', value: 'फ्रांस' },
          { label: 'Best time', value: 'अप्रैल-जून, सितंबर-अक्टूबर' },
          { label: 'Highlights', value: 'लौवर, एफिल टॉवर' },
        ],
      },
    },
  },
  {
    id: 'dubai',
    name: 'Dubai',
    description: 'Futuristic skylines and desert luxury.',
    fullDescription:
      'Dubai blends ultramodern architecture—Burj Khalifa, Palm Jumeirah—with Arabian heritage. Shop in vast malls, dine on global cuisine, take a desert safari, or relax on pristine beaches. It is a hub for luxury stays, events, and stopovers between continents.',
    image: dubaiImg,
    images: [dubaiImg],
    facts: [
      { label: 'Country', value: 'UAE' },
      { label: 'Best time', value: 'Nov–Mar' },
      { label: 'Highlights', value: 'Burj Khalifa, desert safari' },
    ],
    localizations: {
      de: {
        name: 'Dubai',
        description: 'Futuristische Skyline und Wustenluxus.',
        fullDescription: 'Dubai verbindet ultramoderne Architektur wie Burj Khalifa und Palm Jumeirah mit arabischem Erbe. Erleben Sie Shopping, internationale Kuche, Wustensafaris und erstklassige Strande.',
        facts: [
          { label: 'Country', value: 'VAE' },
          { label: 'Best time', value: 'Nov-Mar' },
          { label: 'Highlights', value: 'Burj Khalifa, Wustensafari' },
        ],
      },
      fr: {
        name: 'Dubai',
        description: 'Horizons futuristes et luxe du desert.',
        fullDescription: 'Dubai mele architecture ultramoderne et heritage arabe. Profitez des centres commerciaux geants, de la cuisine internationale, d un safari dans le desert et de plages impeccables.',
        facts: [
          { label: 'Country', value: 'EAU' },
          { label: 'Best time', value: 'nov-mars' },
          { label: 'Highlights', value: 'Burj Khalifa, safari dans le desert' },
        ],
      },
      zh: {
        name: '迪拜',
        description: '未来天际线与沙漠奢华。',
        fullDescription: '迪拜将现代地标（哈利法塔、棕榈岛）与阿拉伯文化融合。可体验大型购物中心、国际美食、沙漠冲沙与高端海滩度假。',
        facts: [
          { label: 'Country', value: '阿联酋' },
          { label: 'Best time', value: '11月-3月' },
          { label: 'Highlights', value: '哈利法塔，沙漠冲沙' },
        ],
      },
      jp: {
        name: 'ドバイ',
        description: '未来都市の景観と砂漠ラグジュアリー。',
        fullDescription: 'ドバイはブルジュ・ハリファやパーム・ジュメイラなどの近代建築とアラビア文化が共存する都市です。砂漠サファリやショッピング、ビーチを満喫できます。',
        facts: [
          { label: 'Country', value: 'UAE' },
          { label: 'Best time', value: '11月-3月' },
          { label: 'Highlights', value: 'ブルジュ・ハリファ、砂漠サファリ' },
        ],
      },
      ar: {
        name: 'دبي',
        description: 'افق مستقبلي وفخامة الصحراء.',
        fullDescription: 'دبي تمزج بين العمارة الحديثة جدا والتراث العربي. يمكنك التسوق في المولات الكبرى، وتذوق مطابخ عالمية، وخوض سفاري صحراوية، والاسترخاء على الشواطئ.',
        facts: [
          { label: 'Country', value: 'الامارات' },
          { label: 'Best time', value: 'نوفمبر-مارس' },
          { label: 'Highlights', value: 'برج خليفة، سفاري الصحراء' },
        ],
      },
      hi: {
        name: 'दुबई',
        description: 'भविष्यवादी स्काईलाइन और रेगिस्तानी लक्जरी।',
        fullDescription: 'दुबई में बुर्ज खलीफा और पाम जुमेराह जैसी आधुनिक पहचान के साथ अरब विरासत का अनोखा मेल है। यहां लग्जरी स्टे, डेजर्ट सफारी, शॉपिंग और बीच अनुभव मिलते हैं।',
        facts: [
          { label: 'Country', value: 'यूएई' },
          { label: 'Best time', value: 'नवंबर-मार्च' },
          { label: 'Highlights', value: 'बुर्ज खलीफा, डेजर्ट सफारी' },
        ],
      },
    },
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    description: 'Neon streets and ancient culture.',
    fullDescription:
      'Tokyo is a mesmerizing mix of neon districts like Shibuya and Shinjuku, serene shrines, world-class sushi, and meticulous design. Day-trip to Hakone or Nikkō, explore museums and arcades, and experience seasons from cherry blossoms to autumn colors.',
    image: tokyoImg,
    images: [tokyoImg],
    facts: [
      { label: 'Country', value: 'Japan' },
      { label: 'Best time', value: 'Mar–May, Oct–Nov' },
      { label: 'Highlights', value: 'Temples, cuisine, day trips' },
    ],
    localizations: {
      de: {
        name: 'Tokio',
        description: 'NeonstraBen und alte Kultur.',
        fullDescription: 'Tokio vereint leuchtende Viertel wie Shibuya und Shinjuku mit ruhigen Schreinen, exzellenter Kuche und modernem Design. Ideal fur Kultur, Shopping und kulinarische Erlebnisse.',
        facts: [
          { label: 'Country', value: 'Japan' },
          { label: 'Best time', value: 'Mar-Mai, Okt-Nov' },
          { label: 'Highlights', value: 'Tempel, Kuche, Tagesausfluge' },
        ],
      },
      fr: {
        name: 'Tokyo',
        description: 'Rues neon et culture ancienne.',
        fullDescription: 'Tokyo melange quartiers lumineux, sanctuaires paisibles, gastronomie de haut niveau et design moderne. Parfait pour les voyageurs curieux de traditions et d innovation.',
        facts: [
          { label: 'Country', value: 'Japon' },
          { label: 'Best time', value: 'mars-mai, oct-nov' },
          { label: 'Highlights', value: 'Temples, cuisine, excursions' },
        ],
      },
      zh: {
        name: '东京',
        description: '霓虹街区与古老文化并存。',
        fullDescription: '东京融合了涩谷新宿的霓虹活力、宁静神社与高水准美食。可安排近郊一日游，感受四季变化与现代都市节奏。',
        facts: [
          { label: 'Country', value: '日本' },
          { label: 'Best time', value: '3-5月，10-11月' },
          { label: 'Highlights', value: '寺庙，美食，一日游' },
        ],
      },
      jp: {
        name: '東京',
        description: 'ネオン街と伝統文化の融合。',
        fullDescription: '東京は渋谷や新宿のネオン、静かな神社、世界的なグルメが共存する都市です。季節ごとの景色や近郊日帰り旅行も楽しめます。',
        facts: [
          { label: 'Country', value: '日本' },
          { label: 'Best time', value: '3-5月、10-11月' },
          { label: 'Highlights', value: '寺社、グルメ、日帰り旅' },
        ],
      },
      ar: {
        name: 'طوكيو',
        description: 'شوارع نيون وثقافة عريقة.',
        fullDescription: 'طوكيو تمزج بين احياء النيون المبهرة والمعابد الهادئة والمطبخ الياباني الراقي. وجهة مثالية لعشاق الثقافة الحديثة والتقليدية معا.',
        facts: [
          { label: 'Country', value: 'اليابان' },
          { label: 'Best time', value: 'مارس-مايو، اكتوبر-نوفمبر' },
          { label: 'Highlights', value: 'المعابد، الطعام، الرحلات اليومية' },
        ],
      },
      hi: {
        name: 'टोक्यो',
        description: 'नियॉन गलियां और प्राचीन संस्कृति।',
        fullDescription: 'टोक्यो में शिबुया-शिंजुकु की चमक, शांत मंदिर, शानदार भोजन और आधुनिक डिजाइन का अद्भुत मिश्रण है। शहर और डे-ट्रिप दोनों के लिए बेहतरीन विकल्प।',
        facts: [
          { label: 'Country', value: 'जापान' },
          { label: 'Best time', value: 'मार्च-मई, अक्टूबर-नवंबर' },
          { label: 'Highlights', value: 'मंदिर, भोजन, डे ट्रिप' },
        ],
      },
    },
  },
  {
    id: 'london',
    name: 'London',
    description: 'Historic landmarks and modern energy.',
    fullDescription:
      'London offers royal palaces, the Thames, West End theatre, and museums many of which are free. From Borough Market to Notting Hill, historic pubs to skyline views from the Shard, the city suits first visits and return trips alike.',
    image: londonImg,
    images: [londonImg],
    facts: [
      { label: 'Country', value: 'United Kingdom' },
      { label: 'Best time', value: 'May–Sep' },
      { label: 'Highlights', value: 'Museums, theatre, markets' },
    ],
    localizations: {
      de: {
        name: 'London',
        description: 'Historische Wahrzeichen und moderne Energie.',
        fullDescription: 'London bietet Konigspalaste, Museen, Theater und lebendige Viertel. Von Notting Hill bis Borough Market erleben Sie Geschichte und modernes Stadtleben in perfekter Balance.',
        facts: [
          { label: 'Country', value: 'Vereinigtes Konigreich' },
          { label: 'Best time', value: 'Mai-Sep' },
          { label: 'Highlights', value: 'Museen, Theater, Markte' },
        ],
      },
      fr: {
        name: 'Londres',
        description: 'Monuments historiques et energie moderne.',
        fullDescription: 'Londres combine palais royaux, theatres du West End, musees renommes et quartiers vibrants. Une ville ideale pour une premiere visite comme pour y revenir.',
        facts: [
          { label: 'Country', value: 'Royaume-Uni' },
          { label: 'Best time', value: 'mai-sept' },
          { label: 'Highlights', value: 'Musees, theatre, marches' },
        ],
      },
      zh: {
        name: '伦敦',
        description: '历史地标与现代活力并存。',
        fullDescription: '伦敦拥有皇室建筑、泰晤士河、西区剧院和众多博物馆。无论是首次到访还是再次探索，都能感受传统与现代的融合魅力。',
        facts: [
          { label: 'Country', value: '英国' },
          { label: 'Best time', value: '5月-9月' },
          { label: 'Highlights', value: '博物馆，剧院，市集' },
        ],
      },
      jp: {
        name: 'ロンドン',
        description: '歴史的ランドマークと現代的な活気。',
        fullDescription: 'ロンドンは王室文化、テムズ川、劇場、美術館が魅力の都市です。歴史地区から最新スポットまで、多彩な体験ができます。',
        facts: [
          { label: 'Country', value: 'イギリス' },
          { label: 'Best time', value: '5月-9月' },
          { label: 'Highlights', value: '博物館、劇場、マーケット' },
        ],
      },
      ar: {
        name: 'لندن',
        description: 'معالم تاريخية وطاقة عصرية.',
        fullDescription: 'لندن تجمع بين القصور الملكية والمسارح والمتاحف والاسواق المتنوعة. مدينة مناسبة للزيارة الاولى او العودة مرات متعددة.',
        facts: [
          { label: 'Country', value: 'المملكة المتحدة' },
          { label: 'Best time', value: 'مايو-سبتمبر' },
          { label: 'Highlights', value: 'متاحف، مسارح، اسواق' },
        ],
      },
      hi: {
        name: 'लंदन',
        description: 'ऐतिहासिक पहचान और आधुनिक ऊर्जा।',
        fullDescription: 'लंदन में शाही महल, थेम्स नदी, वेस्ट एंड थिएटर और विश्वस्तरीय म्यूजियम का शानदार मेल है। हर तरह के यात्रियों के लिए यह शहर हमेशा खास है।',
        facts: [
          { label: 'Country', value: 'यूनाइटेड किंगडम' },
          { label: 'Best time', value: 'मई-सितंबर' },
          { label: 'Highlights', value: 'म्यूजियम, थिएटर, मार्केट' },
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
    facts: [
      { label: 'Region', value: 'Southeast Asia' },
      { label: 'Best time', value: 'Year-round (Feb–Apr drier)' },
      { label: 'Highlights', value: 'Gardens, food, Marina Bay' },
    ],
    localizations: {
      de: {
        name: 'Singapur',
        description: 'Eine Gartenstadt mit lebendiger Energie.',
        fullDescription: 'Singapur ist kompakt, sauber und voller Kontraste: Hawker-Food, Gardens by the Bay, Chinatown und Little India. Perfekt fur Familien, Food-Liebhaber und Stopover-Reisen.',
        facts: [
          { label: 'Region', value: 'Sudostasien' },
          { label: 'Best time', value: 'Ganzjahrig (Feb-Apr trockener)' },
          { label: 'Highlights', value: 'Gardens, Streetfood, Marina Bay' },
        ],
      },
      fr: {
        name: 'Singapour',
        description: 'Une ville-jardin au rythme vibrant.',
        fullDescription: 'Singapour est une cite-etat moderne, connue pour ses hawker centers, Gardens by the Bay et ses quartiers multiculturels. Tres pratique pour les familles et les amateurs de gastronomie.',
        facts: [
          { label: 'Region', value: 'Asie du Sud-Est' },
          { label: 'Best time', value: 'Toute l annee (fev-avr plus sec)' },
          { label: 'Highlights', value: 'Gardens, cuisine, Marina Bay' },
        ],
      },
      zh: {
        name: '新加坡',
        description: '充满活力的花园城市。',
        fullDescription: '新加坡交通便捷，融合多元文化与美食体验。可游览滨海湾花园、牛车水、小印度等地，适合家庭与美食爱好者。',
        facts: [
          { label: 'Region', value: '东南亚' },
          { label: 'Best time', value: '全年（2-4月较干燥）' },
          { label: 'Highlights', value: '花园，美食，滨海湾' },
        ],
      },
      jp: {
        name: 'シンガポール',
        description: '活気あふれるガーデンシティ。',
        fullDescription: 'シンガポールはホーカーグルメ、多文化エリア、ガーデンズ・バイ・ザ・ベイが魅力の都市国家です。家族旅行にもグルメ旅にも最適です。',
        facts: [
          { label: 'Region', value: '東南アジア' },
          { label: 'Best time', value: '通年（2-4月は比較的乾季）' },
          { label: 'Highlights', value: 'ガーデンズ、グルメ、マリーナベイ' },
        ],
      },
      ar: {
        name: 'سنغافورة',
        description: 'مدينة حدائق بنبض حيوي.',
        fullDescription: 'سنغافورة مدينة حديثة ومضغوطة تشتهر بالطعام المتنوع وحدائق الخليج والاحياء الثقافية المختلفة. مناسبة للعائلات ومحبي الطعام.',
        facts: [
          { label: 'Region', value: 'جنوب شرق اسيا' },
          { label: 'Best time', value: 'طوال العام (فبراير-ابريل اكثر جفافا)' },
          { label: 'Highlights', value: 'الحدائق، الطعام، مارينا باي' },
        ],
      },
      hi: {
        name: 'सिंगापुर',
        description: 'एक गार्डन सिटी, जीवंत अनुभवों के साथ।',
        fullDescription: 'सिंगापुर एक कॉम्पैक्ट और आधुनिक शहर-देश है, जहां हॉकर्स फूड, गार्डन्स बाय द बे और बहुसांस्कृतिक इलाके खास आकर्षण हैं। परिवार और फूड ट्रैवल के लिए शानदार विकल्प।',
        facts: [
          { label: 'Region', value: 'दक्षिण-पूर्व एशिया' },
          { label: 'Best time', value: 'साल भर (फरवरी-अप्रैल अपेक्षाकृत सूखा)' },
          { label: 'Highlights', value: 'गार्डन्स, भोजन, मरीना बे' },
        ],
      },
    },
  },
];
