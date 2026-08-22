import { Opportunity, LifeParticipationGraph, UnderstandingItem } from '../types';

export const OPPORTUNITY_CATALOG: Opportunity[] = [
  // -------------------------------------------------------------
  // A. LIFESTYLE / SOCIAL (lifestyle_social)
  // -------------------------------------------------------------
  {
    id: 'opp-dance-social',
    titleEn: 'Music & Movement Social',
    titleZh: '音乐与温和韵律社交会',
    purposeType: 'lifestyle_social',
    participationPattern: 'recurring',
    topics: ['ballroom_dancing', 'nostalgic_music', 'gentle_movement'],
    contextTriggers: ['likes_dancing', 'wants_companion', 'gentle_activity'],
    provider: 'Toa Payoh Community Club',
    providerType: 'community',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: null,
    languages: ['Mandarin', 'English'],
    groupSize: 'Small group (6–8 people)',
    physicalIntensity: 'Gentle movement · Seated or standing',
    socialStyle: ['welcoming_buddy', 'warm_group', 'nostalgic'],
    contributionType: null,
    location: 'Toa Payoh Community Hub',
    locationDetail: 'Blk 177 Toa Payoh Central (8 min sheltered walk)',
    distanceLabel: '350m sheltered walk',
    timing: 'Every Wednesday · 10:30 AM',
    languagePill: 'English + 中文',
    intensity: 'Gentle tempo · Rest-friendly',
    hostName: 'Sarah & Uncle Poh',
    hostRole: 'Friendly volunteer facilitators who meet you at the reception',
    whyChosenEn: 'You enjoy dancing, prefer something gentler now, and would rather have someone greet you at the door.',
    whyChosenZh: '你喜欢舞蹈和音乐，希望活动轻松温和，而且有迎宾伙伴在门口等候陪伴。',
    detailedWhyPoints: [
      {
        titleEn: 'Familiar Melodies & Nostalgia',
        titleZh: '熟悉的老歌与经典旋律',
        descEn: 'Plays classic 60s–80s ballroom and evergreen favourites at a gentle volume.',
        descZh: '播放怀旧经典华尔兹和老歌，音量适中舒适。',
      },
      {
        titleEn: 'Doorway Welcome Buddy',
        titleZh: '贴心的迎宾伙伴',
        descEn: 'Volunteer Sarah will wait by the lift lobby at 10:20 AM so you never enter a room alone.',
        descZh: '义工 Sarah 会在上午 10:20 在电梯厅等候，陪伴你一起走进去。',
      },
      {
        titleEn: 'Gentle & Rest-Friendly',
        titleZh: '节奏温和，随时可坐下休息',
        descEn: 'Chairs with soft cushions are provided throughout the session for comfortable seated rest.',
        descZh: '每个位置都备有舒适靠椅，随时可以坐着跟着节奏轻松舒展与休息。',
      },
      {
        titleEn: 'Close to Home',
        titleZh: '近在大巴窑家门口',
        descEn: 'Only 350m sheltered walkway from your block in Toa Payoh.',
        descZh: '从你的住处出发仅 350 米有盖走廊，晴雨无忧。',
      }
    ]
  },
  {
    id: 'opp-garden-tea',
    titleEn: 'Morning Tea & Sensory Garden Stroll',
    titleZh: '晨间茶聚与社区花园漫步',
    purposeType: 'lifestyle_social',
    participationPattern: 'recurring',
    topics: ['gardening', 'morning_walk', 'tea_gathering'],
    contextTriggers: ['morning_routine', 'fresh_air', 'small_circle'],
    provider: 'Toa Payoh Central Zone Residents’ Network',
    providerType: 'community',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: null,
    languages: ['Mandarin', 'English', 'Hokkien'],
    groupSize: 'Cozy group (4–6 people)',
    physicalIntensity: 'Relaxed stroll · Flat sheltered paths',
    socialStyle: ['informal', 'unrushed', 'neighborly'],
    contributionType: null,
    location: 'Toa Payoh Sensory Garden',
    locationDetail: 'Lorong 2 Pavilion',
    distanceLabel: '400m walk',
    timing: 'Every Friday · 9:00 AM',
    languagePill: '中文 + English',
    intensity: 'Relaxed stroll · Flat paths',
    hostName: 'Auntie Mei Ling',
    hostRole: 'Community herbal gardening enthusiast',
    whyChosenEn: 'Quiet morning fresh air, friendly chatter over floral tea, and very close to your neighbourhood.',
    whyChosenZh: '清晨微风、花草香气与暖心茶聚，漫步平缓舒适，距离你家仅几步之遥。',
    detailedWhyPoints: [
      {
        titleEn: 'Relaxed & Unrushed',
        titleZh: '节奏从容随性',
        descEn: 'Zero physical rush. We pause at herb patches to chat and enjoy fresh pandan tea.',
        descZh: '没有匆忙步伐，在香草园边走边聊，品尝新鲜冲泡的班兰花茶。',
      },
      {
        titleEn: 'Familiar Neighbors',
        titleZh: '邻里熟悉的面孔',
        descEn: 'Meet neighbours from Lorong 3 & 4 who also enjoy tranquil mornings.',
        descZh: '同住 3、4 巷的邻居结伴，氛围温馨自然。',
      }
    ]
  },
  {
    id: 'opp-singing-circle',
    titleEn: 'Rhythm & Evergreen Singing Circle',
    titleZh: '常青经典老歌与轻节奏歌友会',
    purposeType: 'lifestyle_social',
    participationPattern: 'occasional_repeatable',
    topics: ['nostalgic_singing', 'music_percussion', 'indoor_aircon'],
    contextTriggers: ['music_lover', 'indoor_seated', 'nostalgia'],
    provider: 'Silver Arts Community Club',
    providerType: 'community',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: null,
    languages: ['Mandarin', 'English', 'Dialect'],
    groupSize: 'Small circle (8 people)',
    physicalIntensity: 'Seated rhythm & gentle singing',
    socialStyle: ['singalong', 'supportive', 'joyful'],
    contributionType: null,
    location: 'Toa Payoh West Activity Studio',
    locationDetail: 'Level 2, Lift accessible',
    distanceLabel: '600m walk / 2 bus stops',
    timing: 'Next Monday · 2:00 PM',
    languagePill: 'Mandarin + Dialect + English',
    intensity: 'Seated rhythm & gentle singing',
    hostName: 'Mr. David Tan',
    hostRole: 'Retired music teacher & keyboard player',
    whyChosenEn: 'Combines your love for classic rhythm with joyful singing in an air-conditioned room.',
    whyChosenZh: '结合你对节奏音乐的热爱，坐着弹唱怀旧金曲，清凉舒适无体力负担。',
    detailedWhyPoints: [
      {
        titleEn: 'Comfortable Seating',
        titleZh: '全场冷气舒适座席',
        descEn: 'Enjoy light handheld percussion (tambourines, bells) while seated comfortably.',
        descZh: '坐在靠椅上轻轻拍打手鼓或手铃，随心跟唱。',
      }
    ]
  },

  // -------------------------------------------------------------
  // B. LIFE-STAGE LEARNING (life_stage_learning) - High Stakes Education
  // -------------------------------------------------------------
  {
    id: 'opp-cpf-foundations',
    titleEn: 'Understanding Relevant Information for Retirement Planning',
    titleZh: '退休规划与公积金客观资讯公益讲座（官方认证）',
    purposeType: 'life_stage_learning',
    participationPattern: 'milestone_once',
    topics: ['cpf_education', 'retirement_transition', 'payout_options'],
    contextTriggers: ['approaching_retirement', 'cpf_confusion', 'life_stage_transition', 'retirement_planning_info_potential'],
    provider: 'CPF Board & Council for Third Age (C3A)',
    providerType: 'government',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: 'retirement_foundations',
    languages: ['English', 'Mandarin'],
    groupSize: 'Interactive seminar (15–20 pax)',
    physicalIntensity: 'Comfortable seated talk with Q&A',
    socialStyle: ['educational', 'friendly_qna', 'authoritative_trust'],
    contributionType: null,
    location: 'Toa Payoh Public Library Activity Room',
    locationDetail: 'Level 3 Programme Zone (Sheltered from MRT)',
    distanceLabel: '500m from Central',
    timing: 'Saturday, 28 Aug · 2:30 PM',
    languagePill: 'English & 中文同场指导',
    intensity: 'Seated seminar with plain-language notes',
    hostName: 'Officer Raymond Tan & C3A Guides',
    hostRole: 'Accredited public education officer (No commercial sales)',
    whyChosenEn: 'Interested in understanding relevant information for retirement planning. This is an official non-commercial public education session (no sales or financial advice).',
    whyChosenZh: '有兴趣了解退休规划相关客观资讯。这是官方与社区联合举办的公益教育讲座，绝无商业推销与个人理财诱导。',
    detailedWhyPoints: [
      {
        titleEn: 'Trusted Verified Education',
        titleZh: '官方认证公益教育',
        descEn: 'Organised by CPF Board and C3A to explain retirement payout options clearly without jargon.',
        descZh: '由公积金局与飞跃老龄中心联合举办，用通俗语言讲解退休入息安排。',
      },
      {
        titleEn: 'Zero Commercial Selling',
        titleZh: '纯公益讲解，无推销困扰',
        descEn: 'Strictly informative guidelines and step-by-step assistance for older adults.',
        descZh: '纯公益政策科普与疑问解答，不推销任何商业金融产品。',
      },
      {
        titleEn: 'Bilingual Handouts & Guidance',
        titleZh: '大字版中英双语资料',
        descEn: 'Take-home checklists with large print and friendly volunteers to answer individual queries.',
        descZh: '现场提供大字版中英文指南，志工一对一耐心解答疑问。',
      }
    ]
  },
  {
    id: 'opp-estate-lpa',
    titleEn: 'Navigating Lasting Power of Attorney (LPA) & Estate Basics',
    titleZh: '持久授权书（LPA）与家庭法律常识公益科普',
    purposeType: 'life_stage_learning',
    participationPattern: 'milestone_once',
    topics: ['lpa_education', 'estate_planning_basics', 'advance_care'],
    contextTriggers: ['legal_planning', 'peace_of_mind', 'family_protection'],
    provider: 'Pro Bono SG & Community Justice Centre',
    providerType: 'community',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: 'estate_lpa_basics',
    languages: ['Mandarin', 'English'],
    groupSize: 'Community workshop (12–15 pax)',
    physicalIntensity: 'Seated workshop',
    socialStyle: ['informative', 'calm', 'supportive'],
    contributionType: null,
    location: 'Toa Payoh West CC Conference Hall',
    locationDetail: '200 Lorong 2 Toa Payoh',
    distanceLabel: '450m walk',
    timing: 'Thursday, 3 Sep · 10:00 AM',
    languagePill: '中文 + English',
    intensity: 'Seated talk + 1-on-1 clinic sign-up',
    hostName: 'Lawyer Alvin & Community Volunteers',
    hostRole: 'Pro Bono community lawyer and patient volunteer facilitators',
    whyChosenEn: 'Practical, peaceful preparation for family peace of mind from accredited pro-bono community lawyers.',
    whyChosenZh: '由社区公益律师讲解 LPA 与家庭法定授权基础知识，为未来生活保驾护航。',
    detailedWhyPoints: [
      {
        titleEn: 'Accredited Legal Education',
        titleZh: '正规公益法律普及',
        descEn: 'Explains what LPA Form 1 entails and step-by-step application via Singpass.',
        descZh: '指导如何通过 Singpass 完成 LPA 申请及重要监护人指定注意事项。',
      }
    ]
  },

  // -------------------------------------------------------------
  // C. CONTRIBUTION / PURPOSE (contribution_purpose)
  // -------------------------------------------------------------
  {
    id: 'opp-youth-mentor',
    titleEn: 'Youth Career & Life Story Mentorship Circle',
    titleZh: '青年职业经验与人生故事导师圈',
    purposeType: 'contribution_purpose',
    participationPattern: 'recurring',
    topics: ['mentoring', 'career_experience', 'youth_development', 'sharing_wisdom'],
    contextTriggers: ['misses_mentoring', 'retired_manager', 'values_giving_back'],
    provider: 'National Youth Council & Silver Mentors SG',
    providerType: 'volunteer_organisation',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: null,
    languages: ['English', 'Mandarin'],
    groupSize: '1-to-1 or small tables (3–4 pax)',
    physicalIntensity: 'Comfortable cafe-style seated chat',
    socialStyle: ['purposeful', 'intergenerational', 'meaningful'],
    contributionType: 'mentoring_career',
    location: 'Lifelong Learning Institute / Bishan Hub',
    locationDetail: 'Direct Circle Line / North-South Line',
    distanceLabel: '1 MRT stop / 10 mins',
    timing: 'Alternate Saturdays · 3:00 PM',
    languagePill: 'English + 中文',
    intensity: 'Relaxed seated discussion with tea & snacks',
    hostName: 'Clara (Youth Coordinator) & Silver Alumni',
    hostRole: 'Program manager matching your expertise with appreciative polytechnic & university youth',
    whyChosenEn: 'You accumulated decades of rich management and life wisdom. Polytechnic students are looking for mentors just like you.',
    whyChosenZh: '你拥有数十载宝贵的管理与职场经验。正在起步的年轻人非常渴望倾听你的经验故事。',
    detailedWhyPoints: [
      {
        titleEn: 'Your Experience is Truly Valued',
        titleZh: '你的阅历是一笔宝贵财富',
        descEn: 'Youth actively seek guidance on workplace resilience, handling people, and career transitions.',
        descZh: '大专与大学年轻人非常珍惜前辈在沟通协调和处事智慧上的真诚指导。',
      },
      {
        titleEn: 'Structured & Comfortable',
        titleZh: '组织规范，环境舒适惬意',
        descEn: 'Informal coffee table chats with guided conversation prompts and complimentary refreshments.',
        descZh: '在宽敞舒适的咖啡厅环境轻松交流，配有暖心指引话题。',
      }
    ]
  },
  {
    id: 'opp-dance-mentor',
    titleEn: 'Ballroom Tips & Welcome Buddy for Beginners',
    titleZh: '交谊舞基础互助与迎宾小导师',
    purposeType: 'contribution_purpose',
    participationPattern: 'recurring',
    topics: ['peer_sharing', 'dance_mentoring', 'welcoming_peers'],
    contextTriggers: ['dance_enthusiast', 'likes_helping', 'gentle_activity'],
    provider: 'Toa Payoh Active Ageing Centre',
    providerType: 'community',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: null,
    languages: ['Mandarin', 'English'],
    groupSize: 'Small group of 6 peers',
    physicalIntensity: 'Light movement · Seated rhythmic coaching',
    socialStyle: ['supportive', 'mentor', 'heartwarming'],
    contributionType: 'peer_sharing',
    location: 'Toa Payoh Central CC Activity Studio',
    locationDetail: 'Room 03-02',
    distanceLabel: '350m walk',
    timing: 'Tuesday · 10:00 AM',
    languagePill: '中文 + English',
    intensity: 'Light tempo coaching & clapping rhythm',
    hostName: 'Sarah & Volunteer Team',
    hostRole: 'Inviting experienced dancers to share basic posture tips',
    whyChosenEn: 'Allows you to share your dance background to encourage timid new beginners.',
    whyChosenZh: '发挥你多年的舞蹈经验，在轻松的氛围中鼓励刚接触节奏的新朋友。',
    detailedWhyPoints: [
      {
        titleEn: 'Encourage Timid Beginners',
        titleZh: '鼓励初学同龄人',
        descEn: 'Help new participants find the rhythm without needing fast footwork.',
        descZh: '坐在椅子上打节拍，帮助初学者轻松找到华尔兹的拍子。',
      }
    ]
  },

  // -------------------------------------------------------------
  // D. DISCOVERY / EXPERIENCE (discovery_experience)
  // -------------------------------------------------------------
  {
    id: 'opp-peranakan-tile',
    titleEn: 'Peranakan Heritage Ceramic Tile Crafting',
    titleZh: '娘惹传统风情彩绘瓷砖手作工作坊',
    purposeType: 'discovery_experience',
    participationPattern: 'occasional_repeatable',
    topics: ['heritage_craft', 'novelty_art', 'peranakan_culture'],
    contextTriggers: ['craving_novelty', 'creative_discovery', 'new_experience'],
    provider: 'National Heritage Board & Katong Arts Co-op',
    providerType: 'community',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: 'peranakan_tile_craft',
    languages: ['English', 'Mandarin'],
    groupSize: 'Small hands-on studio (6–8 pax)',
    physicalIntensity: 'Seated crafting with natural glazes',
    socialStyle: ['creative', 'calm', 'inspiring'],
    contributionType: null,
    location: 'Toa Payoh Heritage Arts Corner',
    locationDetail: 'Level 1 Gallery Space',
    distanceLabel: '500m sheltered stroll',
    timing: 'Next Sunday · 2:00 PM',
    languagePill: 'English + 中文',
    intensity: 'Relaxed seated art · Zero drawing experience needed',
    hostName: 'Artisan Jeanette & Uncle Bobby',
    hostRole: 'Heritage tile conservators who guide every step patiently',
    whyChosenEn: 'You wanted to try something delightfully different. Create a beautiful vintage floral tile to take home.',
    whyChosenZh: '你想尝试一些新鲜有趣的体验。在轻松舒缓的下午亲手制作一块典雅的娘惹彩绘瓷砖带回家。',
    detailedWhyPoints: [
      {
        titleEn: 'A Refreshing New Creative Spark',
        titleZh: '耳目一新的全新体验',
        descEn: 'Explore rich vintage pastel floral motifs using pre-drawn wooden stamps—no drawing skill required.',
        descZh: '提供现成古典图案印版与环保釉料，无需绘画基础，轻松体验彩绘乐趣。',
      },
      {
        titleEn: 'Keep What You Make',
        titleZh: '带走专属手作纪念品',
        descEn: 'Your finished fired ceramic coaster makes a charming tea saucer for your home.',
        descZh: '制作完成的瓷砖垫可作为精美杯垫或家居装饰。',
      }
    ]
  },
  {
    id: 'opp-botanic-soundwalk',
    titleEn: 'Singapore Botanic Gardens Morning Soundwalk',
    titleZh: '新加坡植物园晨间微风与自然声景导览',
    purposeType: 'discovery_experience',
    participationPattern: 'one_off',
    topics: ['nature_discovery', 'soundscape', 'heritage_trees'],
    contextTriggers: ['loves_nature', 'novelty', 'weekend_outing'],
    provider: 'National Parks Board (NParks)',
    providerType: 'government',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: 'botanic_dawn_walk_2026',
    languages: ['English', 'Mandarin'],
    groupSize: 'Guided group (10 pax)',
    physicalIntensity: 'Gentle boardwalk walking with frequent rest stops',
    socialStyle: ['mindful', 'scenic', 'refreshing'],
    contributionType: null,
    location: 'Singapore Botanic Gardens (Tanglin Gate)',
    locationDetail: 'Sheltered MRT connection',
    distanceLabel: 'Direct MRT 15 mins',
    timing: 'Sunday, 5 Sep · 8:30 AM',
    languagePill: 'English + 中文',
    intensity: 'Flat shaded boardwalk stroll',
    hostName: 'Naturalist Mark & Volunteer Guides',
    hostRole: 'NParks certified nature docent',
    whyChosenEn: 'A serene nature discovery outing listening to morning songbirds along flat, shaded pathways.',
    whyChosenZh: '在平缓绿树成荫的木栈道上，聆听清晨鸟鸣与大自然的美妙声景。',
    detailedWhyPoints: [
      {
        titleEn: 'Shaded Flat Paths',
        titleZh: '平坦绿荫步道',
        descEn: 'Completely step-free route with rest benches every 50 meters.',
        descZh: '全程无台阶，每隔50米均有休息长椅，安全舒适。',
      }
    ]
  },

  // -------------------------------------------------------------
  // E. CAPABILITY / INDEPENDENCE (capability_independence)
  // -------------------------------------------------------------
  {
    id: 'opp-smartphone-smart-living',
    titleEn: 'Smartphone Confidence & Everyday Digital Ease',
    titleZh: '智能手机实用技巧与乐龄数字生活工作坊',
    purposeType: 'capability_independence',
    participationPattern: 'series',
    topics: ['smartphone_literacy', 'digital_banking_safety', 'singpass_navigation'],
    contextTriggers: ['digital_struggle', 'scam_safety', 'practical_independence'],
    provider: 'Seniors Go Digital (IMDA & SG Digital Office)',
    providerType: 'government',
    verifiedProvider: true,
    featured: false,
    repeatTopicKey: 'smartphone_level_1',
    languages: ['Mandarin', 'English', 'Dialects'],
    groupSize: 'Small hands-on clinic (1 digital ambassador per 2 seniors)',
    physicalIntensity: 'Air-conditioned seated workshop',
    socialStyle: ['encouraging', 'patient', 'practical'],
    contributionType: null,
    location: 'Toa Payoh Community Library Level 2',
    locationDetail: 'Activity Hub',
    distanceLabel: '400m walk',
    timing: 'Every Thursday (4 sessions) · 2:30 PM',
    languagePill: '中文 + English + 方言',
    intensity: 'Relaxed seated 1-on-1 pace',
    hostName: 'Digital Ambassador Nicholas',
    hostRole: 'Friendly full-time IMDA youth digital ambassador',
    whyChosenEn: 'Practical tips to navigate WhatsApp large font, bus arrival timings, and identify online scams with zero stress.',
    whyChosenZh: '耐心一对一指导，教你轻松调整大字体、查看巴士到站时间、识别网络诈骗，让手机使用得心应手。',
    detailedWhyPoints: [
      {
        titleEn: '1-on-1 Patient Guidance',
        titleZh: '一对一耐心手把手指导',
        descEn: 'Digital ambassadors sit beside you to explain every step without rushing.',
        descZh: '数码大使坐在身旁耐心指导，按你的节奏一步步练习。',
      },
      {
        titleEn: 'Everyday Practical Independence',
        titleZh: '学了就能用的生活便利',
        descEn: 'Learn how to book polyclinic appointments and check CPF balances confidently.',
        descZh: '掌握诊所预约、出行查车、防诈骗等实用生活技能。',
      }
    ]
  },

  // -------------------------------------------------------------
  // FEATURED EVENT EXAMPLES (For Scenario F Testing)
  // -------------------------------------------------------------
  {
    id: 'opp-featured-gentle-dance-meetup',
    titleEn: 'Heartland Tea Dance & Nostalgic Waltz Meetup',
    titleZh: '邻里怀旧茶舞与经典华尔兹周末聚会',
    purposeType: 'lifestyle_social',
    participationPattern: 'recurring',
    topics: ['ballroom_dancing', 'nostalgic_music', 'social_dance'],
    contextTriggers: ['likes_dancing', 'social_meetup', 'weekend'],
    provider: 'Singapore Ballroom Dance Association & PA',
    providerType: 'community',
    verifiedProvider: true,
    featured: true, // FEATURED: Relevant to dancer + gentle tempo -> Receives appropriate ranking boost!
    repeatTopicKey: null,
    languages: ['English', 'Mandarin'],
    groupSize: 'Friendly hall (10–12 pax)',
    physicalIntensity: 'Gentle movement · Seated rhythm support',
    socialStyle: ['warm', 'festive', 'nostalgic'],
    contributionType: null,
    location: 'Bishan Community Club Hall',
    locationDetail: 'Opposite Bishan MRT (1 stop from Toa Payoh)',
    distanceLabel: '1 MRT stop / 8 mins',
    timing: 'Saturday · 3:00 PM',
    languagePill: 'English + 中文',
    intensity: 'Gentle tempo · Soft air-conditioned hall',
    hostName: 'Master Colin & Community Greeters',
    hostRole: 'Gentle ballroom instructor with friendly student greeters at entrance',
    whyChosenEn: 'A joyful weekend ballroom gathering featuring classic waltzes, friendly greeters, and low-impact rhythms.',
    whyChosenZh: '周末邻里怀旧交谊茶会，播放优雅华尔兹金曲，门口有专人迎接，环境清凉宽敞。',
    detailedWhyPoints: [
      {
        titleEn: 'Classic Waltz & Cha-cha Melodies',
        titleZh: '优美华尔兹与轻快恰恰',
        descEn: 'Enjoy evergreen tunes from the golden era with low-tempo steps.',
        descZh: '精选黄金年代经典舞曲，节奏舒缓优雅。',
      },
      {
        titleEn: 'Featured Heartland Gathering',
        titleZh: '精选邻里活动',
        descEn: 'Supported by community dance enthusiasts with comfortable seating throughout.',
        descZh: '备有充足冷气座席，随时可坐着品茶听歌或随着节拍轻舞。',
      }
    ]
  },
  {
    id: 'opp-featured-badminton-heavy',
    titleEn: 'Active Heartland Smash Badminton Tournament',
    titleZh: '全国社区羽毛球快节奏对抗巡回赛',
    purposeType: 'lifestyle_social',
    participationPattern: 'one_off',
    topics: ['competitive_sports', 'badminton', 'high_speed'],
    contextTriggers: ['sports_athlete', 'high_intensity'],
    provider: 'ActiveSG Sports League',
    providerType: 'government',
    verifiedProvider: true,
    featured: true, // FEATURED: BUT completely irrelevant/incompatible for gentle knee preference -> Must NEVER be recommended!
    repeatTopicKey: null,
    languages: ['English'],
    groupSize: 'Large tournament (60 pax)',
    physicalIntensity: 'High intensity fast running & jumping',
    socialStyle: ['competitive', 'high_energy'],
    contributionType: null,
    location: 'Toa Payoh Sports Hall',
    locationDetail: 'Court 1-4',
    distanceLabel: '800m walk',
    timing: 'Sunday · 9:00 AM',
    languagePill: 'English',
    intensity: 'High impact fast running',
    hostName: 'Coach Marcus',
    hostRole: 'Tournament referee',
    whyChosenEn: 'High intensity fast-paced competitive sports.',
    whyChosenZh: '高强度快节奏运动比赛。',
    detailedWhyPoints: [
      {
        titleEn: 'High Intensity',
        titleZh: '高强度对抗',
        descEn: 'Fast reflexes and vigorous running.',
        descZh: '快节奏剧烈跑动。',
      }
    ]
  },

  // -------------------------------------------------------------
  // HIGH-STAKES HEALTHCARE & MEDICAL TRUST EXAMPLES
  // -------------------------------------------------------------
  {
    id: 'opp-joint-health-mobility',
    titleEn: 'Senior Joint Care & Gentle Mobility Public Education Workshop',
    titleZh: '乐龄关节健康照护与日常活动公益科普讲座（官方医疗认证）',
    purposeType: 'life_stage_learning',
    participationPattern: 'milestone_once',
    topics: ['joint_health_education', 'senior_mobility', 'healthcare_basics', 'chronic_disease_management'],
    contextTriggers: ['joint_care_inquiry', 'healthcare_education_need', 'knee_comfort_guidance'],
    provider: 'National Healthcare Group Polyclinics & HPB',
    providerType: 'healthcare',
    verifiedProvider: true, // VERIFIED: Accredited public healthcare institution
    featured: false,
    repeatTopicKey: 'joint_health_workshop',
    languages: ['Mandarin', 'English'],
    groupSize: 'Community educational group (12–15 pax)',
    physicalIntensity: 'Seated informative talk with certified physiotherapist guidance',
    socialStyle: ['educational', 'supportive', 'authoritative_trust'],
    contributionType: null,
    location: 'Toa Payoh Polyclinic Health Education Room',
    locationDetail: '2003 Lorong 8 Toa Payoh Level 2',
    distanceLabel: 'Sheltered connection',
    timing: 'Friday · 10:00 AM',
    languagePill: '中文 + English',
    intensity: 'Seated talk with take-home exercise pamphlets',
    hostName: 'Nurse Clinician Lim & Polyclinic Physiotherapist',
    hostRole: 'Certified public healthcare educators',
    whyChosenEn: 'Educational session by public healthcare professionals on daily joint care habits without commercial sales or prescription claims.',
    whyChosenZh: '由公立综合诊疗所专业医护人员讲解日常关节保养常识，纯公益科普，无商业推销。',
    detailedWhyPoints: [
      {
        titleEn: 'Certified Healthcare Education',
        titleZh: '专业医护公益科普',
        descEn: 'Led by accredited physiotherapists explaining safe daily movements.',
        descZh: '由专业物理治疗师讲解日常保护关节的平缓活动常识。',
      }
    ]
  },
  {
    id: 'opp-unverified-supplement-sales',
    titleEn: 'Miracle Joint Quick-Cure Commercial Sales Pitch',
    titleZh: '神效关节灵高价保健品推销讲座（未认证商业推销）',
    purposeType: 'life_stage_learning',
    participationPattern: 'one_off',
    topics: ['joint_health_education', 'medical_cure_claims', 'supplement_sales'],
    contextTriggers: ['joint_care_inquiry', 'healthcare_education_need'],
    provider: 'Unverified Commercial Health Mart Pte Ltd',
    providerType: 'verified_business',
    verifiedProvider: false, // UNVERIFIED: High-stakes medical topic from unverified provider -> MUST BE REJECTED!
    featured: false,
    repeatTopicKey: null,
    languages: ['Mandarin', 'English'],
    groupSize: 'Commercial sales pitch',
    physicalIntensity: 'Seated high-pressure seminar',
    socialStyle: ['aggressive_sales'],
    contributionType: null,
    location: 'Commercial Retail Shop',
    locationDetail: 'Commercial Unit #01-12',
    distanceLabel: '1 km away',
    timing: 'Daily',
    languagePill: 'English',
    intensity: 'High pressure sales talk',
    hostName: 'Sales Agent Jason',
    hostRole: 'Commercial supplement salesman',
    whyChosenEn: 'Unverified commercial sales pitch making medical claims.',
    whyChosenZh: '未认证商业推销，宣称神效。',
    detailedWhyPoints: [
      {
        titleEn: 'Commercial Sales',
        titleZh: '商业推销',
        descEn: 'Aggressive sales pitch for unverified products.',
        descZh: '推销未经认证的昂贵保健品。',
      }
    ]
  }
];

