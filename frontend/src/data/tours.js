// Inbound Assets (Sri Lanka)
import sigiriyaImg from "../assets/sigiriya.webp";
import ellaImg from "../assets/ella.webp";
import galleImg from "../assets/galle.webp";
import kandyImg from "../assets/kandy.webp";
import sigiriyaImg2 from "../assets/sigiriya-2.webp";
import ellaImg2 from "../assets/ella-2.webp";
import galleImg2 from "../assets/galle-2.webp";
import kandyImg2 from "../assets/kandy-2.webp";
import kandyImg3 from "../assets/kandy-3.webp";

// Outbound Assets (Global)
import parisImg from "../assets/paris.webp";
import tokyoImg from "../assets/tokyo.webp";
import dubaiImg from "../assets/dubai.webp";
import sydneyImg from "../assets/sydney.webp";

export const INBOUND_PACKAGES = [
  {
    id: 1,
    title: "Sigiriya Tour",
    price: 200,
    image: sigiriyaImg,
    images: [sigiriyaImg, sigiriyaImg2],
    duration: "Full Day",
    description: "Climb the iconic Lion Rock, explore ancient frescoes, and enjoy panoramic views over Sri Lanka’s cultural triangle.",
    localizations: {
      de: {
        title: "Sigiriya-Tour",
        description: "Besteigen Sie den ikonischen Löwenfelsen, erkunden Sie antike Fresken und genießen Sie den Panoramablick.",
        itinerary: [
          { location: "Colombo / Ihr Hotel", text: "Abholung vom Hotel und malerischer Transfer nach Sigiriya." },
          { location: "Sigiriya", text: "Besteigung der Felsenfestung Sigiriya und Panoramablick." },
          { location: "Dambulla", text: "Besuch der Höhlentempel von Dambulla und Besichtigung der Fresken." },
          { location: "Lokales Mittagessen", text: "Entspannen Sie bei einem lokalen Mittagessen und optionalem Gartenstopp." },
          { location: "Rücktransfer", text: "Rücktransfer zu Ihrem Hotel." }
        ],
        inclusions: ["Privattransport", "Deutschsprachiger Guide (auf Anfrage)", "Wasser in Flaschen", "Hotelabholung & Rückgabe"]
      },
      fr: {
        title: "Tour de Sigiriya",
        description: "Grimpez sur l'iconique Rocher du Lion, explorez les fresques anciennes et profitez de vues panoramiques.",
        itinerary: [
          { location: "Colombo / Votre hôtel", text: "Prise en charge à l'hôtel et transfert vers Sigiriya." },
          { location: "Sigiriya", text: "Ascension de la forteresse du rocher de Sigiriya et vue panoramique." },
          { location: "Dambulla", text: "Visite des temples des grottes de Dambulla et exploration des fresques." },
          { location: "Déjeuner local", text: "Détaillez-vous avec un déjeuner local et un arrêt optionnel au jardin." },
          { location: "Transfert de retour", text: "Retour à votre hôtel." }
        ],
        inclusions: ["Transport privé", "Guide francophone (sur demande)", "Eau en bouteille", "Prise en charge et retour à l'hôtel"]
      },
      zh: {
        title: "锡吉里耶之旅",
        description: "攀登标志性的狮子岩，探索古老的壁画，并享受斯里兰卡文化三角区的全景。",
        itinerary: [
          { location: "科伦坡 / 您的酒店", text: "酒店接送并经由风景优美的路线前往锡吉里耶。" },
          { location: "锡吉里耶", text: "攀登锡吉里耶岩石堡垒并享受全景观景点。" },
          { location: "丹布勒", text: "参观丹布勒石窟寺并探索壁画。" },
          { location: "当地午餐", text: "享用当地午餐并可选参观花园。" },
          { location: "返回接送", text: "返回您的酒店。" }
        ],
        inclusions: ["私人交通", "中文导游（根据要求）", "瓶装水", "酒店往返接送"]
      },
      jp: {
        title: "シギリヤ・ツアー",
        description: "伝説のライオンロックに登り、古代の壁画を探索し、スリランカの文化三角地帯のパノラマビューをお楽しみください。",
        itinerary: [
          { location: "コロンボ / ホテル", text: "ホテル送迎、シギリヤへの風光明媚なドライブ。" },
          { location: "シギリヤ", text: "シギリヤ・ロック要塞に登り、パノラマの景色を堪能。" },
          { location: "ダンブッラ", text: "ダンブッラの石窟寺院を訪れ、壁画を探索。" },
          { location: "地元のランチ", text: "地元のランチを楽しみ、オプションで庭園に立ち寄り。" },
          { location: "お送り", text: "ホテルまでお送りします。" }
        ],
        inclusions: ["専用車", "日本語ガイド（要リクエスト）", "ボトル入り飲料水", "ホテル送迎"]
      },
      ar: {
        title: "جولة سيجيريا",
        description: "تسلق صخرة الأسد الأيقونية، واستكشف اللوحات الجدارية القديمة، واستمتع بالمناظر البانورامية للمثلث الثقافي في سريلانكا.",
        itinerary: [
          { location: "كولومبو / فندقك", text: "الاستقبال من الفندق والانتقال عبر طريق خلاب إلى سيجيريا." },
          { location: "سيجيريا", text: "تسلق حصن صخرة سيجيريا والاستمتاع بإطلالات بانورامية." },
          { location: "دامبولا", text: "زيارة معابد كهوف دامبولا واستكشاف اللوحات الجدارية." },
          { location: "غداء محلي", text: "الاسترخاء مع غداء محلي وتوقف اختياري في الحديقة." },
          { location: "العودة", text: "العودة إلى فندقك." }
        ],
        inclusions: ["نقل خاص", "دليل يتحدث العربية (عند الطلب)", "مياه معبأة", "الاستقبال والتوصيل من الفندق"]
      },
      hi: {
        title: "सिगिरिया टूर",
        description: "प्रतीकात्मक लायन रॉक पर चढ़ें, प्राचीन भित्ति चित्रों का अन्वेषण करें और श्रीलंका के सांस्कृतिक त्रिकोण के मनोरम दृश्यों का आनंद लें।",
        itinerary: [
          { location: "कोलंबो / आपका होटल", text: "होटल पिकअप और सिगिरिया के लिए सुंदर सड़क मार्ग से स्थानांतरण।" },
          { location: "सिगिरिया", text: "सिगिरिया रॉक किले पर चढ़ाई करें और मनोरम दृश्यों का आनंद लें।" },
          { location: "दाम्बुला", text: "दाम्बुला गुफा मंदिरों के दर्शन करें और भित्ति चित्रों का अन्वेषण करें।" },
          { location: "स्थानीय दोपहर का भोजन", text: "स्थानीय दोपहर के भोजन और वैकल्पिक गार्डन स्टॉप के साथ आराम करें।" },
          { location: "वापसी", text: "आपके होटल में वापसी स्थानांतरण।" }
        ],
        inclusions: ["निजी परिवहन", "हिंदी भाषी गाइड (अनुरोध पर)", "बोतलबंद पानी", "होटल पिकअप और ड्रॉप-ऑफ"]
      }
    },
    itinerary: [
      {
        location: "Colombo / Your Hotel",
        text: "Hotel pickup and scenic road transfer to Sigiriya.",
      },
      {
        location: "Sigiriya",
        text: "Climb Sigiriya Rock Fortress and enjoy panoramic viewpoints.",
      },
      {
        location: "Dambulla",
        text: "Visit Dambulla cave temples and explore the frescoes.",
      },
      {
        location: "Local Lunch",
        text: "Relax with a local lunch and optional garden stop.",
      },
      {
        location: "Return Transfer",
        text: "Return transfer to your hotel.",
      },
    ],
    route: {
      stops: [
        { label: "Colombo", lat: 6.9271, lng: 79.8612 },
        { label: "Sigiriya", lat: 7.9575, lng: 80.7609 },
        { label: "Dambulla", lat: 7.8636, lng: 80.6550 },
      ],
      path: [
        { lat: 6.9271, lng: 79.8612 },
        { lat: 7.9575, lng: 80.7609 },
        { lat: 7.8636, lng: 80.6550 },
      ],
    },
    type: "Day",
    inclusions: ["Private transport", "English-speaking guide", "Bottled water", "Hotel pickup & drop-off"],
    isLimitedTime: true,
    discountPercentage: 15,
    expiryDate: "2026-04-08T18:00:00Z",
  },
  {
    id: 2,
    title: "Ella Adventure",
    price: 150,
    image: ellaImg,
    images: [ellaImg, ellaImg2],
    duration: "2 Day / 1 Night",
    description: "A misty mountain escape with scenic viewpoints, waterfalls, and a laid-back hill-country vibe.",
    localizations: {
      de: {
        title: "Ella Abenteuer",
        description: "Ein nebliger Rückzugsort in den Bergen mit malerischen Aussichtspunkten und Wasserfällen.",
        itinerary: [
          { day: "Tag 1", activities: [{ location: "Kandy", text: "Abfahrt von Kandy nach Ella mit dem Zug/Transfer." }] },
          { day: "Tag 2", activities: [{ location: "Neun-Bögen-Brücke", text: "Fangen Sie malerische Bahnfotos ein." }] }
        ],
        inclusions: ["Transport", "Reiseleitung", "Aussichtspunkte", "Optionale Zugunterstützung"]
      },
      fr: {
        title: "Aventure à Ella",
        description: "Une escapade dans les montagnes brumeuses avec des points de vue pittoresques et des cascades.",
        itinerary: [
          { day: "Jour 1", activities: [{ location: "Kandy", text: "Départ de Kandy pour Ella via train/transfert." }] },
          { day: "Jour 2", activities: [{ location: "Pont aux neuf arches", text: "Prenez des photos ferroviaires pittoresques." }] }
        ],
        inclusions: ["Transport", "Assistance guide", "Visites de points de vue", "Soutien ferroviaire optionnel"]
      },
      zh: {
        title: "艾勒探险",
        description: "迷雾缭绕的山区度假胜地，拥有优美的风景点、瀑布和轻松的山区氛围。",
        itinerary: [
          { day: "第1天", activities: [{ location: "康提", text: "乘火车/专车从康提前往艾勒。" }] },
          { day: "第2天", activities: [{ location: "九拱桥", text: "拍摄优美的铁轨照片。" }] }
        ],
        inclusions: ["交通", "导游协助", "观景点游览", "可选火车行程支持"]
      },
      jp: {
        title: "エラ・アドベンチャー",
        description: "美しい展望台、滝、そしてゆったりとした高地の雰囲気を持つ霧深い山の逃避行。",
        itinerary: [
          { day: "1日目", activities: [{ location: "キャンディ", text: "列車または車でキャンディを出発しエラへ。" }] },
          { day: "2日目", activities: [{ location: "ナイン・アーチ・ブリッジ", text: "絵のように美しい鉄道の写真を撮影。" }] }
        ],
        inclusions: ["交通費", "ガイドアシスタンス", "展望台への訪問", "オプションの列車サポート"]
      },
      ar: {
        title: "مغامرة إيلا",
        description: "هروب جبلي ضبابي مع نقاط مراقبة خلابة وشلالات وأجواء ريفية مريحة في التلال.",
        itinerary: [
          { day: "اليوم 1", activities: [{ location: "كاندي", text: "المغادرة من كاندي إلى إيلا عبر القطار أو النقل الخاص." }] },
          { day: "اليوم 2", activities: [{ location: "جسر الأقواس التسعة", text: "التقاط صور سكك حديدية خلابة." }] }
        ],
        inclusions: ["النقل", "مساعدة الدليل", "زيارة نقاط المشاهدة", "دعم اختياري لرحلة القطار"]
      },
      hi: {
        title: "एला एडवेंचर",
        description: "सुंदर दृष्टिकोण, झरने और एक शांत पहाड़ी-देश खिंचाव के साथ एक धुंधला पहाड़ी पलायन।",
        itinerary: [
          { day: "दिन 1", activities: [{ location: "कैंडी", text: "कैंडी से ट्रेन/ट्रांसफर के जरिए एला के लिए प्रस्थान।" }] },
          { day: "दिन 2", activities: [{ location: "नाइन आर्क ब्रिज", text: "सुंदर रेल तस्वीरें लें।" }] }
        ],
        inclusions: ["परिवहन", "गाइड सहायता", "दृष्टिकोण भ्रमण", "वैकल्पिक ट्रेन सहायता"]
      }
    },
    itinerary: [
      {
        day: "Day 1",
        activities: [
          { location: "Kandy", text: "Depart Kandy for Ella via train/transfer." },
          { location: "Little Adam's Peak", text: "Hike for sunrise-style views." }
        ]
      },
      {
        day: "Day 2",
        activities: [
          { location: "Nine Arches Bridge", text: "Capture scenic rail photos." },
          { location: "Ravana Falls", text: "Enjoy the waterfalls." },
          { location: "Return", text: "Transfer back to Kandy." }
        ]
      }
    ],
    route: {
      stops: [
        { label: "Kandy", lat: 7.2906, lng: 80.6337 },
        { label: "Ella", lat: 6.8724, lng: 81.0573 },
        { label: "Nine Arches", lat: 6.8792, lng: 81.0450 },
        { label: "Ravana Falls", lat: 6.8649, lng: 81.0550 },
      ],
      path: [
        { lat: 7.2906, lng: 80.6337 },
        { lat: 6.8724, lng: 81.0573 },
        { lat: 6.8792, lng: 81.0450 },
        { lat: 6.8649, lng: 81.0550 },
      ],
    },
    type: "Round",
    inclusions: ["Transport", "Guide assistance", "Viewpoint visits", "Optional train support"],
  },
  {
    id: 3,
    title: "Galle Day Trip",
    price: 120,
    image: galleImg,
    images: [galleImg, galleImg2],
    duration: "Half Day",
    description: "Walk the colonial fort, browse boutique cafés, and enjoy the coastal charm of Sri Lanka’s south.",
    localizations: {
      de: {
        title: "Tagesausflug nach Galle",
        description: "Besichtigen Sie das koloniale Fort, stöbern Sie in Boutique-Cafés und genießen Sie den Küstencharme.",
        itinerary: [
          { location: "Colombo", text: "Küstenzuahrt nach Galle mit Fotostopps." },
          { location: "Galle Fort", text: "Geführter Rundgang durch das Fort." }
        ],
        inclusions: ["Transport", "Festungsführung", "Fotostopps"]
      },
      fr: {
        title: "Excursion d'une journée à Galle",
        description: "Promenez-vous dans le fort colonial, parcourez les cafés-boutiques et profitez du charme côtier.",
        itinerary: [
          { location: "Colombo", text: "Route côtière vers Galle avec des arrêts photo." },
          { location: "Fort de Galle", text: "Visite guidée à pied à l'intérieur du fort." }
        ],
        inclusions: ["Transport", "Visite du fort", "Arrêts photo"]
      },
      zh: {
        title: "加勒一日游",
        description: "漫步在殖民时期的堡垒，浏览精品咖啡馆，享受斯里兰卡南部的海岸魅力。",
        itinerary: [
          { location: "科伦坡", text: "沿海驾车前往加勒，沿途拍照留念。" },
          { location: "加勒堡", text: "堡垒和殖民街道内的导览步行游。" }
        ],
        inclusions: ["交通", "堡垒游览", "拍照停靠点"]
      },
      jp: {
        title: "ゴール日帰り旅行",
        description: "植民地時代の砦を歩き、ブティックカフェを巡り、スリランカ南部の海岸の魅力を堪能してください。",
        itinerary: [
          { location: "コロンボ", text: "途中で写真撮影に立ち寄りながらゴールへ海岸沿いのドライブ。" },
          { location: "ゴール要塞", text: "要塞内と植民地時代の街並みを巡るガイド付き徒歩ツアー。" }
        ],
        inclusions: ["交通費", "フォートツアー", "写真撮影スポット"]
      },
      ar: {
        title: "رحلة يومية إلى غالي",
        description: "تجول في الحصن الاستعماري، وتصفح المقاهي الراقية، واستمتع بسحر الساحل في جنوب سريلانكا.",
        itinerary: [
          { location: "كولومبو", text: "القيادة على طول الساحل إلى غالي مع توقفات للتصوير." },
          { location: "حصن غالي", text: "جولة مشي بصحبة دليل داخل الحصن والشوارع الاستعمارية." }
        ],
        inclusions: ["النقل", "جولة في الحصن", "توقفات للتصوير"]
      },
      hi: {
        title: "गाले डे ट्रिप",
        description: "औपनिवेशिक किले में टहलें, बुटीक कैफे ब्राउज़ करें और श्रीलंका के दक्षिण के तटीय आकर्षण का आनंद लें।",
        itinerary: [
          { location: "कोलंबो", text: "रास्ते में फोटो स्टॉप के साथ गाले के लिए तटीय ड्राइव।" },
          { location: "गाले किला", text: "किले और औपनिवेशिक सड़कों के अंदर निर्देशित पैदल यात्रा।" }
        ],
        inclusions: ["परिवहन", "किला भ्रमण", "फोटो स्टॉप"]
      }
    },
    itinerary: [
      {
        location: "Colombo / South Coast",
        text: "Coastal drive to Galle with photo stops along the way.",
      },
      {
        location: "Galle Fort",
        text: "Guided walking tour inside the fort and colonial streets.",
      },
      {
        location: "Shopping & Cafés",
        text: "Free time for boutique shopping and local café breaks.",
      },
      {
        location: "Galle Ramparts",
        text: "Sunset views by the ramparts before returning.",
      },
    ],
    route: {
      stops: [
        { label: "Colombo", lat: 6.9271, lng: 79.8612 },
        { label: "Galle Fort", lat: 6.0535, lng: 80.2210 },
      ],
      path: [
        { lat: 6.9271, lng: 79.8612 },
        { lat: 6.0535, lng: 80.2210 },
      ],
    },
    type: "Day",
    inclusions: ["Transport", "Fort tour", "Photo stops"],
  },
  {
    id: 4,
    title: "Kandy Cultural Show",
    price: 80,
    image: kandyImg,
    images: [kandyImg, kandyImg2, kandyImg3],
    duration: "Evening",
    description: "An immersive cultural night featuring traditional dance, drumming, and a vibrant local atmosphere.",
    localizations: {
      de: { title: "Kulturshow in Kandy", description: "Ein immersiver Abend mit traditionellem Tanz und Trommeln.", itinerary: [ { location: "Kandy Kulturbühne", text: "Genießen Sie die kulturelle Performance." } ], inclusions: ["Transport", "Reservierte Sitzplätze"] },
      fr: { title: "Spectacle culturel de Kandy", description: "Une nuit culturelle immersive avec danse traditionnelle et tambours.", itinerary: [ { location: "Lieu culturel de Kandy", text: "Profitez de la performance de danse culturelle." } ], inclusions: ["Transport", "Sièges réservés"] },
      zh: { title: "康提文化表演", description: "身临其境的文化之夜，有传统舞蹈、鼓点和充满活力的当地氛围。", itinerary: [ { location: "康提文化场馆", text: "欣赏文化舞蹈+敲鼓表演。" } ], inclusions: ["交通", "预留座位"] },
      jp: { title: "キャンディ文化ショー", description: "伝統的なダンス、ドラム、活気ある地元の雰囲気が特徴の没入型文化の夜。", itinerary: [ { location: "キャンディ文化会場", text: "文化的なダンスと太鼓のパフォーマンスを鑑賞。" } ], inclusions: ["交通費", "予約席"] },
      ar: { title: "عرض كاندي الثقافي", description: "ليلة ثقافية غامرة تتميز بالرقص التقليدي والقرع على الطبول وأجواء محلية نابضة بالحياة.", itinerary: [ { location: "الموقع الثقافي في كاندي", text: "الاستمتاع برقص ثقافي وعرض طبل." } ], inclusions: ["النقل", "مقاعد محجوزة"] },
      hi: { title: "कैंडी सांस्कृतिक शो", description: "पारंपरिक नृत्य, ढोल और जीवंत स्थानीय माहौल वाली एक आकर्षक सांस्कृतिक रात।", itinerary: [ { location: "कैंडी सांस्कृतिक स्थल", text: "सांस्कृतिक नृत्य + ढोल प्रदर्शन का आनंद लें।" } ], inclusions: ["परिवहन", "आरक्षित सीटें"] }
    },
    itinerary: [
      {
        location: "Kandy City",
        text: "Pick up and optional temple area stop (subject to timing).",
      },
      {
        location: "Kandy Cultural Venue",
        text: "Enjoy the cultural dance + drumming performance.",
      },
      {
        location: "Return Drive",
        text: "Drive back with city lights and final drop-off.",
      },
    ],
    route: {
      stops: [
        { label: "Kandy", lat: 7.2906, lng: 80.6337 },
        { label: "Cultural Venue", lat: 7.2889, lng: 80.6320 },
      ],
      path: [
        { lat: 7.2906, lng: 80.6337 },
        { lat: 7.2889, lng: 80.6320 },
      ],
    },
    type: "Day",
    inclusions: ["Transport", "Reserved seating (subject to availability)"],
  }
];

