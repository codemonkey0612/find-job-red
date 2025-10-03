import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account settings
  const [accountData, setAccountData] = useState({
    firstName: '太郎',
    lastName: '田中',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    location: '東京都渋谷区',
    timezone: 'Asia/Tokyo',
    language: 'ja'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    jobAlerts: true,
    applicationUpdates: true,
    companyUpdates: false,
    marketingEmails: false,
    smsNotifications: false,
    pushNotifications: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true,
    dataSharing: false,
    analytics: true
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
    sidebarCollapsed: false
  });

  const handleSaveAccount = () => {
    // Implement save account data
    console.log('Saving account data:', accountData);
  };

  const handleSaveNotifications = () => {
    // Implement save notification settings
    console.log('Saving notification settings:', notifications);
  };

  const handleSavePrivacy = () => {
    // Implement save privacy settings
    console.log('Saving privacy settings:', privacy);
  };

  const handleSaveAppearance = () => {
    // Implement save appearance settings
    console.log('Saving appearance settings:', appearance);
  };

  const handleChangePassword = () => {
    // Implement change password
    console.log('Changing password');
  };

  const handleDeleteAccount = () => {
    // Implement delete account
    console.log('Deleting account');
  };

  const handleExportData = () => {
    // Implement export data
    console.log('Exporting data');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">設定</h1>
        <p className="text-gray-600">アカウント設定と環境設定を管理しましょう</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">アカウント</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="privacy">プライバシー</TabsTrigger>
          <TabsTrigger value="appearance">外観</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>個人情報</CardTitle>
              <CardDescription>個人の詳細情報と連絡先情報を更新してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">名</Label>
                  <Input
                    id="firstName"
                    value={accountData.firstName}
                    onChange={(e) => setAccountData({...accountData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">姓</Label>
                  <Input
                    id="lastName"
                    value={accountData.lastName}
                    onChange={(e) => setAccountData({...accountData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    value={accountData.phone}
                    onChange={(e) => setAccountData({...accountData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location">住所</Label>
                  <Input
                    id="location"
                    value={accountData.location}
                    onChange={(e) => setAccountData({...accountData, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">タイムゾーン</Label>
                  <select
                    id="timezone"
                    value={accountData.timezone}
                    onChange={(e) => setAccountData({...accountData, timezone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Tokyo">日本標準時</option>
                    <option value="America/Los_Angeles">太平洋標準時</option>
                    <option value="America/Denver">山岳部標準時</option>
                    <option value="America/Chicago">中部標準時</option>
                    <option value="America/New_York">東部標準時</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSaveAccount}>
                <Save className="h-4 w-4 mr-2" />
                変更を保存
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>セキュリティ</CardTitle>
              <CardDescription>パスワードとセキュリティ設定を管理してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">現在のパスワード</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="現在のパスワードを入力"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">新しいパスワード</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="新しいパスワードを入力"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="新しいパスワードを再入力"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={handleChangePassword}>
                <Lock className="h-4 w-4 mr-2" />
                パスワードを変更
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>メール通知</CardTitle>
              <CardDescription>受信したいメール通知を選択してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">メール通知</Label>
                  <p className="text-sm text-gray-500">メールで通知を受信する</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="jobAlerts">求人アラート</Label>
                  <p className="text-sm text-gray-500">新しい求人マッチの通知を受け取る</p>
                </div>
                <Switch
                  id="jobAlerts"
                  checked={notifications.jobAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, jobAlerts: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="applicationUpdates">応募状況の更新</Label>
                  <p className="text-sm text-gray-500">求人応募の状況更新</p>
                </div>
                <Switch
                  id="applicationUpdates"
                  checked={notifications.applicationUpdates}
                  onCheckedChange={(checked) => setNotifications({...notifications, applicationUpdates: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="companyUpdates">企業の更新情報</Label>
                  <p className="text-sm text-gray-500">フォローしている企業からのニュースと更新情報</p>
                </div>
                <Switch
                  id="companyUpdates"
                  checked={notifications.companyUpdates}
                  onCheckedChange={(checked) => setNotifications({...notifications, companyUpdates: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketingEmails">マーケティングメール</Label>
                  <p className="text-sm text-gray-500">プロモーションコンテンツとヒント</p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>その他の通知</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS通知</Label>
                  <p className="text-sm text-gray-500">SMSで通知を受信する</p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">プッシュ通知</Label>
                  <p className="text-sm text-gray-500">ブラウザとモバイルのプッシュ通知</p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                />
              </div>
              <Button onClick={handleSaveNotifications}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>プロフィールの公開設定</CardTitle>
              <CardDescription>プロフィール情報を誰が見ることができるかを制御します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profileVisibility">プロフィールの公開範囲</Label>
                  <select
                    id="profileVisibility"
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">公開 - 誰でもプロフィールを見ることができます</option>
                    <option value="connections">つながりのみ - つながりのみがプロフィールを見ることができます</option>
                    <option value="private">非公開 - あなたのみがプロフィールを見ることができます</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showEmail">メールアドレスを表示</Label>
                      <p className="text-sm text-gray-500">プロフィールにメールアドレスを表示する</p>
                    </div>
                    <Switch
                      id="showEmail"
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) => setPrivacy({...privacy, showEmail: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showPhone">電話番号を表示</Label>
                      <p className="text-sm text-gray-500">プロフィールに電話番号を表示する</p>
                    </div>
                    <Switch
                      id="showPhone"
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) => setPrivacy({...privacy, showPhone: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showLocation">住所を表示</Label>
                      <p className="text-sm text-gray-500">プロフィールに住所を表示する</p>
                    </div>
                    <Switch
                      id="showLocation"
                      checked={privacy.showLocation}
                      onCheckedChange={(checked) => setPrivacy({...privacy, showLocation: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowMessages">メッセージ許可</Label>
                      <p className="text-sm text-gray-500">他のユーザーからのメッセージを許可する</p>
                    </div>
                    <Switch
                      id="allowMessages"
                      checked={privacy.allowMessages}
                      onCheckedChange={(checked) => setPrivacy({...privacy, allowMessages: checked})}
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleSavePrivacy}>
                <Save className="h-4 w-4 mr-2" />
                プライバシー設定を保存
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>データとアナリティクス</CardTitle>
              <CardDescription>データの使用方法を制御します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataSharing">データ共有</Label>
                  <p className="text-sm text-gray-500">研究のための匿名化データの共有を許可する</p>
                </div>
                <Switch
                  id="dataSharing"
                  checked={privacy.dataSharing}
                  onCheckedChange={(checked) => setPrivacy({...privacy, dataSharing: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics">アナリティクス</Label>
                  <p className="text-sm text-gray-500">使用状況の分析でサービス改善に協力する</p>
                </div>
                <Switch
                  id="analytics"
                  checked={privacy.analytics}
                  onCheckedChange={(checked) => setPrivacy({...privacy, analytics: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Display</CardTitle>
              <CardDescription>Customize the appearance of your interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={appearance.theme}
                  onChange={(e) => setAppearance({...appearance, theme: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <select
                  id="fontSize"
                  value={appearance.fontSize}
                  onChange={(e) => setAppearance({...appearance, fontSize: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compactMode">Compact Mode</Label>
                  <p className="text-sm text-gray-500">Use more compact spacing</p>
                </div>
                <Switch
                  id="compactMode"
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) => setAppearance({...appearance, compactMode: checked})}
                />
              </div>
              <Button onClick={handleSaveAppearance}>
                <Save className="h-4 w-4 mr-2" />
外観設定を保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="mt-8 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">危険な操作</CardTitle>
          <CardDescription>アカウントに影響する取り消し不可能な操作</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">データのエクスポート</h4>
              <p className="text-sm text-gray-500">すべてのデータをダウンロードする</p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
データをエクスポート
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-600">アカウント削除</h4>
              <p className="text-sm text-gray-500">アカウントとすべてのデータを永続的に削除する</p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              アカウント削除
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
