import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Trash2,
  Upload
} from 'lucide-react';
import { authApi, getFileUrl, Experience, Education } from '@/lib/api';

interface Skill {
  id: number;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

const Profile: React.FC = () => {
  const { user, token, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // User data from Auth context
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.address || '',
    bio: user?.bio || '',
    title: '',
    avatar: user?.avatar_url || null
  });

  // Update userData when user changes
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.address || '',
        bio: user.bio || '',
        title: '',
        avatar: user.avatar_url || null
      });
    }
  }, [user]);

  const [skills, setSkills] = useState<Skill[]>(() => {
    if (user?.skills && Array.isArray(user.skills)) {
      return user.skills.map((skill, index) => ({
        id: index + 1,
        name: typeof skill === 'string' ? skill : skill,
        level: 'intermediate' as const
      }));
    }
    return [];
  });

  // Update skills when user changes
  useEffect(() => {
    if (user?.skills && Array.isArray(user.skills)) {
      setSkills(user.skills.map((skill, index) => ({
        id: index + 1,
        name: typeof skill === 'string' ? skill : skill,
        level: 'intermediate' as const
      })));
    }
  }, [user?.skills]);

  const [experiences, setExperiences] = useState<Experience[]>(() => {
    if (user?.experiences && Array.isArray(user.experiences) && user.experiences.length > 0) {
      return user.experiences;
    }
    return [
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
    ];
  });

  const [education, setEducation] = useState<Education[]>(() => {
    if (user?.educations && Array.isArray(user.educations) && user.educations.length > 0) {
      return user.educations;
    }
    return [
      {
        id: 1,
        degree: '学士（理学）',
        school: '東京大学',
        field: '情報科学',
        startDate: '2016-09',
        endDate: '2020-05',
        gpa: '3.8'
      }
    ];
  });

  // Update experiences and education when user changes
  useEffect(() => {
    if (user?.experiences && Array.isArray(user.experiences) && user.experiences.length > 0) {
      setExperiences(user.experiences);
    }
    if (user?.educations && Array.isArray(user.educations) && user.educations.length > 0) {
      setEducation(user.educations);
    }
  }, [user?.experiences, user?.educations]);

  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  
  // Experience editing state
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  
  // Education editing state
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [showEducationForm, setShowEducationForm] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user || !token) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare profile data including experiences and education
      const profileData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.location,
        bio: userData.bio,
        skills: skills.map(s => s.name),
        education: user.education,
        experiences: experiences.map(exp => ({
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
          isCurrent: exp.isCurrent
        })),
        educations: education.map(edu => ({
          degree: edu.degree,
          school: edu.school,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa
        }))
      };

      // Use the complete profile update function with avatar upload
      await authApi.updateCompleteProfile(
        profileData,
        selectedImage,
        token
      );

      // Refresh user data from server to get the updated avatar URL and all profile data
      if (token) {
        const refreshedUser = await authApi.getProfile(token);
        if (refreshedUser.data.data?.user) {
          const updatedUser = refreshedUser.data.data.user;
          
          // Update local userData state to reflect the new avatar immediately
          setUserData({
            name: updatedUser.name || '',
            email: updatedUser.email || '',
            phone: updatedUser.phone || '',
            location: updatedUser.address || '',
            bio: updatedUser.bio || '',
            title: '',
            avatar: updatedUser.avatar_url || null
          });
          
          // Also trigger the AuthContext updateProfile to update the global user state
          await updateProfile(profileData);
        }
      }

      setSuccess('プロフィールを更新しました');
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'プロフィールの更新に失敗しました';
      setError(errorMessage);
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
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

  // Experience handlers
  const handleAddExperience = () => {
    setEditingExperience({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: null,
      description: '',
      isCurrent: false
    });
    setShowExperienceForm(true);
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingExperience(exp);
    setShowExperienceForm(true);
  };

  const handleSaveExperience = () => {
    if (editingExperience) {
      if (editingExperience.id) {
        // Update existing
        setExperiences(experiences.map(exp => 
          exp.id === editingExperience.id ? editingExperience : exp
        ));
      } else {
        // Add new
        setExperiences([...experiences, { ...editingExperience, id: Date.now() }]);
      }
      setEditingExperience(null);
      setShowExperienceForm(false);
    }
  };

  const handleDeleteExperience = (id: number) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  // Education handlers
  const handleAddEducation = () => {
    setEditingEducation({
      degree: '',
      school: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    });
    setShowEducationForm(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEditingEducation(edu);
    setShowEducationForm(true);
  };

  const handleSaveEducation = () => {
    if (editingEducation) {
      if (editingEducation.id) {
        // Update existing
        setEducation(education.map(edu => 
          edu.id === editingEducation.id ? editingEducation : edu
        ));
      } else {
        // Add new
        setEducation([...education, { ...editingEducation, id: Date.now() }]);
      }
      setEditingEducation(null);
      setShowEducationForm(false);
    }
  };

  const handleDeleteEducation = (id: number) => {
    setEducation(education.filter(edu => edu.id !== id));
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

  // Show loading state if user is not loaded yet
  if (!user) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">プロフィール</h1>
        <p className="text-gray-600">プロフェッショナルなプロフィールと情報を管理しましょう</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage src={imagePreview || getFileUrl(userData.avatar) || undefined} />
                  <AvatarFallback className="text-2xl">
                    {userData.name ? userData.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          画像を選択
                        </span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
              <CardTitle className="text-xl">{userData.name || 'ユーザー名未設定'}</CardTitle>
              <CardDescription>{userData.title || user?.role}</CardDescription>
              <div className="flex justify-center mt-4">
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <>読み込み中...</>
                  ) : isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      変更を保存
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      プロフィールを編集
                    </>
                  )}
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
                <Button size="sm" onClick={handleAddExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
              
              {/* Experience Form */}
              {showExperienceForm && editingExperience && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Job Title</Label>
                          <Input
                            value={editingExperience.title}
                            onChange={(e) => setEditingExperience({...editingExperience, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={editingExperience.company}
                            onChange={(e) => setEditingExperience({...editingExperience, company: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={editingExperience.location}
                          onChange={(e) => setEditingExperience({...editingExperience, location: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="month"
                            value={editingExperience.startDate}
                            onChange={(e) => setEditingExperience({...editingExperience, startDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            value={editingExperience.endDate || ''}
                            onChange={(e) => setEditingExperience({...editingExperience, endDate: e.target.value || null})}
                            disabled={editingExperience.isCurrent}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isCurrent"
                          checked={editingExperience.isCurrent}
                          onChange={(e) => setEditingExperience({...editingExperience, isCurrent: e.target.checked, endDate: e.target.checked ? null : editingExperience.endDate})}
                        />
                        <Label htmlFor="isCurrent">I currently work here</Label>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editingExperience.description}
                          onChange={(e) => setEditingExperience({...editingExperience, description: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveExperience}>Save</Button>
                        <Button variant="outline" onClick={() => {
                          setShowExperienceForm(false);
                          setEditingExperience(null);
                        }}>Cancel</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {experiences.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                        <p className="text-sm text-gray-500">
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditExperience(exp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteExperience(exp.id!)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button size="sm" onClick={handleAddEducation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
              
              {/* Education Form */}
              {showEducationForm && editingEducation && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Degree</Label>
                          <Input
                            value={editingEducation.degree}
                            onChange={(e) => setEditingEducation({...editingEducation, degree: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Field of Study</Label>
                          <Input
                            value={editingEducation.field}
                            onChange={(e) => setEditingEducation({...editingEducation, field: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>School/University</Label>
                        <Input
                          value={editingEducation.school}
                          onChange={(e) => setEditingEducation({...editingEducation, school: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="month"
                            value={editingEducation.startDate}
                            onChange={(e) => setEditingEducation({...editingEducation, startDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            value={editingEducation.endDate}
                            onChange={(e) => setEditingEducation({...editingEducation, endDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>GPA (Optional)</Label>
                          <Input
                            value={editingEducation.gpa || ''}
                            onChange={(e) => setEditingEducation({...editingEducation, gpa: e.target.value})}
                            placeholder="3.8"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveEducation}>Save</Button>
                        <Button variant="outline" onClick={() => {
                          setShowEducationForm(false);
                          setEditingEducation(null);
                        }}>Cancel</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {education.map((edu) => (
                <Card key={edu.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-sm text-gray-600">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.field}</p>
                        <p className="text-sm text-gray-500">
                          {edu.startDate} - {edu.endDate}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditEducation(edu)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEducation(edu.id!)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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
        <div className="fixed bottom-4 right-4 flex space-x-2 z-50">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? '保存中...' : '変更を保存'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditing(false);
              setSelectedImage(null);
              setImagePreview(null);
              setError(null);
              setSuccess(null);
            }}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            キャンセル
          </Button>
        </div>
      )}
    </div>
  );
};

export default Profile;
