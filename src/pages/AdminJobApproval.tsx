import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Building, MapPin, DollarSign, Loader2 } from 'lucide-react';

interface PendingJob {
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
  employer_name: string;
  employer_email: string;
  created_at: string;
  approval_status: string;
}

const AdminJobApproval: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingJobId, setProcessingJobId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchPendingJobs();
  }, [user, navigate]);

  const fetchPendingJobs = async () => {
    try {
      const response = await fetch('/api/jobs/pending/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingJobs(data.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: number) => {
    setProcessingJobId(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('求人が承認されました！');
        fetchPendingJobs();
      } else {
        const error = await response.json();
        alert(error.message || '承認に失敗しました');
      }
    } catch (error) {
      console.error('Error approving job:', error);
      alert('エラーが発生しました');
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleReject = async (jobId: number) => {
    const reason = rejectionReason[jobId];
    if (!reason || reason.length < 10) {
      alert('却下理由を10文字以上入力してください');
      return;
    }

    setProcessingJobId(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejection_reason: reason })
      });

      if (response.ok) {
        alert('求人が却下されました');
        setShowRejectForm({ ...showRejectForm, [jobId]: false });
        setRejectionReason({ ...rejectionReason, [jobId]: '' });
        fetchPendingJobs();
      } else {
        const error = await response.json();
        alert(error.message || '却下に失敗しました');
      }
    } catch (error) {
      console.error('Error rejecting job:', error);
      alert('エラーが発生しました');
    } finally {
      setProcessingJobId(null);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return '応相談';
    if (min && max) return `¥${min.toLocaleString()} - ¥${max.toLocaleString()}`;
    if (min) return `¥${min.toLocaleString()}〜`;
    return `〜¥${max?.toLocaleString()}`;
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

  const experienceLevelLabels: { [key: string]: string } = {
    'entry': 'エントリーレベル',
    'mid': 'ミドルレベル',
    'senior': 'シニアレベル',
    'executive': 'エグゼクティブ'
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">求人承認管理</h1>
        <p className="text-gray-600">承認待ちの求人: {pendingJobs.length}件</p>
      </div>

      {pendingJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">現在、承認待ちの求人はありません。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingJobs.map((job) => (
            <Card key={job.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                    承認待ち
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">雇用形態</p>
                    <p className="text-sm">{jobTypeLabels[job.job_type]}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">勤務スタイル</p>
                    <p className="text-sm">{workStyleLabels[job.work_style]}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">経験レベル</p>
                    <p className="text-sm">{experienceLevelLabels[job.experience_level]}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">給与</p>
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">求人詳細</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">応募要件</p>
                  <p className="text-sm text-gray-700">{job.requirements}</p>
                </div>

                {/* Employer Info */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">投稿者情報</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>名前: {job.employer_name}</span>
                    <span>メール: {job.employer_email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    投稿日時: {new Date(job.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>

                {/* Action Buttons */}
                {!showRejectForm[job.id] && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => handleApprove(job.id)}
                      disabled={processingJobId === job.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processingJobId === job.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      承認する
                    </Button>
                    <Button
                      onClick={() => setShowRejectForm({ ...showRejectForm, [job.id]: true })}
                      disabled={processingJobId === job.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      却下する
                    </Button>
                  </div>
                )}

                {/* Rejection Form */}
                {showRejectForm[job.id] && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor={`reason-${job.id}`}>却下理由 *</Label>
                      <Textarea
                        id={`reason-${job.id}`}
                        value={rejectionReason[job.id] || ''}
                        onChange={(e) => setRejectionReason({ ...rejectionReason, [job.id]: e.target.value })}
                        placeholder="却下理由を詳しく記載してください（最低10文字）"
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleReject(job.id)}
                        disabled={processingJobId === job.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processingJobId === job.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        却下を確定
                      </Button>
                      <Button
                        onClick={() => setShowRejectForm({ ...showRejectForm, [job.id]: false })}
                        disabled={processingJobId === job.id}
                        variant="outline"
                        className="flex-1"
                      >
                        キャンセル
                      </Button>
                    </div>
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

export default AdminJobApproval;