// Default baseline Life Participation Graph for Mdm Chen
export const DEFAULT_LIFE_PARTICIPATION_GRAPH: LifeParticipationGraph = {
  profile: {
    name: 'Mdm Chen',
    chineseName: '陈秀兰',
    salutation: 'Mdm Chen',
    chineseSalutation: '陈阿姨',
    age: 71,
    location: 'Toa Payoh Central',
    neighborhood: 'Toa Payoh Lorong 4',
    languages: ['Mandarin', 'English'],
    lifeStage: 'approaching_retirement',
    bio: 'Lives independently in Toa Payoh. Used to enjoy ballroom dancing with her husband. Now prefers gentler, comfortable activities and feels hesitant going to completely unfamiliar places alone.',
  },
  interests: ['Ballroom dancing (classic waltz, cha-cha)', 'Morning tea & light stretching', 'Community gardens', 'Evergreen songs'],
  capabilities: ['Classic dance rhythm knowledge', 'Herbal tea brewing', 'Cooking heritage dishes'],
  purposeDrivers: ['Mentoring peers', 'Sharing life experiences', 'Helping shy neighbors'],
  importantRelationships: ['Husband (cherished memory)', 'Auntie Mei Ling (neighbor)', 'Volunteer Sarah'],
  socialPreferences: ['Prefers small warm groups (4-8 pax)', 'Doorway companion / greeter at entrance'],
  participationBarriers: ['Unfamiliar venues alone', 'Knee strain / high impact activities', 'Loud crowded noisy environments'],
  accessibilityPreferences: ['Low impact comfortable tempo', 'Seated or rest-friendly options', 'Sheltered walkways < 500m'],
  activityPreferences: ['Morning or early afternoon', 'Air-conditioned or shaded breezy outdoors'],
  contextualSignals: ['Retirement transition', 'Craving gentle nostalgia'],
  completedOpportunityIds: [],
  completedTopicKeys: [],
  currentSeries: [],
  recentOpportunityHistory: [],
  dislikes: ['Vigorous jumping / running', 'Aggressive commercial sales'],
};

