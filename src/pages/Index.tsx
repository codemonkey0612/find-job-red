import { useState } from "react";
import { Header } from "@/components/Header";
import { JobSearchForm } from "@/components/JobSearchForm";
import { JobListingSection } from "@/components/JobListingSection";
import { sampleJobs, featuredJobs, recommendedJobs } from "@/data/sampleJobs";

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
      
      <footer className="bg-secondary py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Bizresearch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
