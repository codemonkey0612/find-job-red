import { useState } from "react";
import { JobCard } from "./JobCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  defaultDisplayCount?: number;
}

export const JobListingSection = ({ title, jobs, showAll = false, defaultDisplayCount = 6 }: JobListingSectionProps) => {
  const [displayCount, setDisplayCount] = useState(defaultDisplayCount);
  const displayJobs = showAll ? jobs : jobs.slice(0, displayCount);
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-4">
          {!showAll && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">表示件数:</label>
              <Select value={displayCount.toString()} onValueChange={(value) => setDisplayCount(Number(value))}>
                <SelectTrigger className="w-24">
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6件</SelectItem>
                  <SelectItem value="12">12件</SelectItem>
                  <SelectItem value="18">18件</SelectItem>
                  <SelectItem value="24">24件</SelectItem>
                  <SelectItem value={jobs.length.toString()}>すべて</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {!showAll && jobs.length > displayCount && (
            <button 
              onClick={() => setDisplayCount(jobs.length)}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              すべて見る ({jobs.length}件)
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayJobs.map((job) => (
          <JobCard 
            key={job.id}
            id={job.id}
            title={job.title}
            company={job.company}
            location={job.location}
            salary={job.salary}
            workTime={job.workTime}
            employmentType={job.employmentType}
            description={job.description}
            tags={job.tags}
            featured={job.featured}
          />
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


export default JobListingSection;