import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';

interface Skill {
  id: number;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  isCurrent: boolean;
}

interface Education {
  id: number;
  degree: string;
  school: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample user data - replace with actual user data from context
  const [userData, setUserData] = useState({
    name: '田中太郎',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    location: '東京都渋谷区',
    bio: 'フルスタック開発に5年以上の経験を持つ情熱的なソフトウェアエンジニアです。スケーラブルなアプリケーションの構築と複雑な問題の解決を愛しています。',
    title: 'シニアソフトウェアエンジニア',
    avatar: null
  });

  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: 'JavaScript', level: 'expert' },
    { id: 2, name: 'React', level: 'advanced' },
    { id: 3, name: 'Node.js', level: 'advanced' },
    { id: 4, name: 'Python', level: 'intermediate' },
    { id: 5, name: 'AWS', level: 'intermediate' }
  ]);

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      title: 'シニアソフトウェアエンジニア',
      company: 'テックソリューション株式会社',
      location: '東京都渋谷区',
      startDate: '2022-01',
      endDate: null,
      description: 'マイクロサービスアーキテクチャの開発を主導し、システムパフォーマンスを40%向上させました',
      isCurrent: true
    },
    {
      id: 2,
      title: 'ソフトウェアエンジニア',
      company: 'スタートアップXYZ',
      location: '大阪府大阪市',
      startDate: '2020-06',
      endDate: '2021-12',
      description: 'ReactとNode.jsを使用してフルスタックWebアプリケーションを開発しました',
      isCurrent: false
    }
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: 1,
      degree: '学士（理学）',
      school: '東京大学',
      field: '情報科学',
      startDate: '2016-09',
      endDate: '2020-05',
      gpa: '3.8'
    }
  ]);

  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');

  const handleSave = () => {
    // Save user data - implement API call
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const skill: Skill = {
        id: Date.now(),
        name: newSkill.trim(),
        level: newSkillLevel
      };
      setSkills([...skills, skill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (id: number) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">プロフィール</h1>
        <p className="text-gray-600">プロフェッショナルなプロフィールと情報を管理しましょう</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{userData.name}</CardTitle>
              <CardDescription>{userData.title}</CardDescription>
              <div className="flex justify-center mt-4">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isEditing ? '変更を保存' : 'プロフィールを編集'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{userData.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{userData.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="experience">経験</TabsTrigger>
              <TabsTrigger value="education">学歴</TabsTrigger>
              <TabsTrigger value="skills">スキル</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={userData.bio}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-gray-600">{userData.bio}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">氏名</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={userData.name}
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">{userData.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="title">職種</Label>
                      {isEditing ? (
                        <Input
                          id="title"
                          value={userData.title}
                          onChange={(e) => setUserData({...userData, title: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">{userData.title}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">メールアドレス</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">{userData.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">電話番号</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={userData.phone}
                          onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">{userData.phone}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
              {experiences.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                        <p className="text-sm text-gray-500">
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
              {education.map((edu) => (
                <Card key={edu.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-sm text-gray-600">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.field}</p>
                        <p className="text-sm text-gray-500">
                          {edu.startDate} - {edu.endDate}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="w-40"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <Button size="sm" onClick={handleAddSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Badge className={getLevelColor(skill.level)}>
                      {skill.name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSkill(skill.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {isEditing && (
        <div className="fixed bottom-4 right-4 flex space-x-2">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default Profile;
