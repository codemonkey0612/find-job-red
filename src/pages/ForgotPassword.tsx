import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // In development mode, show the reset link
        if (data.data?.resetLink) {
          setResetLink(data.data.resetLink);
        }
      } else {
        setError(data.message || 'パスワードリセットに失敗しました');
      }
    } catch (err) {
      setError('サーバーエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">メール送信完了</CardTitle>
            <CardDescription className="text-center">
              パスワードリセットの手順をメールで送信しました
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              {email} にパスワードリセット用のリンクを送信しました。
              メールをご確認いただき、リンクをクリックして新しいパスワードを設定してください。
            </p>
            <p className="text-sm text-gray-600 text-center">
              リンクの有効期限は1時間です。
            </p>
            
            {resetLink && (
              <Alert>
                <AlertDescription className="text-xs">
                  <strong>開発環境:</strong> パスワードリセットページに直接アクセスできます<br />
                  <a 
                    href={resetLink} 
                    className="text-blue-600 hover:underline break-all"
                  >
                    {window.location.origin}{resetLink}
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center">
                メールが届かない場合は、迷惑メールフォルダをご確認ください。
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                ログインページに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="w-fit mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ログインに戻る
          </Button>
          <CardTitle>パスワードを忘れた場合</CardTitle>
          <CardDescription>
            登録したメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'リセットリンクを送信中...' : 'リセットリンクを送信'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                パスワードを思い出しましたか？{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:underline"
                >
                  ログインする
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;

