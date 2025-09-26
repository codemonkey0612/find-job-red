import { JobCard } from "./JobCard";

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

interface JobListingSectionProps {
  title: string;
  jobs: Job[];
  showAll?: boolean;
}

export const JobListingSection = ({ title, jobs, showAll = false }: JobListingSectionProps) => {
  const displayJobs = showAll ? jobs : jobs.slice(0, 6);
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {!showAll && jobs.length > 6 && (
          <button className="text-primary hover:text-primary/80 font-medium">
            すべて見る ({jobs.length}件)
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayJobs.map((job) => (
          <JobCard key={job.id} {...job} />
        ))}
      </div>
      
      {displayJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">該当する求人が見つかりませんでした。</p>
        </div>
      )}
    </section>
  );
};