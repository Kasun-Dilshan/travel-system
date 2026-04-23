const sigiriyaImg = '/assets/sigiriya.png';
const kandyImg = '/assets/kandy.png';
const mirissaImg = '/assets/mirissa.png';
const galleImg = '/assets/galle.png';
const trincomaleeImg = '/assets/trincomalee.png';

const yalaImg = '/assets/yala.png';
const nuwaraImg = '/assets/nuwara-eliya.png';
const wilpattuImg = '/assets/wilpattu.png';

export const DESTINATIONS = [
  {
    id: "sigiriya",
    name: "Sigiriya",
    description: "The iconic Lion Rock fortress.",
    fullDescription: "Sigiriya or Sinhagiri is an ancient rock fortress located in the northern Matale District near the town of Dambulla in the Central Province, Sri Lanka. It is a site of historical and archaeological significance that is dominated by a massive column of rock around 180 metres high.",
    image: sigiriyaImg,
    images: [sigiriyaImg, '/assets/sigiriya-2.png', sigiriyaImg, sigiriyaImg, sigiriyaImg],
    facts: [
      { label: "Region", value: "Central Province" },
      { label: "Best Time", value: "January - April" },
      { label: "UNESCO site", value: "Yes" }
    ]
  },
  {
    id: "kandy",
    name: "Kandy",
    description: "The cultural heart and scenic hills.",
    fullDescription: "Kandy is a large city in central Sri Lanka. It's set on a plateau surrounded by mountains, which are home to tea plantations and biodiverse rainforest. The city's heart is scenic Kandy Lake, which is popular for strolling.",
    image: kandyImg,
    images: [kandyImg, '/assets/kandy-2.png', '/assets/kandy-3.png', kandyImg, kandyImg],
    facts: [
      { label: "Capital", value: "Hill Capital" },
      { label: "Highlights", value: "Temple of the Tooth" },
      { label: "Altitude", value: "500m" }
    ]
  },
  {
    id: "mirissa",
    name: "Mirissa",
    description: "Whale watching and pristine beaches.",
    fullDescription: "Mirissa is a small town on the south coast of Sri Lanka. It's known for its surfing and its big waves. But the main attraction is whale watching. The town is also home to a number of beautiful beaches.",
    image: mirissaImg,
    images: [mirissaImg, mirissaImg, mirissaImg, mirissaImg, mirissaImg],
    facts: [
      { label: "Vibe", value: "Relaxed Beach" },
      { label: "Activity", value: "Whale Watching" },
      { label: "Weather", value: "Tropical" }
    ]
  },
  {
    id: "galle",
    name: "Galle",
    description: "Colonial charm and historic ramparts.",
    fullDescription: "Galle is a city on the southwest coast of Sri Lanka. It’s known for Galle Fort, the fortified old city founded by Portuguese colonists in the 16th century. Stone sea walls, expanded by the Dutch, encircle car-free streets with architecture reflecting Portuguese, Dutch and British rule.",
    image: galleImg,
    images: [galleImg, '/assets/galle-2.png', galleImg, galleImg, galleImg],
    facts: [
      { label: "Architecture", value: "Colonial" },
      { label: "UNESCO", value: "World Heritage" },
      { label: "Distance", value: "120km from Colombo" }
    ]
  },
  {
    id: "trincomalee",
    name: "Trincomalee",
    description: "Crystal clear waters and golden sand.",
    fullDescription: "Trincomalee is a port city on the northeast coast of Sri Lanka. Set on a peninsula, the city is home to Nilaveli Beach and the Fort Frederick. The Koneswaram Temple sits atop Swami Rock, a cliff with a popular viewpoint.",
    image: trincomaleeImg,
    images: [trincomaleeImg, trincomaleeImg, trincomaleeImg, trincomaleeImg, trincomaleeImg],
    facts: [
      { label: "Bay", value: "Natural Harbor" },
      { label: "Beach", value: "Nilaveli" },
      { label: "Season", value: "May - September" }
    ]
  },
  {
    id: "yala",
    name: "Yala",
    description: "Experience the ultimate leopard safari.",
    fullDescription: "Yala National Park is a huge area of forest, grassland and lagoons bordering the Indian Ocean, in southeast Sri Lanka. It’s home to wildlife such as leopards, elephants and crocodiles, as well as hundreds of bird species.",
    image: yalaImg,
    images: [yalaImg, yalaImg, yalaImg, yalaImg, yalaImg],
    facts: [
      { label: "Wildlife", value: "Leopards, Elephants" },
      { label: "Area", value: "979 km²" },
      { label: "Status", value: "National Park" }
    ]
  },
  {
    id: "wilpattu",
    name: "Wilpattu",
    description: "Untamed wilderness and natural lakes.",
    fullDescription: "Wilpattu National Park is a park located on the island of Sri Lanka. The unique feature of this park is the existence of 'Willus' (Natural lakes) - Rainwater-filled coastal depressions or pan-like basins.",
    image: wilpattuImg,
    images: [wilpattuImg, wilpattuImg, wilpattuImg, wilpattuImg, wilpattuImg],
    facts: [
      { label: "Feature", value: "Villus (Natural Lakes)" },
      { label: "Animal", value: "Sloth Bear" },
      { label: "Size", value: "1,317 km²" }
    ]
  },
  {
    id: "nuwara-eliya",
    name: "Nuwara Eliya",
    description: "The 'Little England' of Sri Lanka.",
    fullDescription: "Nuwara Eliya is a city in the tea country hills of central Sri Lanka. The naturally occurring landscape of the town is world-renowned for its lush green tea plantations and temperate climate.",
    image: nuwaraImg,
    images: [nuwaraImg, nuwaraImg, nuwaraImg, nuwaraImg, nuwaraImg],
    facts: [
      { label: "Climate", value: "Temperate" },
      { label: "Nickname", value: "Little England" },
      { label: "Elevation", value: "1,868m" }
    ]
  }
];
