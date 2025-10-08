import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Loader2, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_min?: number;
  salary_max?: number;
  job_type: string;
  work_style: string;
  experience_level: string;
  approval_status: string;
  is_active: boolean;
  created_at: string;
  rejection_reason?: string;
  application_count: number;
}

const EmployerJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !['employer', 'admin'].includes(user.role)) {
      navigate('/');
      return;
    }
    fetchMyJobs();
  }, [user, navigate, token]);

  const fetchMyJobs = async () => {
    try {
      const response = await fetch('/api/jobs/my-jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.data.jobs || []);
      } else {
        console.error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (approval_status: string) => {
    switch (approval_status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />承認済み</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="h-3 w-3 mr-1" />承認待ち</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" />却下</Badge>;
      default:
        return <Badge variant="outline">不明</Badge>;
    }
  };

  const jobTypeLabels: { [key: string]: string } = {
    'full-time': '正社員',
    'part-time': 'パート・アルバイト',
    'contract': '契約社員',
    'internship': 'インターン'
  };

  const workStyleLabels: { [key: string]: string } = {
    'remote': 'リモート',
    'hybrid': 'ハイブリッド',
    'onsite': '出社'
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">マイ求人</h1>
          <p className="text-gray-600">投稿した求人の管理</p>
        </div>
        <Button onClick={() => navigate('/add-job')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新しい求人を投稿
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">まだ求人を投稿していません。</p>
            <Button onClick={() => navigate('/add-job')}>
              <Plus className="h-4 w-4 mr-2" />
              最初の求人を投稿
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      {getStatusBadge(job.approval_status)}
                    </div>
                    <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/employer/jobs/${job.id}/applications`)}
                      className="flex items-center gap-1"
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-xs">応募者 ({job.application_count || 0})</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">雇用形態</p>
                    <p className="font-medium">{jobTypeLabels[job.job_type]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">勤務スタイル</p>
                    <p className="font-medium">{workStyleLabels[job.work_style]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">給与</p>
                    <p className="font-medium">
                      {job.salary_min && job.salary_max
                        ? `¥${job.salary_min.toLocaleString()} - ¥${job.salary_max.toLocaleString()}`
                        : '応相談'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">応募数</p>
                    <p className="font-medium flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      {job.application_count || 0} 件
                    </p>
                  </div>
                </div>

                {job.approval_status === 'rejected' && job.rejection_reason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">却下理由:</p>
                    <p className="text-sm text-red-700">{job.rejection_reason}</p>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  投稿日: {new Date(job.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerJobs;

