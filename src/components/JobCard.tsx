import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
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

export const JobCard = ({
  id,
  title,
  company,
  location,
  salary,
  workTime,
  employmentType,
  description,
  tags,
  featured = false
}: JobCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/jobs/${id}`);
  };
  return (
    <Card className={`bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 ${
      featured ? 'ring-2 ring-primary shadow-red' : ''
    }`}>
      <CardContent className="p-6">
        {featured && (
          <Badge className="bg-primary text-primary-foreground mb-2">
            注目の求人
          </Badge>
        )}
        
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground font-medium mb-3">
          {company}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            {location}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4 mr-2 text-primary" />
            {salary}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            {workTime}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{employmentType}</Badge>
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0">
        <Button className="w-full" variant="outline" onClick={handleViewDetails}>
          詳細を見る
        </Button>
      </CardFooter>
    </Card>
  );
};

