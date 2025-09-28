import { useState } from "react";
import { Header } from "@/components/Header";
import { JobSearchForm } from "@/components/JobSearchForm";
import { JobListingSection } from "@/components/JobListingSection";
import { sampleJobs, featuredJobs, recommendedJobs } from "@/data/sampleJobs";
import officeBuilding from "@/assets/office-building.jpg";
import businessTeam from "@/assets/business-team.jpg";
import workspace from "@/assets/workspace.jpg";

const Index = () => {
  const [searchResults, setSearchResults] = useState(sampleJobs);
  const [resultCount, setResultCount] = useState(sampleJobs.length);

  const handleSearch = (params: {
    keyword: string;
    location: string;
    jobType: string;
    workStyle: string;
  }) => {
    // Simple search simulation - in real app, this would be an API call
    let filtered = sampleJobs;
    
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
    
    setSearchResults(filtered);
    setResultCount(filtered.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
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
          
          <JobSearchForm onSearch={handleSearch} />
          
          {searchResults !== sampleJobs && (
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
        {searchResults !== sampleJobs ? (
          <JobListingSection
            title="検索結果"
            jobs={searchResults}
            showAll={true}
          />
        ) : (
          <>
            <JobListingSection
              title="あなたにおすすめの仕事"
              jobs={recommendedJobs}
            />
            
            <JobListingSection
              title="注目の仕事"
              jobs={featuredJobs}
            />
          </>
        )}
      </main>
      
      <footer className="bg-secondary py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-lg mb-4">Bizresearch</h4>
              <p className="text-muted-foreground text-sm">
                理想の仕事探しをサポートする求人サイトです。あなたにぴったりの職場を見つけましょう。
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">求人情報</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">正社員求人</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">契約社員求人</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">パート・アルバイト</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">派遣社員求人</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">エリア別求人</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">東京都の求人</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">大阪府の求人</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">神奈川県の求人</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">愛知県の求人</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">サポート</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">利用規約</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">プライバシーポリシー</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">お問い合わせ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">よくある質問</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Bizresearch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
