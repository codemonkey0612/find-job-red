import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Clock,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
  newUsersThisMonth: number;
  newJobsThisMonth: number;
  applicationsThisMonth: number;
  pendingJobs: number;
  topCompanies: Array<{ company: string; jobCount: number }>;
  recentUsers: Array<{ id: number; name: string; email: string; role: string; created_at: string }>;
  recentJobs: Array<{ id: number; title: string; company: string; created_at: string; is_active: boolean }>;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingJobsCount, setPendingJobsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        // Fetch all data in parallel
        const [pendingJobsRes, jobsRes, usersRes] = await Promise.all([
          fetch('/api/jobs/pending/list', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/jobs', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        let pendingJobsCount = 0;
        let totalJobs = 0;
        let activeJobs = 0;
        let recentJobs: any[] = [];
        let topCompanies: any[] = [];
        let totalUsers = 0;
        let recentUsers: any[] = [];

        // Process pending jobs
        if (pendingJobsRes.ok) {
          const pendingData = await pendingJobsRes.json();
          pendingJobsCount = pendingData.data.count || 0;
        }

        // Process jobs
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          const jobs = jobsData.data.jobs || [];
          totalJobs = jobs.length;
          activeJobs = jobs.filter((job: any) => job.is_active).length;
          
          // Get recent jobs (last 5)
          recentJobs = jobs
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((job: any) => ({
              id: job.id,
              title: job.title,
              company: job.company,
              created_at: job.created_at,
              is_active: job.is_active
            }));

          // Calculate top companies
          const companyCounts: { [key: string]: number } = {};
          jobs.forEach((job: any) => {
            companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
          });
          topCompanies = Object.entries(companyCounts)
            .map(([company, jobCount]) => ({ company, jobCount }))
            .sort((a, b) => b.jobCount - a.jobCount)
            .slice(0, 5);
        }

        // Process users
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const users = usersData.data.users || [];
          totalUsers = users.length;
          
          // Get recent users (last 5)
          recentUsers = users
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((user: any) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              created_at: user.created_at
            }));
        }

        // Calculate monthly stats (mock for now - would need date-based queries)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const stats: DashboardStats = {
          totalUsers,
          totalJobs,
          totalApplications: 0, // TODO: Implement applications API
          activeJobs,
          newUsersThisMonth: 0, // TODO: Calculate from date
          newJobsThisMonth: 0, // TODO: Calculate from date
          applicationsThisMonth: 0, // TODO: Calculate from date
          pendingJobs: pendingJobsCount,
          topCompanies,
          recentUsers,
          recentJobs
        };

        setStats(stats);
        setPendingJobsCount(pendingJobsCount);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set minimal stats on error
        setStats({
          totalUsers: 0,
          totalJobs: 0,
          totalApplications: 0,
          activeJobs: 0,
          newUsersThisMonth: 0,
          newJobsThisMonth: 0,
          applicationsThisMonth: 0,
          pendingJobs: 0,
          topCompanies: [],
          recentUsers: [],
          recentJobs: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

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

      {/* Pending Jobs Alert */}
      {pendingJobsCount > 0 && (
        <Card className="mb-8 border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">
                    {pendingJobsCount}件の承認待ち求人があります
                  </h3>
                  <p className="text-sm text-yellow-700">
                    採用担当者が投稿した求人が承認を待っています
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/admin/jobs/approval')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                承認管理へ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
