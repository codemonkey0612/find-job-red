import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  UserCheck, 
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
  newUsersThisMonth: number;
  newJobsThisMonth: number;
  applicationsThisMonth: number;
  topCompanies: Array<{ company: string; jobCount: number }>;
  recentUsers: Array<{ id: number; name: string; email: string; role: string; created_at: string }>;
  recentJobs: Array<{ id: number; title: string; company: string; created_at: string; is_active: boolean }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    const mockStats: DashboardStats = {
      totalUsers: 1250,
      totalJobs: 340,
      totalApplications: 2150,
      activeJobs: 298,
      newUsersThisMonth: 45,
      newJobsThisMonth: 23,
      applicationsThisMonth: 180,
      topCompanies: [
        { company: '株式会社テックソリューション', jobCount: 12 },
        { company: 'クリエイティブデザイン株式会社', jobCount: 8 },
        { company: 'グローバルコンサルティング', jobCount: 6 },
        { company: 'スタートアップベンチャー', jobCount: 5 }
      ],
      recentUsers: [
        { id: 1, name: '田中太郎', email: 'tanaka@example.com', role: 'user', created_at: '2024-01-15' },
        { id: 2, name: '佐藤花子', email: 'sato@example.com', role: 'employer', created_at: '2024-01-14' },
        { id: 3, name: '山田次郎', email: 'yamada@example.com', role: 'user', created_at: '2024-01-13' }
      ],
      recentJobs: [
        { id: 1, title: 'フロントエンドエンジニア', company: 'テック株式会社', created_at: '2024-01-15', is_active: true },
        { id: 2, title: 'UI/UXデザイナー', company: 'デザイン会社', created_at: '2024-01-14', is_active: true },
        { id: 3, title: 'バックエンドエンジニア', company: 'システム会社', created_at: '2024-01-13', is_active: false }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">データの読み込みに失敗しました</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
        <p className="text-gray-600">システムの概要と統計情報</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} 今月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総求人数</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newJobsThisMonth} 今月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総応募数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.applicationsThisMonth} 今月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ求人</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeJobs / stats.totalJobs) * 100).toFixed(1)}% アクティブ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="users">ユーザー</TabsTrigger>
          <TabsTrigger value="jobs">求人</TabsTrigger>
          <TabsTrigger value="companies">企業</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>最近のユーザー</CardTitle>
                <CardDescription>新規登録されたユーザー</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'employer' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? '管理者' : user.role === 'employer' ? '企業' : '求職者'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(user.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>最近の求人</CardTitle>
                <CardDescription>新しく投稿された求人</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={job.is_active ? 'default' : 'secondary'}>
                          {job.is_active ? 'アクティブ' : '非アクティブ'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(job.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ユーザー管理</CardTitle>
              <CardDescription>システム内の全ユーザーを管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ユーザー管理機能は開発中です</p>
                <Button className="mt-4">ユーザー一覧を見る</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>求人管理</CardTitle>
              <CardDescription>システム内の全求人を管理</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">求人管理機能は開発中です</p>
                <Button className="mt-4">求人一覧を見る</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>企業統計</CardTitle>
              <CardDescription>求人を多く投稿している企業</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{company.company}</p>
                        <p className="text-sm text-gray-500">{company.jobCount}件の求人</p>
                      </div>
                    </div>
                    <Badge variant="outline">{company.jobCount}件</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
