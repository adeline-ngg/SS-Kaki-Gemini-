import { PersonaProfile, UnderstandingItem, ActivityRecommendation, MyWorldStats, MyWorldCategory } from '../types';
import { OPPORTUNITY_CATALOG } from './opportunities';

export const DEMO_PERSONA: PersonaProfile = {
  name: 'Mdm Chen',
  chineseName: '陈秀兰',
  salutation: 'Mdm Chen',
  chineseSalutation: '陈阿姨',
  age: 71,
  location: 'Toa Payoh Central',
  neighborhood: 'Toa Payoh Lorong 4',
  preferredLanguages: 'Mandarin + English',
  bio: 'Lives independently in Toa Payoh. Used to enjoy ballroom dancing with her late husband. Now prefers gentler, comfortable activities and feels hesitant going to completely unfamiliar places alone.',
  interests: ['Ballroom dancing (classic waltz, cha-cha)', 'Morning tea & light stretching', 'Community gardens'],
  socialPreferences: 'Prefers small warm groups (4-8 pax) with someone to accompany or meet at the door',
  barriers: 'Does not like attending unfamiliar events alone; large noisy venues can be overwhelming',
  physicalPreference: 'Low-impact, comfortable pace, seated or gentle upright movement'
};

export const INITIAL_UNDERSTANDING_ITEMS: UnderstandingItem[] = [
  {
    id: 'u1',
    en: 'You still enjoy dancing',
    zh: '你依然很喜欢跳舞和音乐韵律',
    detailEn: 'Ballroom & melodic movement brings back fond memories',
    detailZh: '华尔兹和经典旋律是你熟悉的快乐回忆',
    iconName: 'music',
    confirmed: true,
  },
  {
    id: 'u2',
    en: "You'd rather go with someone",
    zh: '有伴同行或有人在门口迎接会更自在',
    detailEn: 'Prefers not walking into a brand new room alone',
    detailZh: '不太喜欢一个人独自走进陌生的新场地',
    iconName: 'users',
    confirmed: true,
  },
  {
    id: 'u3',
    en: 'Something gentle suits you better',
    zh: '节奏温和、舒适不费力的活动最适合现在',
    detailEn: 'Low impact, enjoyable pace without heavy strain',
    detailZh: '低负荷、轻量化，轻松舒展无负担',
    iconName: 'heart-handshake',
    confirmed: true,
  },
  {
    id: 'u4',
    en: 'Nearby is easier',
    zh: '离家近、步行或直达最方便',
    detailEn: 'Within Toa Payoh or a short pleasant walk',
    detailZh: '大巴窑社区内，交通便利无需繁琐换乘',
    iconName: 'map-pin',
    confirmed: true,
  },
];

export const RECOMMENDATIONS: ActivityRecommendation[] = OPPORTUNITY_CATALOG.slice(0, 3);

export const INITIAL_MY_WORLD_STATS: MyWorldStats = {
  outingsThisMonth: 4,
  peopleConnected: 6,
  newExperiences: 2,
  peopleHelped: 1,
};

export const MY_WORLD_CATEGORIES: MyWorldCategory[] = [
  {
    id: 'things-i-enjoy',
    titleEn: 'Things I enjoy',
    titleZh: '我喜欢的活动与爱好',
    count: 3,
    items: [
      {
        nameEn: 'Ballroom & Social Dancing',
        nameZh: '交谊舞与经典舞步',
        tagEn: 'Classic Waltz, Cha-cha',
        tagZh: '经典华尔兹、恰恰',
        noteEn: 'Practiced for over 20 years'
      },
      {
        nameEn: 'Morning Fresh Air & Light Stretches',
        nameZh: '晨间微风与舒缓伸展',
        tagEn: 'Sensory Garden, Parks',
        tagZh: '社区香草花园、公园'
      },
      {
        nameEn: 'Classic Evergreen Melodies',
        nameZh: '70-80年代怀旧金曲',
        tagEn: 'Mandarin & English classics',
        tagZh: '国语及经典英文老歌'
      }
    ]
  },
  {
    id: 'people',
    titleEn: 'People & Friends',
    titleZh: '认识的朋友与伙伴',
    count: 6,
    items: [
      {
        nameEn: 'Sarah (Activity Volunteer)',
        nameZh: 'Sarah（社区迎宾义工）',
        tagEn: 'Music & Movement Host',
        tagZh: '音乐韵律活动主理人',
        noteEn: 'Meets you at the lobby'
      },
      {
        nameEn: 'Auntie Mei Ling',
        nameZh: '美玲阿姨',
        tagEn: 'Neighbor · Lorong 4',
        tagZh: '邻居 · 4巷',
        noteEn: 'Enjoys morning walks'
      },
      {
        nameEn: 'Uncle Poh',
        nameZh: '傅叔叔',
        tagEn: 'Ballroom enthusiast',
        tagZh: '交谊舞老同好'
      }
    ]
  },
  {
    id: 'places',
    titleEn: 'Places in my neighbourhood',
    titleZh: '熟悉与常去的地方',
    count: 4,
    items: [
      {
        nameEn: 'Toa Payoh Community Hub',
        nameZh: '大巴窑民众联络所',
        tagEn: '8 min sheltered walk',
        tagZh: '步行 8 分钟有盖走廊'
      },
      {
        nameEn: 'Toa Payoh Sensory Garden',
        nameZh: '大巴窑社区感官花园',
        tagEn: 'Morning stroll spot',
        tagZh: '晨间散步好去处'
      },
      {
        nameEn: 'Lorong 4 Market & Food Centre',
        nameZh: '4巷熟食巴刹中心',
        tagEn: 'Morning Kopi C spot',
        tagZh: '喝早茶、买菜'
      }
    ]
  },
  {
    id: 'contribute',
    titleEn: 'Ways I contribute',
    titleZh: '我可以分享的经验与付出',
    count: 2,
    items: [
      {
        nameEn: 'Sharing Classic Dance Rhythm Tips',
        nameZh: '分享早年交谊舞步伐心得',
        tagEn: 'Mentoring peers',
        tagZh: '与同伴交流'
      },
      {
        nameEn: 'Welcoming New Neighbors',
        nameZh: '为新来的邻居带路',
        tagEn: 'Community kindness',
        tagZh: '邻里互助'
      }
    ]
  }
];

export const DEMO_INSIGHTS = {
  persona: {
    name: 'Mdm Chen',
    age: 71,
    profile: 'Independent older adult, pre-to-post retirement transition stage in Toa Payoh, Singapore.'
  },
  intentExtracted: {
    interest: 'Ballroom dancing & familiar nostalgic music',
    socialPreference: 'Prefers going with someone; high anxiety entering strange rooms alone',
    participationBarrier: 'Fear of isolation, lack of companion, unfamiliar environments',
    physicalPreference: 'Low-impact, gentle tempo, rest-friendly seating',
    language: 'Natural bilingual Singaporean vernacular (Mandarin + English)',
    recommendationLogic: 'Direct match of lifelong joy (music/dance) + friction removal (designated doorway greeter Sarah + 8 min walk) + low physical threshold (seated options).'
  },
  designPrinciples: [
    'Zero Stigma: No "elderly care" or clinical terminology; designed like a luxury modern consumer lifestyle companion.',
    'One Screen = One Primary Decision: Cognitive ease prevents decision fatigue or confusion.',
    'Voice-First Tactile Ergonomics: 64-80px touch targets, high contrast, warm terracotta/sage palette, generous baseline readability.'
  ]
};
