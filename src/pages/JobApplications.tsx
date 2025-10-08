import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';

interface Application {
  id: number;
  job_id: number;
  user_id: number;
  status: string;
  applied_at: string;
  updated_at: string;
  cover_letter?: string;
  resume_url?: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_resume_url?: string;
}

interface JobInfo {
  id: number;
  title: string;
  company: string;
}

const JobApplications: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [jobId, token]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data.applications || []);
        setJobInfo(data.data.job);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '応募情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Refresh applications
        fetchApplications();
        alert('ステータスを更新しました');
      } else {
        alert('ステータス更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('エラーが発生しました');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />審査中</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800"><Eye className="h-3 w-3 mr-1" />確認済み</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />採用</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />不採用</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/employer/jobs')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        求人一覧に戻る
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {jobInfo?.title || '求人'} の応募者
        </h1>
        <p className="text-gray-600">{jobInfo?.company}</p>
        <p className="text-sm text-gray-500 mt-2">全 {applications.length} 件の応募</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">まだ応募がありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {application.applicant_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(application.status)}
                      <span className="text-sm text-gray-500">
                        応募日: {new Date(application.applied_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                        >
                          確認済みにする
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          採用
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          不採用
                        </Button>
                      </>
                    )}
                    {application.status === 'reviewed' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateApplicationStatus(application.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          採用
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          不採用
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{application.applicant_email}</span>
                  </div>
                  {application.applicant_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{application.applicant_phone}</span>
                    </div>
                  )}
                </div>

                {application.cover_letter && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">カバーレター</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
                  </div>
                )}

                {(application.resume_url || application.applicant_resume_url) && (
                  <div>
                    <a
                      href={application.resume_url || application.applicant_resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      履歴書を見る
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;

