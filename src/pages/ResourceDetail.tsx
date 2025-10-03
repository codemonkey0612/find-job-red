import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  ExternalLink, 
  Clock,
  User,
  Star,
  Play,
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
  ThumbsUp
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
  content: string;
  prerequisites: string[];
  learningOutcomes: string[];
  chapters?: string[];
  videoUrl?: string;
  downloadUrl?: string;
  publishedDate: string;
  lastUpdated: string;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
}

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // サンプルデータ - 実際のAPI呼び出しに置き換え
    const sampleResource: Resource = {
      id: 1,
      title: 'Complete Guide to Software Engineering Interviews',
      description: 'A comprehensive guide covering technical interviews, behavioral questions, and coding challenges.',
      type: 'ebook',
      category: '面接準備',
      duration: '2 hours',
      difficulty: 'intermediate',
      rating: 4.8,
      author: 'Tech Interview Expert',
      url: '#',
      isFree: true,
      tags: ['interview', 'coding', 'algorithms'],
      content: `
# ソフトウェアエンジニア面接完全ガイド

## はじめに
このガイドでは、ソフトウェアエンジニアの面接でよく出題される問題とその対策について詳しく説明します。

## 技術面接の準備
### 1. アルゴリズムとデータ構造
- 配列と文字列の操作
- リンクリストとツリー
- ソートと検索アルゴリズム
- 動的プログラミング

### 2. システム設計
- スケーラブルなシステムの設計
- データベース設計
- キャッシュ戦略
- マイクロサービス

## 行動面接の準備
### STAR メソッド
- Situation: 状況
- Task: 課題
- Action: 行動
- Result: 結果

## コーディング面接のコツ
1. 問題を理解する
2. アプローチを説明する
3. コードを書く
4. テストケースを考える
5. 時間・空間計算量を分析する

## まとめ
面接は技術的な知識だけでなく、問題解決能力やコミュニケーション能力も評価されます。
      `,
      prerequisites: [
        '基本的なプログラミング知識',
        'データ構造の理解',
        'アルゴリズムの基礎知識'
      ],
      learningOutcomes: [
        '面接でよく出題される問題の理解',
        '効果的な問題解決アプローチの習得',
        'コーディング面接での自信の向上',
        '行動面接での効果的な回答方法'
      ],
      chapters: [
        '面接の基本',
        '技術面接の準備',
        'コーディング問題',
        'システム設計',
        '行動面接',
        '面接後のフォローアップ'
      ],
      publishedDate: '2024-01-01',
      lastUpdated: '2024-01-15',
      viewCount: 1250,
      likeCount: 89,
      bookmarkCount: 156
    };

    setResource(sampleResource);
    setLoading(false);
  }, [id]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('リンクをクリップボードにコピーしました');
  };

  const handleDownload = () => {
    // ダウンロード機能の実装
    alert('ダウンロードを開始します');
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">リソースが見つかりません</h3>
          <Button onClick={() => navigate('/resources')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            リソース一覧に戻る
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
          onClick={() => navigate('/resources')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          リソース一覧に戻る
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              {getTypeIcon(resource.type)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{resource.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{resource.author}</span>
                </div>
                {resource.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{resource.duration}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{resource.rating}/5.0</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(resource.difficulty)}>
                  {resource.difficulty === 'beginner' ? '初級' : 
                   resource.difficulty === 'intermediate' ? '中級' : '上級'}
                </Badge>
                {resource.isFree ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    無料
                  </Badge>
                ) : (
                  <Badge variant="outline">有料</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleBookmark}>
              <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
              {isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}
            </Button>
            <Button variant="outline" onClick={handleLike}>
              <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-blue-500 text-blue-500' : ''}`} />
              {isLiked ? 'いいね済み' : 'いいね'}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              シェア
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              ダウンロード
            </Button>
          </div>
        </div>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="content">コンテンツ</TabsTrigger>
          <TabsTrigger value="details">詳細</TabsTrigger>
          <TabsTrigger value="reviews">レビュー</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>リソースについて</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">基本情報</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">カテゴリ:</span> {resource.category}</div>
                    <div><span className="font-medium">タイプ:</span> 
                      {resource.type === 'article' ? '記事' :
                       resource.type === 'video' ? '動画' :
                       resource.type === 'ebook' ? '電子書籍' : 'コース'}
                    </div>
                    <div><span className="font-medium">難易度:</span> 
                      {resource.difficulty === 'beginner' ? '初級' : 
                       resource.difficulty === 'intermediate' ? '中級' : '上級'}
                    </div>
                    <div><span className="font-medium">投稿日:</span> {new Date(resource.publishedDate).toLocaleDateString('ja-JP')}</div>
                    <div><span className="font-medium">最終更新:</span> {new Date(resource.lastUpdated).toLocaleDateString('ja-JP')}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">統計</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">閲覧数:</span> {resource.viewCount.toLocaleString()}</div>
                    <div><span className="font-medium">いいね数:</span> {resource.likeCount}</div>
                    <div><span className="font-medium">ブックマーク数:</span> {resource.bookmarkCount}</div>
                    <div><span className="font-medium">評価:</span> {resource.rating}/5.0</div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">タグ</h4>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>コンテンツ</CardTitle>
            </CardHeader>
            <CardContent>
              {resource.type === 'video' && resource.videoUrl ? (
                <div className="mb-6">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Button size="lg">
                      <Play className="h-6 w-6 mr-2" />
                      動画を再生
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {resource.content}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>詳細情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">前提条件</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {resource.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">学習成果</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {resource.learningOutcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </div>

                {resource.chapters && (
                  <div>
                    <h4 className="font-semibold mb-2">目次</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {resource.chapters.map((chapter, index) => (
                        <li key={index}>{chapter}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>レビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">レビューはまだありません</h3>
                <p className="text-gray-500">このリソースの最初のレビューを書いてみませんか？</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceDetail;