/**
 * Creates an immutable, deep-cloned clean Life Participation Graph
 * starting strictly from the clean baseline and applying optional overrides.
 * This guarantees zero cross-scenario state contamination.
 */
export function createFreshGraph(override?: Partial<LifeParticipationGraph>): LifeParticipationGraph {
  const base = JSON.parse(JSON.stringify(DEFAULT_LIFE_PARTICIPATION_GRAPH)) as LifeParticipationGraph;
  if (!override) return base;

  return {
    ...base,
    ...override,
    profile: {
      ...base.profile,
      ...(override.profile || {}),
      languages: override.profile?.languages ? [...override.profile.languages] : [...base.profile.languages],
    },
    interests: override.interests ? [...override.interests] : [...base.interests],
    capabilities: override.capabilities ? [...override.capabilities] : [...base.capabilities],
    purposeDrivers: override.purposeDrivers ? [...override.purposeDrivers] : [...base.purposeDrivers],
    importantRelationships: override.importantRelationships ? [...override.importantRelationships] : [...base.importantRelationships],
    socialPreferences: override.socialPreferences ? [...override.socialPreferences] : [...base.socialPreferences],
    participationBarriers: override.participationBarriers ? [...override.participationBarriers] : [...base.participationBarriers],
    accessibilityPreferences: override.accessibilityPreferences ? [...override.accessibilityPreferences] : [...base.accessibilityPreferences],
    activityPreferences: override.activityPreferences ? [...override.activityPreferences] : [...base.activityPreferences],
    contextualSignals: override.contextualSignals ? [...override.contextualSignals] : [...base.contextualSignals],
    completedOpportunityIds: override.completedOpportunityIds ? [...override.completedOpportunityIds] : [...base.completedOpportunityIds],
    completedTopicKeys: override.completedTopicKeys ? [...override.completedTopicKeys] : [...base.completedTopicKeys],
    currentSeries: override.currentSeries ? JSON.parse(JSON.stringify(override.currentSeries)) : JSON.parse(JSON.stringify(base.currentSeries)),
    recentOpportunityHistory: override.recentOpportunityHistory ? JSON.parse(JSON.stringify(override.recentOpportunityHistory)) : JSON.parse(JSON.stringify(base.recentOpportunityHistory)),
    dislikes: override.dislikes ? [...override.dislikes] : [...base.dislikes],
  };
}

