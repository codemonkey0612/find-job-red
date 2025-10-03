import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, MapPin, Users, Star, ExternalLink } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  description: string;
  location: string;
  industry: string;
  size: string;
  website: string;
  logo?: string;
  rating: number;
  jobCount: number;
  isHiring: boolean;
}

const Companies: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [loading, setLoading] = useState(true);

  // Sample data - replace with API call
  useEffect(() => {
    const sampleCompanies: Company[] = [
      {
        id: 1,
        name: 'テックソリューション株式会社',
        description: '企業クライアント向けの革新的なソフトウェアソリューションのリーディングプロバイダーです。',
        location: '東京都渋谷区',
        industry: 'テクノロジー',
        size: '500-1000名',
        website: 'https://techcorp.com',
        rating: 4.5,
        jobCount: 12,
        isHiring: true
      },
      {
        id: 2,
        name: 'グリーンエナジー株式会社',
        description: 'より良い明日のための持続可能なエネルギーソリューションを提供しています。',
        location: '大阪府大阪市',
        industry: 'エネルギー',
        size: '100-500名',
        website: 'https://greenenergy.com',
        rating: 4.2,
        jobCount: 8,
        isHiring: true
      },
      {
        id: 3,
        name: 'ヘルスファーストメディカル',
        description: '革新的なヘルスケア技術とサービスを提供しています。',
        location: '神奈川県横浜市',
        industry: 'ヘルスケア',
        size: '1000名以上',
        website: 'https://healthfirst.com',
        rating: 4.7,
        jobCount: 15,
        isHiring: true
      }
    ];

    setCompanies(sampleCompanies);
    setFilteredCompanies(sampleCompanies);
    setLoading(false);
  }, []);

  const industries = ['all', 'テクノロジー', 'エネルギー', 'ヘルスケア', '金融', '教育'];

  useEffect(() => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, selectedIndustry, companies]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading companies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">企業一覧</h1>
        <p className="text-gray-600">企業を発見し、キャリアの機会を探しましょう</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="企業を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'all' ? 'すべての業界' : industry}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.location}
                    </CardDescription>
                  </div>
                </div>
                {company.isHiring && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    募集中
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {company.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">業界:</span>
                  <span className="ml-2">{company.industry}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{company.size}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{company.rating}/5.0</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {company.jobCount}件の求人
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      ウェブサイト
                    </a>
                  </Button>
                  <Button size="sm" onClick={() => navigate(`/companies/${company.id}`)}>
                    続きを読む
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">企業が見つかりません</h3>
          <p className="text-gray-500">検索条件を調整してみてください</p>
        </div>
      )}
    </div>
  );
};

export default Companies;
