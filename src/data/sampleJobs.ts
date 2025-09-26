export const sampleJobs = [
  {
    id: "1",
    title: "営業アシスタント（未経験歓迎）",
    company: "株式会社東京商事",
    location: "東京都新宿区",
    salary: "月給22万円～28万円",
    workTime: "9:00～18:00",
    employmentType: "正社員",
    description: "営業チームをサポートしていただく営業アシスタントを募集しています。資料作成、顧客対応、スケジュール管理などの業務をお任せします。",
    tags: ["未経験歓迎", "駅近", "社会保険完備"],
    featured: true
  },
  {
    id: "2", 
    title: "Webデザイナー・UI/UXデザイナー",
    company: "株式会社クリエイティブテック",
    location: "東京都渋谷区",
    salary: "月給30万円～45万円",
    workTime: "10:00～19:00",
    employmentType: "正社員",
    description: "自社サービスのWebサイト・アプリのUI/UXデザインを担当していただきます。ユーザー体験を重視したデザイン制作をお願いします。",
    tags: ["リモートOK", "フレックスタイム", "スキルアップ"],
    featured: true
  },
  {
    id: "3",
    title: "コールセンタースタッフ（時短勤務OK）",
    company: "サポートセンター株式会社",
    location: "大阪府大阪市",
    salary: "時給1,200円～1,400円",
    workTime: "9:00～17:00（時短相談可）",
    employmentType: "パート・アルバイト",
    description: "お客様からの問い合わせ対応をお任せします。丁寧な研修があるので、未経験の方も安心してご応募ください。",
    tags: ["未経験歓迎", "時短勤務OK", "研修充実"]
  },
  {
    id: "4",
    title: "システムエンジニア（Java・Spring）",
    company: "ITソリューションズ株式会社",
    location: "神奈川県横浜市",
    salary: "月給35万円～50万円",
    workTime: "9:00～18:00",
    employmentType: "正社員",
    description: "企業向けシステム開発プロジェクトでのSE業務。要件定義から設計、開発、テストまで幅広く携わっていただきます。",
    tags: ["リモートワーク", "年収500万以上", "技術力向上"],
    featured: true
  },
  {
    id: "5",
    title: "カフェスタッフ（学生・フリーター歓迎）",
    company: "カフェ・ド・パリ",
    location: "埼玉県さいたま市",
    salary: "時給1,000円～1,200円",
    workTime: "8:00～22:00（シフト制）",
    employmentType: "パート・アルバイト",
    description: "おしゃれなカフェでホールスタッフとして接客業務をお任せします。笑顔で接客できる方を歓迎します。",
    tags: ["学生歓迎", "シフト自由", "まかない付き"]
  },
  {
    id: "6",
    title: "経理・財務スタッフ",
    company: "グローバル商事株式会社",
    location: "千葉県千葉市",
    salary: "月給25万円～35万円",
    workTime: "9:00～18:00",
    employmentType: "正社員",
    description: "月次・年次決算業務、予算管理、財務分析などの経理業務全般をお任せします。簿記2級以上の資格をお持ちの方歓迎です。",
    tags: ["資格活かせる", "安定企業", "昇進チャンス"]
  },
  {
    id: "7",
    title: "マーケティングプランナー",
    company: "株式会社デジタルマーケティング",
    location: "東京都港区",
    salary: "月給32万円～42万円",
    workTime: "10:00～19:00",
    employmentType: "正社員",
    description: "デジタルマーケティング戦略の企画・実行をお任せします。SNS運用、Web広告運用、データ分析などの経験を活かせます。",
    tags: ["急成長企業", "裁量権大", "成果報酬"],
    featured: true
  },
  {
    id: "8",
    title: "製造ライン作業員",
    company: "東海製造株式会社",
    location: "愛知県名古屋市",
    salary: "時給1,300円～1,500円",
    workTime: "8:00～17:00",
    employmentType: "派遣社員",
    description: "自動車部品の製造ライン作業をお任せします。未経験からでもしっかりとした研修でサポートいたします。",
    tags: ["未経験OK", "高時給", "正社員登用あり"]
  }
];

export const featuredJobs = sampleJobs.filter(job => job.featured);
export const recommendedJobs = sampleJobs.slice(0, 6);