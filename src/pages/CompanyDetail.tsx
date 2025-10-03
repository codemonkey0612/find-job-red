import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  MapPin, 
  Users, 
  Star, 
  ExternalLink, 
  Globe,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react';

interface Company {
  id: number;
  name: string;
  description: string;
  location: string;
  industry: string;
  size: string;
  website: string;
  logo?: string;
  rating: number;
  jobCount: number;
  isHiring: boolean;
  foundedYear: number;
  headquarters: string;
  employeeCount: string;
  revenue: string;
  about: string;
  benefits: string[];
  culture: string;
  mission: string;
  values: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // サンプルデータ - 実際のAPI呼び出しに置き換え
    const sampleCompany: Company = {
      id: 1,
      name: 'TechCorp Solutions',
      description: 'Leading provider of innovative software solutions for enterprise clients.',
      location: 'San Francisco, CA',
      industry: 'テクノロジー',
      size: '500-1000 employees',
      website: 'https://techcorp.com',
      rating: 4.5,
      jobCount: 12,
      isHiring: true,
      foundedYear: 2010,
      headquarters: 'San Francisco, CA',
      employeeCount: '750',
      revenue: '$50M - $100M',
      about: 'TechCorp Solutions is a leading technology company specializing in enterprise software solutions. We help businesses transform their operations through innovative technology and cutting-edge software development.',
      benefits: [
        '健康保険',
        '401k プラン',
        'フレキシブルな勤務時間',
        'リモートワーク',
        '教育支援',
        '有給休暇'
      ],
      culture: '私たちは協力的で革新的な文化を大切にしています。チームワーク、創造性、継続的な学習を重視し、従業員が成長できる環境を提供しています。',
      mission: '企業のデジタル変革を支援し、テクノロジーを通じてビジネスの成功を促進する。',
      values: [
        'イノベーション',
        '誠実性',
        '協力',
        '卓越性',
        '多様性'
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/company/techcorp',
        twitter: 'https://twitter.com/techcorp',
        facebook: 'https://facebook.com/techcorp'
      }
    };

    const sampleJobs: Job[] = [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        type: 'フルタイム',
        salary: '$120,000 - $150,000',
        postedDate: '2024-01-15',
        description: 'We are looking for a Senior Software Engineer to join our team...',
        requirements: [
          '5年以上のソフトウェア開発経験',
          'JavaScript、React、Node.jsの経験',
          'クラウド技術の知識',
          'チームリーダーシップの経験'
        ],
        benefits: [
          '競争力のある給与',
          '健康保険',
          'リモートワーク可能',
          '教育支援'
        ]
      },
      {
        id: 2,
        title: 'Frontend Developer',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        type: 'フルタイム',
        salary: '$90,000 - $110,000',
        postedDate: '2024-01-10',
        description: 'Join our frontend team to build amazing user experiences...',
        requirements: [
          '3年以上のフロントエンド開発経験',
          'React、Vue.js、Angularの経験',
          'CSS、HTML、JavaScriptの深い理解',
          'レスポンシブデザインの経験'
        ],
        benefits: [
          'フレキシブルな勤務時間',
          '健康保険',
          '401kプラン',
          '有給休暇'
        ]
      }
    ];

    setCompany(sampleCompany);
    setJobs(sampleJobs);
    setLoading(false);
  }, [id]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    // シェア機能の実装
    navigator.clipboard.writeText(window.location.href);
    alert('リンクをクリップボードにコピーしました');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">企業が見つかりません</h3>
          <Button onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            企業一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/companies')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          企業一覧に戻る
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{company.size}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{company.rating}/5.0</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleFavorite}>
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'お気に入り済み' : 'お気に入り'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              シェア
            </Button>
            <Button asChild>
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                ウェブサイト
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="jobs">求人 ({jobs.length})</TabsTrigger>
          <TabsTrigger value="culture">企業文化</TabsTrigger>
          <TabsTrigger value="contact">連絡先</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>企業について</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{company.about}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">基本情報</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">設立年:</span> {company.foundedYear}年</div>
                    <div><span className="font-medium">本社:</span> {company.headquarters}</div>
                    <div><span className="font-medium">従業員数:</span> {company.employeeCount}人</div>
                    <div><span className="font-medium">売上高:</span> {company.revenue}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">福利厚生</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary">{benefit}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">求人情報</h3>
            <Badge variant="default" className="bg-green-100 text-green-800">
              募集中
            </Badge>
          </div>
          
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{job.salary}</div>
                    <div className="text-sm text-gray-500">{job.type}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    投稿日: {new Date(job.postedDate).toLocaleDateString('ja-JP')}
                  </div>
                  <Button size="sm">
                    <Briefcase className="h-4 w-4 mr-1" />
                    詳細を見る
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="culture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>企業文化</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">ミッション</h4>
                  <p className="text-gray-600">{company.mission}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">企業文化</h4>
                  <p className="text-gray-600">{company.culture}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">価値観</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.values.map((value, index) => (
                      <Badge key={index} variant="outline">{value}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>連絡先情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {company.website}
                  </a>
                </div>
                {company.socialMedia.linkedin && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <a href={company.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
                {company.socialMedia.twitter && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <a href={company.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Twitter
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDetail;
