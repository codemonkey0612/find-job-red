import { useState, useCallback, useEffect } from "react";
import { JobSearchForm } from "@/components/JobSearchForm";
import { JobListingSection } from "@/components/JobListingSection";
import officeBuilding from "@/assets/office-building.jpg";
import businessTeam from "@/assets/business-team.jpg";
import workspace from "@/assets/workspace.jpg";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  workTime: string;
  employmentType: string;
  description: string;
  tags: string[];
  featured?: boolean;
}

const Index = () => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [previewCount, setPreviewCount] = useState<number | undefined>(undefined);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (response.ok) {
          const data = await response.json();
          const jobs = data.data.jobs.map((job: any) => ({
            id: job.id.toString(),
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary_min && job.salary_max 
              ? `月給${(job.salary_min / 10000).toFixed(0)}万円～${(job.salary_max / 10000).toFixed(0)}万円`
              : '応相談',
            workTime: '9:00～18:00', // Default, could be added to schema
            employmentType: job.job_type === 'full-time' ? '正社員' :
                           job.job_type === 'part-time' ? 'パート・アルバイト' :
                           job.job_type === 'contract' ? '契約社員' : 'インターン',
            description: job.description,
            tags: job.requirements ? job.requirements.split(', ').slice(0, 3) : [],
            featured: false
          }));
          setAllJobs(jobs);
          setSearchResults(jobs);
          setResultCount(jobs.length);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 検索フィルタリングロジックを共通化
  const filterJobs = useCallback((params: {
    keyword: string;
    location: string;
    jobType: string;
    workStyle: string;
  }) => {
    let filtered = allJobs;
    
    if (params.keyword) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(params.keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(params.keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(params.keyword.toLowerCase())
      );
    }
    
    if (params.location) {
      filtered = filtered.filter(job => 
        job.location.includes(params.location === 'tokyo' ? '東京' : 
                             params.location === 'osaka' ? '大阪' :
                             params.location === 'kanagawa' ? '神奈川' :
                             params.location === 'saitama' ? '埼玉' :
                             params.location === 'chiba' ? '千葉' : '')
      );
    }
    
    if (params.workStyle) {
      filtered = filtered.filter(job => {
        if (params.workStyle === 'fulltime') return job.employmentType === '正社員';
        if (params.workStyle === 'parttime') return job.employmentType === 'パート・アルバイト';
        if (params.workStyle === 'contract') return job.employmentType === '契約社員';
        if (params.workStyle === 'dispatch') return job.employmentType === '派遣社員';
        return true;
      });
    }
    
    return filtered;
  }, [allJobs]);

  // 検索パラメータ変更時のリアルタイム件数プレビュー
  const handleParamsChange = useCallback((params: {
    keyword: string;
    location: string;
    jobType: string;
    workStyle: string;
  }) => {
    const filtered = filterJobs(params);
    setPreviewCount(filtered.length);
  }, [filterJobs]);

  // 検索実行
  const handleSearch = useCallback((params: {
    keyword: string;
    location: string;
    jobType: string;
    workStyle: string;
  }) => {
    const filtered = filterJobs(params);
    setSearchResults(filtered);
    setResultCount(filtered.length);
    setIsSearched(true);
    setPreviewCount(undefined);
  }, [filterJobs]);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Search */}
        <section className="text-center mb-12">
          <div className="bg-gradient-hero text-white py-16 px-6 rounded-lg mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              理想の仕事を見つけよう
            </h1>
            <p className="text-xl mb-8 opacity-90">
              あなたにぴったりの求人がきっと見つかります
            </p>
          </div>
          
          <JobSearchForm 
            onSearch={handleSearch}
            onParamsChange={handleParamsChange}
            resultCount={previewCount}
          />
          
          {isSearched && (
            <div className="text-center mb-6">
              <p className="text-lg text-muted-foreground">
                検索結果: <span className="font-semibold text-primary">{resultCount}件</span>の求人が見つかりました
              </p>
            </div>
          )}
        </section>

        {/* Flowing Images Section */}
        <section className="mb-16 overflow-hidden relative h-20 bg-gradient-to-r from-background via-accent to-background">
          <div className="absolute inset-0 flex items-center">
            <div className="image-flow flex space-x-8 opacity-70">
              <img src={officeBuilding} alt="オフィス" className="h-12 w-16 object-cover rounded" />
              <img src={businessTeam} alt="チーム" className="h-12 w-16 object-cover rounded" />
              <img src={workspace} alt="ワークスペース" className="h-12 w-16 object-cover rounded" />
              <img src={officeBuilding} alt="オフィス" className="h-12 w-16 object-cover rounded" />
              <img src={businessTeam} alt="チーム" className="h-12 w-16 object-cover rounded" />
            </div>
          </div>
        </section>

        {/* Business Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <img 
              src={officeBuilding} 
              alt="モダンなオフィスビル" 
              className="w-full h-48 object-cover rounded-lg mb-4 shadow-card hover:shadow-elevated transition-shadow duration-300"
            />
            <h3 className="text-xl font-semibold mb-2">優良企業多数</h3>
            <p className="text-muted-foreground">信頼できる企業の求人を厳選してご紹介</p>
          </div>
          <div className="text-center">
            <img 
              src={businessTeam} 
              alt="チームワークを大切にする職場環境" 
              className="w-full h-48 object-cover rounded-lg mb-4 shadow-card hover:shadow-elevated transition-shadow duration-300"
            />
            <h3 className="text-xl font-semibold mb-2">充実したサポート</h3>
            <p className="text-muted-foreground">転職活動から入社まで専任スタッフがサポート</p>
          </div>
          <div className="text-center">
            <img 
              src={workspace} 
              alt="快適なワークスペース環境" 
              className="w-full h-48 object-cover rounded-lg mb-4 shadow-card hover:shadow-elevated transition-shadow duration-300"
            />
            <h3 className="text-xl font-semibold mb-2">理想の職場環境</h3>
            <p className="text-muted-foreground">あなたに最適な働き方が見つかります</p>
          </div>
        </section>

        {/* Search Results or Default Sections */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">求人を読み込み中...</p>
          </div>
        ) : allJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">現在、公開されている求人はありません。</p>
          </div>
        ) : isSearched ? (
          <JobListingSection
            title="検索結果"
            jobs={searchResults}
            showAll={true}
          />
        ) : (
          <JobListingSection
            title="すべての求人"
            jobs={allJobs}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
