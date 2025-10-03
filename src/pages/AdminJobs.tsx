import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MoreHorizontal,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Calendar,
  Eye,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  work_style: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  is_active: boolean;
  application_count: number;
  view_count: number;
}

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    const mockJobs: Job[] = [
      {
        id: 1,
        title: 'フロントエンドエンジニア',
        company: 'テック株式会社',
        location: '東京都渋谷区',
        job_type: 'full-time',
        work_style: 'remote',
        experience_level: 'mid',
        salary_min: 400000,
        salary_max: 600000,
        created_by: 2,
        created_by_name: '佐藤花子',
        created_at: '2024-01-15',
        is_active: true,
        application_count: 12,
        view_count: 45
      },
      {
        id: 2,
        title: 'UI/UXデザイナー',
        company: 'デザイン会社',
        location: '大阪府大阪市',
        job_type: 'full-time',
        work_style: 'hybrid',
        experience_level: 'entry',
        salary_min: 300000,
        salary_max: 450000,
        created_by: 2,
        created_by_name: '佐藤花子',
        created_at: '2024-01-14',
        is_active: true,
        application_count: 8,
        view_count: 32
      },
      {
        id: 3,
        title: 'バックエンドエンジニア',
        company: 'システム会社',
        location: '神奈川県横浜市',
        job_type: 'contract',
        work_style: 'onsite',
        experience_level: 'senior',
        salary_min: 500000,
        salary_max: 800000,
        created_by: 2,
        created_by_name: '佐藤花子',
        created_at: '2024-01-13',
        is_active: false,
        application_count: 5,
        view_count: 18
      }
    ];

    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && job.is_active) ||
                         (statusFilter === 'inactive' && !job.is_active);
    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleJobAction = (action: string, jobId: number) => {
    console.log(`${action} job ${jobId}`);
    // Implement job actions here
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return '正社員';
      case 'part-time': return 'パート';
      case 'contract': return '契約';
      case 'internship': return 'インターン';
      default: return type;
    }
  };

  const getWorkStyleLabel = (style: string) => {
    switch (style) {
      case 'remote': return 'リモート';
      case 'hybrid': return 'ハイブリッド';
      case 'onsite': return '出社';
      default: return style;
    }
  };

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case 'entry': return '初級';
      case 'mid': return '中級';
      case 'senior': return '上級';
      case 'executive': return '管理職';
      default: return level;
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return '要相談';
    if (!max) return `月給${min?.toLocaleString()}円以上`;
    if (!min) return `月給${max?.toLocaleString()}円以下`;
    return `月給${min?.toLocaleString()}円〜${max?.toLocaleString()}円`;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">求人管理</h1>
        <p className="text-gray-600">システム内の全求人を管理</p>
      </div>

      {/* 検索・フィルター */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="求人タイトル、企業名、場所で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="雇用形態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="full-time">正社員</SelectItem>
                  <SelectItem value="part-time">パート</SelectItem>
                  <SelectItem value="contract">契約</SelectItem>
                  <SelectItem value="internship">インターン</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 求人一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            求人一覧 ({filteredJobs.length}件)
          </CardTitle>
          <CardDescription>
            システムに投稿されている全求人
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{job.title}</h3>
                      <Badge variant={job.is_active ? 'default' : 'secondary'}>
                        {job.is_active ? 'アクティブ' : '非アクティブ'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {job.company}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getJobTypeLabel(job.job_type)} • {getWorkStyleLabel(job.work_style)} • {getExperienceLabel(job.experience_level)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        投稿: {new Date(job.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        投稿者: {job.created_by_name}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-3 w-3" />
                      <span>{job.view_count}回</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3" />
                      <span>{job.application_count}件</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleJobAction('view', job.id)}>
                        詳細を見る
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleJobAction('edit', job.id)}>
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleJobAction('toggle', job.id)}>
                        {job.is_active ? '非アクティブにする' : 'アクティブにする'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleJobAction('delete', job.id)}
                        className="text-red-600"
                      >
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">条件に一致する求人が見つかりませんでした</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobs;
