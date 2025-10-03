import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
  salary?: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  workStyle: 'remote' | 'hybrid' | 'onsite';
  nextStep?: string;
  nextStepDate?: string;
  notes?: string;
}

const Applications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const applications: Application[] = [
    {
      id: 1,
      jobTitle: 'シニアソフトウェアエンジニア',
      company: 'テックソリューション株式会社',
      location: '東京都渋谷区',
      appliedDate: '2024-01-15',
      status: 'interview',
      salary: '月給40万円〜50万円',
      jobType: 'full-time',
      workStyle: 'hybrid',
      nextStep: '技術面接',
      nextStepDate: '2024-01-25',
      notes: '初回選考通過、技術面接の準備中'
    },
    {
      id: 2,
      jobTitle: 'フルスタック開発者',
      company: 'スタートアップXYZ',
      location: '大阪府大阪市',
      appliedDate: '2024-01-10',
      status: 'reviewing',
      salary: '月給30万円〜37万円',
      jobType: 'full-time',
      workStyle: 'remote',
      nextStep: '人事審査',
      notes: '人事チームによる応募書類審査中'
    },
    {
      id: 3,
      jobTitle: 'フロントエンド開発者',
      company: 'デザイン株式会社',
      location: '神奈川県横浜市',
      appliedDate: '2024-01-05',
      status: 'offered',
      salary: '月給32万円〜38万円',
      jobType: 'full-time',
      workStyle: 'onsite',
      nextStep: '決定期限',
      nextStepDate: '2024-01-30'
    },
    {
      id: 4,
      jobTitle: 'React開発者',
      company: 'ウェブエージェンシー',
      location: '福岡県福岡市',
      appliedDate: '2023-12-20',
      status: 'rejected',
      salary: '月給27万円〜33万円',
      jobType: 'full-time',
      workStyle: 'hybrid'
    },
    {
      id: 5,
      jobTitle: 'ソフトウェアエンジニアインターン',
      company: 'ビッグテック株式会社',
      location: '東京都港区',
      appliedDate: '2024-01-12',
      status: 'applied',
      salary: '月給20万円',
      jobType: 'internship',
      workStyle: 'onsite',
      nextStep: '応募書類審査',
      notes: 'サマーインターンシッププログラム'
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'すべての応募', count: applications.length },
    { value: 'applied', label: '応募済み', count: applications.filter(app => app.status === 'applied').length },
    { value: 'reviewing', label: '審査中', count: applications.filter(app => app.status === 'reviewing').length },
    { value: 'interview', label: '面接', count: applications.filter(app => app.status === 'interview').length },
    { value: 'offered', label: 'オファー', count: applications.filter(app => app.status === 'offered').length },
    { value: 'rejected', label: '不採用', count: applications.filter(app => app.status === 'rejected').length }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="h-4 w-4" />;
      case 'reviewing': return <AlertCircle className="h-4 w-4" />;
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'offered': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkStyleColor = (workStyle: string) => {
    switch (workStyle) {
      case 'remote': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-yellow-100 text-yellow-800';
      case 'onsite': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">求人応募</h1>
        <p className="text-gray-600">求人応募を追跡・管理しましょう</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="応募を検索..."
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
                    <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
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
                    <span className="ml-1 capitalize">{application.status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">Applied:</span>
                    <span className="ml-2">{new Date(application.appliedDate).toLocaleDateString()}</span>
                  </div>
                  {application.salary && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">Salary:</span>
                      <span className="ml-2">{application.salary}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {application.jobType}
                    </Badge>
                    <Badge className={getWorkStyleColor(application.workStyle)}>
                      {application.workStyle}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {application.nextStep && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">Next Step:</span>
                      <span className="ml-2">{application.nextStep}</span>
                    </div>
                  )}
                  {application.nextStepDate && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">Date:</span>
                      <span className="ml-2">{new Date(application.nextStepDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {application.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {application.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Job
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Company
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {application.status === 'applied' && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria' 
              : 'You haven\'t applied to any jobs yet'
            }
          </p>
          <Button>
            <Briefcase className="h-4 w-4 mr-2" />
            Browse Jobs
          </Button>
        </div>
      )}

      {/* Application Statistics */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Applications</p>
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
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => ['applied', 'reviewing', 'interview'].includes(app.status)).length}
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
                  <p className="text-sm font-medium text-gray-500">Offers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === 'offered').length}
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
                  <p className="text-sm font-medium text-gray-500">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((applications.filter(app => app.status !== 'applied').length / applications.length) * 100)}%
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Applications;