/**
 * Builds Understanding screen cards from the live Life Participation Graph
 * so voice conversations do not reuse the canned demo lines.
 */
export function understandingItemsFromGraph(graph: LifeParticipationGraph): UnderstandingItem[] {
  const items: UnderstandingItem[] = [];

  const add = (
    en: string,
    zh: string,
    iconName: UnderstandingItem['iconName'],
    category: UnderstandingItem['category']
  ) => {
    if (!en || items.length >= 4) return;
    if (items.some((item) => item.en.toLowerCase() === en.toLowerCase())) return;
    items.push({
      id: `u-graph-${items.length + 1}`,
      en,
      zh: zh || en,
      detailEn: '',
      detailZh: '',
      iconName,
      confirmed: true,
      category,
    });
  };

  for (const interest of graph.interests || []) {
    add(interest, interest, 'music', 'interest');
  }
  for (const barrier of graph.participationBarriers || []) {
    add(barrier, barrier, 'users', 'barrier');
  }
  for (const access of graph.accessibilityPreferences || []) {
    add(access, access, 'heart-handshake', 'barrier');
  }
  if (graph.profile?.lifeStage) {
    const stage = graph.profile.lifeStage.replace(/_/g, ' ');
    add(`Life stage: ${stage}`, `人生阶段：${stage}`, 'book-open', 'life_stage');
  }
  for (const signal of graph.contextualSignals || []) {
    add(signal, signal, 'sparkles', 'life_stage');
  }

  return items.slice(0, 4);
}