export const OUTBOUND_PACKAGES = [
  {
    id: 5,
    title: "Paris Romance",
    price: 1200,
    image: parisImg,
    images: [parisImg],
    duration: "5 Day / 4 Night",
    description: "Classic Paris highlights with curated city experiences, iconic landmarks, and café culture.",
    itinerary: [
      {
        day: "Day 1",
        activities: [
          { location: "Paris", text: "Arrival and relaxed Seine stroll." }
        ]
      },
      {
        day: "Day 2",
        activities: [
          { location: "Eiffel Tower", text: "Eiffel Tower views and walk along Champs-Élysées." }
        ]
      },
      {
        day: "Day 3",
        activities: [
          { location: "Louvre Museum", text: "Louvre / Musée day with curated highlights." }
        ]
      },
      {
        day: "Day 4",
        activities: [
          { location: "Montmartre", text: "Montmartre charm, viewpoints, and evening café atmosphere." }
        ]
      },
      {
        day: "Day 5",
        activities: [
          { location: "Airport", text: "Final breakfast and departure transfers." }
        ]
      }
    ],
    localizations: {
      de: {
        title: "Paris Romantik",
        description: "Klassische Pariser Highlights mit kuratierten Stadterlebnissen, ikonischen Wahrzeichen und Cafékultur.",
        itinerary: [
          { day: "Tag 1", activities: [{ location: "Paris", text: "Ankunft und entspannter Spaziergang an der Seine." }] },
          { day: "Tag 2", activities: [{ location: "Eiffelturm", text: "Eiffelturm-Aussichten und Spaziergang entlang der Champs-Élysées." }] },
          { day: "Tag 3", activities: [{ location: "Louvre", text: "Louvre-Tag mit kuratierten Highlights." }] },
          { day: "Tag 4", activities: [{ location: "Montmartre", text: "Montmartre-Charme und Abendatmosphäre." }] },
          { day: "Tag 5", activities: [{ location: "Flughafen", text: "Frühstück und Transfer zum Flughafen." }] }
        ],
        inclusions: ["Hotelaufenthalt", "Flughafentransfer", "Stadtführung", "Eintrittskarten"]
      },
      fr: {
        title: "Romance à Paris",
        description: "Les classiques de Paris avec des expériences urbaines choisies, des monuments emblématiques et la culture des cafés.",
        itinerary: [
          { day: "Jour 1", activities: [{ location: "Paris", text: "Arrivée et promenade relaxante sur la Seine." }] },
          { day: "Jour 2", activities: [{ location: "Tour Eiffel", text: "Vues sur la Tour Eiffel et promenade sur les Champs-Élysées." }] },
          { day: "Jour 3", activities: [{ location: "Musée du Louvre", text: "Journée au Louvre avec des points forts sélectionnés." }] },
          { day: "Jour 4", activities: [{ location: "Montmartre", text: "Charme de Montmartre et atmosphère de soirée." }] },
          { day: "Jour 5", activities: [{ location: "Aéroport", text: "Petit-déjeuner et transferts vers l'aéroport." }] }
        ],
        inclusions: ["Séjour à l'hôtel", "Transferts aéroport", "Visite de la ville", "Billets sélectionnés"]
      },
      zh: {
        title: "巴黎浪漫之旅",
        description: "经典的巴黎亮点，精心策划的城市体验，标志性地标和咖啡馆文化。",
        itinerary: [
          { day: "第 1 天", activities: [{ location: "巴黎", text: "抵达并进行悠闲的塞纳河散步。" }] },
          { day: "第 2 天", activities: [{ location: "埃菲尔铁塔", text: "欣赏埃菲尔铁塔美景并沿着香榭丽舍大街漫步。" }] },
          { day: "第 3 天", activities: [{ location: "卢浮宫", text: "卢浮宫博物馆日，参观精心挑选的内容。" }] },
          { day: "第 4 天", activities: [{ location: "蒙马特", text: "蒙马特魅力、观景点和晚间咖啡馆氛围。" }] },
          { day: "第 5 天", activities: [{ location: "机场", text: "最后的早餐和机场送机。" }] }
        ],
        inclusions: ["酒店住宿", "机场接送", "城市游览", "部分门票"]
      },
      jp: {
        title: "パリ・ロマンス",
        description: "厳選された都市体験、象徴的なランドマーク、カフェ文化を巡るクラシックなパリのハイライト。",
        itinerary: [
          { day: "1日目", activities: [{ location: "パリ", text: "到着後、セーヌ川沿いをゆったりと散策。" }] },
          { day: "2日目", activities: [{ location: "エッフェル塔", text: "エッフェル塔の景色を楽しみ、シャンゼリゼ通りを散策。" }] },
          { day: "3日目", activities: [{ location: "ルーヴル美術館", text: "ルーヴル美術館で厳選した作品を鑑賞。" }] },
          { day: "4日目", activities: [{ location: "モンマルトル", text: "モンマルトルの魅力、展望台、夜のカフェの雰囲気。" }] },
          { day: "5日目", activities: [{ location: "空港", text: "最後の朝食後、空港へ送迎。" }] }
        ],
        inclusions: ["ホテル宿泊", "空港送迎", "シティツアー", "厳選チケット"]
      },
      ar: {
        title: "رومانسية باريس",
        description: "أبرز معالم باريس الكلاسيكية مع تجارب مدنية منسقة، ومعالم أيقونية، وثقافة المقاهي.",
        itinerary: [
          { day: "اليوم 1", activities: [{ location: "باريس", text: "الوصول ونزهة مريحة على ضفاف نهر السين." }] },
          { day: "اليوم 2", activities: [{ location: "برج إيفل", text: "إطلالات برج إيفل والمشي على طول الشانزليزيه." }] },
          { day: "اليوم 3", activities: [{ location: "متحف اللوفر", text: "يوم في متحف اللوفر مع أبرز المعالم المنسقة." }] },
          { day: "اليوم 4", activities: [{ location: "مونمارتر", text: "سحر مونمارتر، ونقاط المشاهدة، وأجواء المقاهي المسائية." }] },
          { day: "اليوم 5", activities: [{ location: "المطار", text: "الإفطار الأخير والانتقال إلى المطار." }] }
        ],
        inclusions: ["الإقامة في الفندق", "نقل المطار", "جولة في المدينة", "تذاكر مختارة"]
      },
      hi: {
        title: "पेरिस रोमांस",
        description: "क्यूरेटेड शहर के अनुभवों, प्रतिष्ठित स्थलों और कैफे संस्कृति के साथ क्लासिक पेरिस के मुख्य आकर्षण।",
        itinerary: [
          { day: "दिन 1", activities: [{ location: "पेरिस", text: "आगमन और सीन नदी के किनारे टहलना।" }] },
          { day: "दिन 2", activities: [{ location: "एफिल टॉवर", text: "एफिल टॉवर के दृश्य और चैंप्स-एलिसीज़ के साथ टहलना।" }] },
          { day: "दिन 3", activities: [{ location: "लूवर संग्रहालय", text: "क्यूरेटेड हाइलाइट्स के साथ लूवर दिवस।" }] },
          { day: "दिन 4", activities: [{ location: "मोंटमार्ट्रे", text: "मोंटमार्ट्रे आकर्षण, दृष्टिकोण और शाम कैफे का माहौल।" }] },
          { day: "दिन 5", activities: [{ location: "हवाई अड्डा", text: "प्रस्थान स्थानांतरण और अंतिम नाश्ता।्" }] }
        ],
        inclusions: ["होटल प्रवास", "हवाई अड्डा स्थानांतरण", "शहर भ्रमण", "चयनित टिकट"]
      }
    },
    route: {
      stops: [
        { label: "Paris Center", lat: 48.8566, lng: 2.3522 },
        { label: "Eiffel Tower", lat: 48.8584, lng: 2.2945 },
        { label: "Louvre", lat: 48.8606, lng: 2.3376 },
        { label: "Montmartre", lat: 48.8867, lng: 2.3431 },
      ],
      path: [
        { lat: 48.8566, lng: 2.3522 },
        { lat: 48.8584, lng: 2.2945 },
        { lat: 48.8606, lng: 2.3376 },
        { lat: 48.8867, lng: 2.3431 },
      ],
    },
    type: "Round",
    inclusions: ["Hotel stay", "Airport transfers", "City tour", "Selected tickets (varies)"],
  },
  {
    id: 6,
    title: "Tokyo Neon Nights",
    price: 1500,
    image: tokyoImg,
    images: [tokyoImg],
    duration: "6 Day / 5 Night",
    description: "A modern Tokyo journey mixing neon streets, calm shrines, and unforgettable food spots.",
    itinerary: [
      {
        day: "Day 1",
        activities: [
          { location: "Shibuya", text: "Shibuya & Shinjuku neon streets and iconic crossings." }
        ]
      },
      {
        day: "Day 2",
        activities: [
          { location: "Asakusa", text: "Asakusa temples + Skytree area stroll." }
        ]
      },
      {
        day: "Day 3",
        activities: [
          { location: "Flexible", text: "Flexible day trip options (choose based on preference)." }
        ]
      },
      {
        day: "Day 4",
        activities: [
          { location: "Markets", text: "Food and market tour for local favorites." }
        ]
      },
      {
        day: "Day 5",
        activities: [
          { location: "Tokyo", text: "Free exploration time with optional suggestions." }
        ]
      },
      {
        day: "Day 6",
        activities: [
          { location: "Airport", text: "Departure transfers and last-minute shopping." }
        ]
      }
    ],
    localizations: {
      de: {
        title: "Tokio Neonnächte",
        description: "Eine moderne Reise nach Tokio, die Neonstraßen, ruhige Schreine und unvergessliche Food-Spots mischt.",
        itinerary: [
          { day: "Tag 1", activities: [{ location: "Shibuya", text: "Shibuya & Shinjuku Neinstraßen." }] },
          { day: "Tag 2", activities: [{ location: "Asakusa", text: "Asakusa Tempel + Skytree Bereich." }] },
          { day: "Tag 6", activities: [{ location: "Flughafen", text: "Transfer zum Flughafen." }] }
        ],
        inclusions: ["5 Nächte Unterkunft", "Privater Guide", "Metro-Pass", "Eintrittsgelder"]
      },
      fr: {
        title: "Nuits de Néon à Tokyo",
        description: "Un voyage moderne à Tokyo mêlant rues de néon, sanctuaires calmes et lieux de restauration inoubliables.",
        itinerary: [
          { day: "Jour 1", activities: [{ location: "Shibuya", text: "Rues de néon de Shibuya et Shinjuku." }] },
          { day: "Jour 2", activities: [{ location: "Asakusa", text: "Temples d'Asakusa + zone Skytree." }] },
          { day: "Jour 6", activities: [{ location: "Aéroport", text: "Transferts de départ." }] }
        ],
        inclusions: ["5 nuits d'hébergement", "Guide privé", "Pass métro", "Frais d'entrée"]
      },
      zh: {
        title: "东京霓虹之夜",
        description: "现代东京之旅，融合了霓虹灯街道、宁静的神社和令人难忘的美食点。",
        itinerary: [
          { day: "第 1 天", activities: [{ location: "涩谷", text: "涩谷和新宿的霓虹街道。" }] },
          { day: "第 2 天", activities: [{ location: "浅草", text: "浅草寺 + 晴空塔区域。" }] },
          { day: "第 6 天", activities: [{ location: "机场", text: "送机并进行最后的购物。" }] }
        ],
        inclusions: ["5 晚住宿", "私人导游", "地铁通行证", "入场费"]
      },
      jp: {
        title: "東京・ネオンナイト",
        description: "ネオン街、静かな神社、忘れられないグルメスポットが融合したモダンな東京の旅。",
        itinerary: [
          { day: "1日目", activities: [{ location: "渋谷", text: "渋谷・新宿のネオン街と象徴的な交差点。" }] },
          { day: "2日目", activities: [{ location: "浅草", text: "浅草寺とスカイツリー周辺の散策。" }] },
          { day: "6日目", activities: [{ location: "空港", text: "出発送迎と直前のショッピング。" }] }
        ],
        inclusions: ["宿泊5泊", "専用ガイド", "地下鉄パス", "入場料"]
      },
      ar: {
        title: "ليالي طوكيو الصاخبة",
        description: "رحلة طوكيو الحديثة التي تمزج بين شوارع النيون والأضرحة الهادئة وبقع الطعام التي لا تُنسى.",
        itinerary: [
          { day: "اليوم 1", activities: [{ location: "شيبويا", text: "شوارع النيون في شيبويا وشينجوكو والتقاطعات الأيقونية." }] },
          { day: "اليوم 2", activities: [{ location: "أساكوسا", text: "معابد أساكوسا + نزهة في منطقة سكاي تري." }] },
          { day: "اليوم 6", activities: [{ location: "المطار", text: "انتقالات المغادرة والتسوق في اللحظة الأخيرة." }] }
        ],
        inclusions: ["إقامة 5 ليالي", "دليل خاص", "تذكرة المترو", "رسوم الدخول"]
      },
      hi: {
        title: "टोक्यो नियॉन नाइट्स",
        description: "एक आधुनिक टोक्यो यात्रा जिसमें नियॉन सड़कें, शांत मंदिर और अविस्मरणीय भोजन स्थल शामिल हैं।",
        itinerary: [
          { day: "दिन 1", activities: [{ location: "शिबुया", text: "शिबुया और शिंजुकु नियॉन सड़कें और प्रतिष्ठित क्रॉसिंग।" }] },
          { day: "दिन 2", activities: [{ location: "असाकुसा", text: "असाकुसा मंदिर + स्काईट्री क्षेत्र की सैर।" }] },
          { day: "दिन 6", activities: [{ location: "हवाई अड्डा", text: "प्रस्थान स्थानांतरण और अंतिम समय की खरीदारी।" }] }
        ],
        inclusions: ["5 रातें ठहरना", "निजी गाइड", "मेट्रो पास", "प्रवेश शुल्क"]
      }
    },
    route: {
      stops: [
        { label: "Tokyo", lat: 35.6762, lng: 139.6503 },
        { label: "Shibuya", lat: 35.6595, lng: 139.7005 },
        { label: "Asakusa", lat: 35.7148, lng: 139.8138 },
      ],
      path: [
        { lat: 35.6762, lng: 139.6503 },
        { lat: 35.6595, lng: 139.7005 },
        { lat: 35.7148, lng: 139.8138 },
      ],
    },
    type: "Round",
    inclusions: ["Hotel stay", "Metro guidance", "Local tour options"],
    isLimitedTime: true,
    discountPercentage: 25,
    expiryDate: "2026-04-09T10:00:00Z",
  },
  {
    id: 7,
    title: "Dubai Luxury Desert",
    price: 900,
    image: dubaiImg,
    images: [dubaiImg],
    duration: "4 Day / 3 Night",
    description: "City glamour meets desert adventure with skyline views, souks, and a premium desert safari.",
    itinerary: [
      {
        location: "Downtown Dubai",
        text: "Downtown sightseeing and skyline viewpoints.",
      },
      {
        location: "Desert Safari",
        text: "Premium desert safari with sunset and premium experiences.",
      },
      {
        location: "Dubai Marina",
        text: "Marina evening walk and relaxed city atmosphere.",
      },
      {
        location: "Departure",
        text: "Departure transfers and final moments.",
      },
    ],
    localizations: {
      de: {
        title: "Dubai Luxus-Wüste",
        description: "Stadtglamour trifft auf Wüstenabenteuer mit Skyline-Aussichten, Souks und einer Premium-Wüstensafari.",
        itinerary: [
          { location: "Dubai Downtown", text: "Downtown-Besichtigung und Skyline-Aussichtspunkte." },
          { location: "Wüstensafari", text: "Premium-Wüstensafari mit Sonnenuntergang." }
        ],
        inclusions: ["Hotelaufenthalt", "Transfers", "Wüstensafari", "Ausgewählte Erlebnisse"]
      },
      fr: {
        title: "Désert de luxe à Dubaï",
        description: "Le glamour de la ville rencontre l'aventure du désert avec des vues sur la skyline, des souks et un safari dans le désert premium.",
        itinerary: [
          { location: "Centre-ville de Dubaï", text: "Visite du centre-ville et points de vue sur la skyline." },
          { location: "Safari dans le désert", text: "Safari dans le désert premium avec coucher de soleil." }
        ],
        inclusions: ["Séjour à l'hôtel", "Transferts", "Safari dans le désert", "Expériences sélectionnées"]
      },
      zh: {
        title: "迪拜奢华沙漠",
        description: "城市魅力与沙漠探险相结合，拥有天际线美景、集市和高级沙漠野生动物园。",
        itinerary: [
          { location: "迪拜市中心", text: "市中心观光和度假胜地观光。" },
          { location: "沙漠野生动物园", text: "带日落和高级体验的高级沙漠巡游。" }
        ],
        inclusions: ["酒店住宿", "接送服务", "沙漠野生动物园", "精选体验"]
      },
      jp: {
        title: "ドバイ・ラグジュアリーデザート",
        description: "都会の華やかさと砂漠のアドベンチャーが出会う旅。スカイラインの眺め、スーク、プレミアムな砂漠サファリ。",
        itinerary: [
          { location: "ドバイ・ダウンタウン", text: "ダウンタウン観光とスカイラインの展望スポット。" },
          { location: "砂漠サファリ", text: "夕日を楽しむプレミアムな砂漠サファリ体験。" }
        ],
        inclusions: ["ホテル宿泊", "送迎費", "砂漠サファリ", "厳選体験"]
      },
      ar: {
        title: "دبي صحراء فاخرة",
        description: "سحر المدينة يلتقي بمغامرة الصحراء مع إطلالات على الأفق، والأسواق، وسفاري صحراوي متميز.",
        itinerary: [
          { location: "وسط مدينة دبي", text: "مشاهدة معالم المدينة ونقاط مشاهدة الأفق." },
          { location: "سفاري صحراوي", text: "سفاري صحراوي متميز مع غروب الشمس وتجارب متميزة." }
        ],
        inclusions: ["الإقامة في الفندق", "الانتقالات", "سفاري صحراوي", "تجارب مختارة"]
      },
      hi: {
        title: "दुबई लक्जरी रेगिस्तान",
        description: "शहर का ग्लैमर और रेगिस्तानी रोमांच, स्काईलाइन दृश्यों, बाज़ारों और प्रीमियम डेजर्ट सफारी के साथ।",
        itinerary: [
          { location: "डाउनटाउन दुबई", text: "डाउनटाउन दर्शनीय स्थल और स्काईलाइन दृष्टिकोण।" },
          { location: "डेजर्ट सफारी", text: "सूर्यास्त और प्रीमियम अनुभवों के साथ प्रीमियम डेजर्ट सफारी।" }
        ],
        inclusions: ["होटल प्रवास", "स्थानांतरण", "डेजर्ट सफारी", "चयनित अनुभव"]
      }
    },
    route: {
      stops: [
        { label: "Dubai", lat: 25.2048, lng: 55.2708 },
        { label: "Desert Camp", lat: 25.2617, lng: 55.3683 },
        { label: "Marina", lat: 25.0786, lng: 55.1391 },
      ],
      path: [
        { lat: 25.2048, lng: 55.2708 },
        { lat: 25.2617, lng: 55.3683 },
        { lat: 25.0786, lng: 55.1391 },
      ],
    },
    type: "Round",
    inclusions: ["Hotel stay", "Transfers", "Desert safari", "Selected experiences"],
    isLimitedTime: true,
    discountPercentage: 20,
    expiryDate: "2026-04-08T12:00:00Z",
  },
  {
    id: 8,
    title: "Sydney Harbor Escape",
    price: 1100,
    image: sydneyImg,
    images: [sydneyImg],
    duration: "5 Day / 4 Night",
    description: "Harbor vibes, coastal walks, and landmark experiences in one of the world’s best cities.",
    itinerary: [
      {
        location: "Sydney Opera House",
        text: "Welcome to Sydney with harbor views near the Opera House.",
      },
      {
        location: "Bondi",
        text: "Bondi to Coogee coastal walk and seaside stops.",
      },
      {
        location: "Blue Mountains",
        text: "Blue Mountains day option for scenic lookout experiences.",
      },
      {
        location: "Harbor Cruise",
        text: "Relax on a harbor cruise and enjoy the skyline from the water.",
      },
      {
        location: "Departure",
        text: "Departure transfers and final drop-off.",
      },
    ],
    localizations: {
      de: {
        title: "Sydney Harbor Escape",
        description: "Hafenatmosphäre, Küstenwanderungen und Wahrzeichen in einer der besten Städte der Welt.",
        itinerary: [
          { location: "Opernhaus Sydney", text: "Willkommen in Sydney mit Blick auf den Hafen." },
          { location: "Bondi", text: "Bondi nach Coogee Küstenwanderung." }
        ],
        inclusions: ["Hotelaufenthalt", "Transfers", "Hafenrundfahrt"]
      },
      fr: {
        title: "Évasion au port de Sydney",
        description: "Ambiance de port, promenades côtières et expériences emblématiques dans l'une des meilleures villes du monde.",
        itinerary: [
          { location: "Opéra de Sydney", text: "Bienvenue à Sydney avec vue sur le port près de l'Opéra." },
          { location: "Bondi", text: "Promenade côtière de Bondi à Coogee." }
        ],
        inclusions: ["Séjour à l'hôtel", "Transferts", "Croisière dans le port"]
      },
      zh: {
        title: "悉尼海港度假",
        description: "海港氛围、海岸漫步和地标性体验，尽在世界上最好的城市之一。",
        itinerary: [
          { location: "悉尼歌剧院", text: "欢迎来到悉尼，并在歌剧院附近欣赏海港美景。" },
          { location: "邦迪", text: "邦迪至库吉海岸漫步，沿途设有海滨停靠点。" }
        ],
        inclusions: ["酒店住宿", "接送服务", "海港游船"]
      },
      jp: {
        title: "シドニー・ハーバーエスケープ",
        description: "世界最高の都市の一つで、港の雰囲気、海岸散策、ランドマーク体験を楽しもう。",
        itinerary: [
          { location: "シドニー・オペラハウス", text: "シドニーへようこそ。オペラハウス近くの港の眺め。" },
          { day: "2日目", location: "ボンダイ", text: "ボンダイからクージーへの海岸散策。" }
        ],
        inclusions: ["ホテル宿泊", "送迎費", "ハーバークルーズ"]
      },
      ar: {
        title: "هروب ميناء سيدني",
        description: "أجواء الميناء، والمشي الساحلي، وتجارب المعالم البارزة في واحدة من أفضل مدن العالم.",
        itinerary: [
          { location: "دار أوبرا سيدني", text: "مرحبًا بكم في سيدني مع إطلالات على الميناء بالقرب من دار الأوبرا." },
          { location: "بوندي", text: "بوندي إلى كوجي المشي الساحلي والتوقفات الساحلية." }
        ],
        inclusions: ["الإقامة في الفندق", "الانتقالات", "رحلة بحرية في الميناء"]
      },
      hi: {
        title: "सिडनी हार्बर एस्केप",
        description: "दुनिया के सबसे अच्छे शहरों में से एक में हार्बर वाइब्स, तटीय सैर और मील का पत्थर अनुभव।",
        itinerary: [
          { day: "दिन 1", activities: [{ location: "सिडनी ओपेरा हाउस", text: "ओपेरा हाउस के पास बंदरगाह के दृश्यों के साथ सिडनी में आपका स्वागत है।" }] },
          { day: "दिन 2", activities: [{ location: "बोंडी", text: "बोंडी से कूगी तटीय पैदल मार्ग और समुद्र तटीय स्टॉप।" }] }
        ],
        inclusions: ["होटल प्रवास", "स्थानांतरण", "हार्बर क्रूज"]
      }
    },
    route: {
      stops: [
        { label: "Sydney", lat: -33.8688, lng: 151.2093 },
        { label: "Opera House", lat: -33.8568, lng: 151.2153 },
        { label: "Bondi", lat: -33.8908, lng: 151.2743 },
        { label: "Blue Mountains", lat: -33.7149, lng: 150.3020 },
      ],
      path: [
        { lat: -33.8688, lng: 151.2093 },
        { lat: -33.8568, lng: 151.2153 },
        { lat: -33.8908, lng: 151.2743 },
        { lat: -33.7149, lng: 150.3020 },
      ],
    },
    inclusions: ["Hotel stay", "Transfers", "Harbor cruise (subject to availability)"],
  }
];
