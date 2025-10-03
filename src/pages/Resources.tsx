import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  ExternalLink, 
  Search,
  Clock,
  Users,
  Star,
  Play
} from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'article' | 'video' | 'ebook' | 'course';
  category: string;
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  author: string;
  url: string;
  isFree: boolean;
  tags: string[];
}

const Resources: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const categories = ['all', 'キャリア開発', '技術スキル', '面接準備', '履歴書作成', 'ネットワーキング'];
  const types = ['all', 'article', 'video', 'ebook', 'course'];

  const resources: Resource[] = [
    {
      id: 1,
      title: 'ソフトウェアエンジニア面接完全ガイド',
      description: '技術面接、行動面接、コーディングチャレンジをカバーする包括的なガイドです。',
      type: 'ebook',
      category: '面接準備',
      duration: '2時間',
      difficulty: 'intermediate',
      rating: 4.8,
      author: 'テック面接エキスパート',
      url: '#',
      isFree: true,
      tags: ['面接', 'コーディング', 'アルゴリズム']
    },
    {
      id: 2,
      title: 'プロフェッショナルネットワークの構築',
      description: '効果的なネットワーキングと意味のあるプロフェッショナル関係の構築方法を学びます。',
      type: 'video',
      category: 'ネットワーキング',
      duration: '45分',
      difficulty: 'beginner',
      rating: 4.5,
      author: 'キャリアコーチ佐藤',
      url: '#',
      isFree: true,
      tags: ['ネットワーキング', 'キャリア', 'プロフェッショナル']
    },
    {
      id: 3,
      title: '上級Reactパターン',
      description: 'シニア開発者向けの上級Reactパターンとベストプラクティスを深く掘り下げます。',
      type: 'course',
      category: '技術スキル',
      duration: '8時間',
      difficulty: 'advanced',
      rating: 4.9,
      author: 'Reactエキスパート',
      url: '#',
      isFree: false,
      tags: ['react', 'javascript', 'フロントエンド']
    },
    {
      id: 4,
      title: '履歴書作成のベストプラクティス',
      description: '採用担当者に注目される目立つ履歴書を作成するためのヒントとコツ。',
      type: 'article',
      category: '履歴書作成',
      duration: '15分',
      difficulty: 'beginner',
      rating: 4.3,
      author: 'HRプロフェッショナル',
      url: '#',
      isFree: true,
      tags: ['履歴書', 'キャリア', '求職']
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-5 w-5" />;
      case 'video': return <Play className="h-5 w-5" />;
      case 'ebook': return <BookOpen className="h-5 w-5" />;
      case 'course': return <Video className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">リソース</h1>
        <p className="text-gray-600">キャリアを前進させるための有用なリソースを発見しましょう</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="リソースを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'すべてのカテゴリ' : category}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'すべてのタイプ' : 
                 type === 'article' ? '記事' :
                 type === 'video' ? '動画' :
                 type === 'ebook' ? '電子書籍' :
                 type === 'course' ? 'コース' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-gray-500">
                      <span>by {resource.author}</span>
                    </CardDescription>
                  </div>
                </div>
                {resource.isFree ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Free
                  </Badge>
                ) : (
                  <Badge variant="outline">Premium</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {resource.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span>{resource.category}</span>
                </div>
                {resource.duration && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{resource.duration}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Difficulty:</span>
                  <Badge className={getDifficultyColor(resource.difficulty)}>
                    {resource.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{resource.rating}/5.0</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {resource.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" className="flex-1" onClick={() => navigate(`/resources/${resource.id}`)}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  続きを読む
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Featured Resources Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Resources</h2>
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
          <TabsContent value="trending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI in Software Development</CardTitle>
                  <CardDescription>Latest trends and tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Explore how artificial intelligence is transforming software development practices.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Remote Work Best Practices</CardTitle>
                  <CardDescription>Productivity and collaboration tips</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Master the art of remote work with proven strategies and tools.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="new" className="mt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">New resources coming soon!</p>
            </div>
          </TabsContent>
          <TabsContent value="popular" className="mt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Popular resources coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
