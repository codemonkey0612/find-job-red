import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Building2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Search
} from 'lucide-react';

interface Application {
  id: number;
  job_id: number;
  user_id: number;
  status: string;
  applied_at: string;
  updated_at: string;
  cover_letter?: string;
  // Job details from JOIN
  title: string;
  company: string;
  location: string;
  job_type: string;
  work_style: string;
  salary_min?: number;
  salary_max?: number;
}

const Applications: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [user, token, navigate]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/jobs/my-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data?.applications || []);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'すべての応募', count: applications.length },
    { value: 'pending', label: '審査中', count: applications.filter(app => app.status === 'pending').length },
    { value: 'reviewed', label: '確認済み', count: applications.filter(app => app.status === 'reviewed').length },
    { value: 'accepted', label: '採用', count: applications.filter(app => app.status === 'accepted').length },
    { value: 'rejected', label: '不採用', count: applications.filter(app => app.status === 'rejected').length }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <AlertCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '審査中';
      case 'reviewed': return '確認済み';
      case 'accepted': return '採用';
      case 'rejected': return '不採用';
      default: return status;
    }
  };

  const getWorkStyleLabel = (workStyle: string) => {
    switch (workStyle) {
      case 'remote': return 'リモート';
      case 'hybrid': return 'ハイブリッド';
      case 'onsite': return '出社';
      default: return workStyle;
    }
  };

  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case 'full-time': return '正社員';
      case 'part-time': return 'パート・アルバイト';
      case 'contract': return '契約社員';
      case 'internship': return 'インターン';
      default: return jobType;
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return '応相談';
    if (min && max) return `月給${(min / 10000).toFixed(0)}万円～${(max / 10000).toFixed(0)}万円`;
    if (min) return `月給${(min / 10000).toFixed(0)}万円～`;
    return '応相談';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">求人応募</h1>
        <p className="text-gray-600">応募した求人を確認・管理できます</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="求人または企業名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{application.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-gray-500">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {application.company}
                    </CardDescription>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {application.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusIcon(application.status)}
                    <span className="ml-1">{getStatusLabel(application.status)}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">応募日:</span>
                    <span className="ml-2">{new Date(application.applied_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">給与:</span>
                    <span className="ml-2">{formatSalary(application.salary_min, application.salary_max)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {getJobTypeLabel(application.job_type)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getWorkStyleLabel(application.work_style)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">更新日:</span>
                    <span className="ml-2">{new Date(application.updated_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>

              {application.cover_letter && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">カバーレター:</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{application.cover_letter}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/jobs/${application.job_id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    求人を見る
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">応募が見つかりません</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? '検索条件を変更してみてください' 
              : 'まだ求人に応募していません'
            }
          </p>
          <Button onClick={() => navigate('/')}>
            <Briefcase className="h-4 w-4 mr-2" />
            求人を探す
          </Button>
        </div>
      )}

      {/* Application Statistics */}
      {applications.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">応募統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">総応募数</p>
                    <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">審査中</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.filter(app => app.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">採用</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.filter(app => app.status === 'accepted').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">確認率</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.length > 0 
                        ? Math.round((applications.filter(app => app.status !== 'pending').length / applications.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
