import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Clock,
  DollarSign,
  Users,
  Calendar,
  ArrowLeft,
  Share2,
  Heart,
  ExternalLink,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  workStyle: string;
  salary: string;
  experience: string;
  postedDate: string;
  deadline?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  companyInfo: {
    name: string;
    size: string;
    industry: string;
    website: string;
    rating: number;
    description: string;
  };
  applicationCount: number;
  viewCount: number;
  isUrgent: boolean;
  isRemote: boolean;
  isNew: boolean;
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    // サンプルデータ - 実際のAPI呼び出しに置き換え
    const sampleJob: Job = {
      id: 1,
      title: 'シニアソフトウェアエンジニア',
      company: 'テックソリューション株式会社',
      location: '東京都渋谷区',
      type: 'フルタイム',
      workStyle: 'ハイブリッド',
      salary: '月給40万円〜50万円',
      experience: '5年以上',
      postedDate: '2024-01-15',
      deadline: '2024-02-15',
      description: `
私たちは革新的なソフトウェアソリューションを提供するテクノロジー企業です。
シニアソフトウェアエンジニアとして、私たちのエンジニアリングチームに参加し、
スケーラブルで高性能なアプリケーションの開発に携わっていただきます。

このポジションでは、最新のテクノロジーを使用して複雑な問題を解決し、
チームメンバーと協力して高品質なソフトウェアを提供することが求められます。
      `,
      requirements: [
        '5年以上のソフトウェア開発経験',
        'JavaScript、React、Node.jsの深い理解',
        'クラウド技術（AWS、Azure、GCP）の経験',
        'マイクロサービスアーキテクチャの経験',
        'チームリーダーシップの経験',
        '優れた問題解決能力',
        'コミュニケーション能力'
      ],
      responsibilities: [
        '高品質なソフトウェアの設計・開発・実装',
        'チームメンバーのメンタリングと指導',
        '技術的な意思決定への参加',
        'コードレビューと品質保証',
        '新しい技術の調査と導入',
        'パフォーマンスの最適化',
        'ドキュメントの作成と保守'
      ],
      benefits: [
        '競争力のある給与',
        '健康保険・歯科保険・視力保険',
        '401kプラン（会社マッチング付き）',
        'フレキシブルな勤務時間',
        'リモートワーク可能',
        '教育支援プログラム',
        '有給休暇・病欠休暇',
        'ジムメンバーシップ',
        '交通費補助'
      ],
      skills: [
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'Python',
        'AWS',
        'Docker',
        'Kubernetes',
        'PostgreSQL',
        'MongoDB'
      ],
      companyInfo: {
        name: 'テックソリューション株式会社',
        size: '500-1000人',
        industry: 'テクノロジー',
        website: 'https://techcorp.com',
        rating: 4.5,
        description: '革新的なソフトウェアソリューションを提供するテクノロジー企業です。'
      },
      applicationCount: 45,
      viewCount: 320,
      isUrgent: false,
      isRemote: true,
      isNew: true
    };

    setJob(sampleJob);
    setLoading(false);
  }, [id]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleApply = () => {
    if (hasApplied) {
      alert('既に応募済みです');
      return;
    }
    setHasApplied(true);
    alert('応募が完了しました！');
  };

  const handleShare = () => {
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

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">求人が見つかりません</h3>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            求人一覧に戻る
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
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          求人一覧に戻る
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                {job.isNew && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    新着
                  </Badge>
                )}
                {job.isUrgent && (
                  <Badge variant="destructive">急募</Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 text-gray-600 mb-2">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{job.type}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{job.experience}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>投稿日: {new Date(job.postedDate).toLocaleDateString('ja-JP')}</span>
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
            <Button 
              onClick={handleApply}
              className={hasApplied ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {hasApplied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  応募済み
                </>
              ) : (
                '応募する'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="requirements">要件</TabsTrigger>
          <TabsTrigger value="benefits">福利厚生</TabsTrigger>
          <TabsTrigger value="company">企業情報</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>求人概要</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 mb-6">
                {job.description}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">基本情報</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">勤務形態:</span> {job.type}</div>
                    <div><span className="font-medium">勤務スタイル:</span> {job.workStyle}</div>
                    <div><span className="font-medium">給与:</span> {job.salary}</div>
                    <div><span className="font-medium">経験:</span> {job.experience}</div>
                    {job.deadline && (
                      <div><span className="font-medium">応募締切:</span> {new Date(job.deadline).toLocaleDateString('ja-JP')}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">統計</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">応募者数:</span> {job.applicationCount}人</div>
                    <div><span className="font-medium">閲覧数:</span> {job.viewCount}回</div>
                    <div><span className="font-medium">リモート:</span> {job.isRemote ? '可能' : '不可'}</div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">必要なスキル</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>応募要件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">必須要件</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">職務内容</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>福利厚生</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>企業情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{job.companyInfo.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{job.companyInfo.size}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                        <span>{job.companyInfo.rating}/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">業界:</span> {job.companyInfo.industry}</div>
                  <div><span className="font-medium">企業規模:</span> {job.companyInfo.size}</div>
                  <div><span className="font-medium">評価:</span> {job.companyInfo.rating}/5.0</div>
                </div>
                
                <p className="text-gray-600 text-sm">{job.companyInfo.description}</p>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={job.companyInfo.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      企業サイト
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    他の求人を見る
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobDetail;
