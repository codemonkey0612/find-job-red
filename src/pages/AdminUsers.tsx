import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield,
  Building2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'employer';
  email_verified: boolean;
  created_at: string;
  last_login?: string;
  job_count?: number;
  application_count?: number;
}

const AdminUsers: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.data.users || []);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && user.email_verified) ||
                         (statusFilter === 'unverified' && !user.email_verified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = async (action: string, userId: number) => {
    try {
      if (action === 'view') {
        // TODO: Implement user detail page
        alert('ユーザー詳細ページは準備中です');
        return;
      }

      if (action === 'edit') {
        // TODO: Implement user edit page
        alert('編集機能は準備中です');
        return;
      }

      if (action === 'verify') {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // TODO: Implement email verification toggle API
        const response = await fetch(`/api/admin/users/${userId}/verify`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            email_verified: !user.email_verified
          })
        });

        if (response.ok) {
          alert(user.email_verified ? 'メール認証を取り消しました' : 'メール認証を完了しました');
          const updatedUsers = users.map(u =>
            u.id === userId ? { ...u, email_verified: !u.email_verified } : u
          );
          setUsers(updatedUsers);
        } else {
          alert('操作に失敗しました');
        }
        return;
      }

      if (action === 'delete') {
        if (!confirm('このユーザーを削除してもよろしいですか？関連するデータもすべて削除されます。')) return;

        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('ユーザーを削除しました');
          setUsers(users.filter(u => u.id !== userId));
        } else {
          alert('削除に失敗しました');
        }
      }
    } catch (error) {
      console.error('User action error:', error);
      alert('エラーが発生しました');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'employer': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '管理者';
      case 'employer': return '企業';
      case 'user': return '求職者';
      default: return role;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ユーザー管理</h1>
        <p className="text-gray-600">システム内の全ユーザーを管理</p>
      </div>

      {/* 検索・フィルター */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ユーザー名またはメールアドレスで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ロール" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="user">求職者</SelectItem>
                  <SelectItem value="employer">企業</SelectItem>
                  <SelectItem value="admin">管理者</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="verified">認証済み</SelectItem>
                  <SelectItem value="unverified">未認証</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ユーザー一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            ユーザー一覧 ({filteredUsers.length}件)
          </CardTitle>
          <CardDescription>
            システムに登録されている全ユーザー
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {user.role === 'admin' ? (
                      <Shield className="h-5 w-5 text-red-600" />
                    ) : user.role === 'employer' ? (
                      <Building2 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <UserCheck className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.name}</h3>
                      {user.email_verified ? (
                        <Badge variant="default" className="text-xs">認証済み</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">未認証</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        登録: {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      {user.last_login && (
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          最終ログイン: {new Date(user.last_login).toLocaleDateString('ja-JP')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  
                  {user.job_count !== undefined && (
                    <span className="text-sm text-gray-500">
                      求人: {user.job_count}件
                    </span>
                  )}
                  
                  {user.application_count !== undefined && (
                    <span className="text-sm text-gray-500">
                      応募: {user.application_count}件
                    </span>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUserAction('view', user.id)}>
                        詳細を見る
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction('edit', user.id)}>
                        編集
                      </DropdownMenuItem>
                      {user.role !== 'admin' && (
                        <>
                          <DropdownMenuItem onClick={() => handleUserAction('verify', user.id)}>
                            {user.email_verified ? '認証を取り消す' : '認証する'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('delete', user.id)}
                            className="text-red-600"
                          >
                            削除
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">条件に一致するユーザーが見つかりませんでした</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
