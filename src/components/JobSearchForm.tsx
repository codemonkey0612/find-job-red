import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface JobSearchFormProps {
  onSearch?: (params: {
    keyword: string;
    location: string;
    jobType: string;
    workStyle: string;
  }) => void;
  onParamsChange?: (params: {
    keyword: string;
    location: string;
    jobType: string;
    workStyle: string;
  }) => void;
  resultCount?: number;
}

export const JobSearchForm = ({ onSearch, onParamsChange, resultCount }: JobSearchFormProps) => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [workStyle, setWorkStyle] = useState("");

  // 検索パラメータが変更されたら親コンポーネントに通知
  useEffect(() => {
    onParamsChange?.({ keyword, location, jobType, workStyle });
  }, [keyword, location, jobType, workStyle, onParamsChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ keyword, location, jobType, workStyle });
  };

  return (
    <div className="bg-background shadow-card rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4">お仕事探し</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              勤務地
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="border-animate click-animate">
                <SelectValue placeholder="勤務地を選択" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="hokkaido">北海道</SelectItem>
                <SelectItem value="aomori">青森県</SelectItem>
                <SelectItem value="iwate">岩手県</SelectItem>
                <SelectItem value="miyagi">宮城県</SelectItem>
                <SelectItem value="akita">秋田県</SelectItem>
                <SelectItem value="yamagata">山形県</SelectItem>
                <SelectItem value="fukushima">福島県</SelectItem>
                <SelectItem value="ibaraki">茨城県</SelectItem>
                <SelectItem value="tochigi">栃木県</SelectItem>
                <SelectItem value="gunma">群馬県</SelectItem>
                <SelectItem value="saitama">埼玉県</SelectItem>
                <SelectItem value="chiba">千葉県</SelectItem>
                <SelectItem value="tokyo">東京都</SelectItem>
                <SelectItem value="kanagawa">神奈川県</SelectItem>
                <SelectItem value="niigata">新潟県</SelectItem>
                <SelectItem value="toyama">富山県</SelectItem>
                <SelectItem value="ishikawa">石川県</SelectItem>
                <SelectItem value="fukui">福井県</SelectItem>
                <SelectItem value="yamanashi">山梨県</SelectItem>
                <SelectItem value="nagano">長野県</SelectItem>
                <SelectItem value="gifu">岐阜県</SelectItem>
                <SelectItem value="shizuoka">静岡県</SelectItem>
                <SelectItem value="aichi">愛知県</SelectItem>
                <SelectItem value="mie">三重県</SelectItem>
                <SelectItem value="shiga">滋賀県</SelectItem>
                <SelectItem value="kyoto">京都府</SelectItem>
                <SelectItem value="osaka">大阪府</SelectItem>
                <SelectItem value="hyogo">兵庫県</SelectItem>
                <SelectItem value="nara">奈良県</SelectItem>
                <SelectItem value="wakayama">和歌山県</SelectItem>
                <SelectItem value="tottori">鳥取県</SelectItem>
                <SelectItem value="shimane">島根県</SelectItem>
                <SelectItem value="okayama">岡山県</SelectItem>
                <SelectItem value="hiroshima">広島県</SelectItem>
                <SelectItem value="yamaguchi">山口県</SelectItem>
                <SelectItem value="tokushima">徳島県</SelectItem>
                <SelectItem value="kagawa">香川県</SelectItem>
                <SelectItem value="ehime">愛媛県</SelectItem>
                <SelectItem value="kochi">高知県</SelectItem>
                <SelectItem value="fukuoka">福岡県</SelectItem>
                <SelectItem value="saga">佐賀県</SelectItem>
                <SelectItem value="nagasaki">長崎県</SelectItem>
                <SelectItem value="kumamoto">熊本県</SelectItem>
                <SelectItem value="oita">大分県</SelectItem>
                <SelectItem value="miyazaki">宮崎県</SelectItem>
                <SelectItem value="kagoshima">鹿児島県</SelectItem>
                <SelectItem value="okinawa">沖縄県</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              職種
            </label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="border-animate click-animate">
                <SelectValue placeholder="職種を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">事務・オフィス系</SelectItem>
                <SelectItem value="sales">営業・販売系</SelectItem>
                <SelectItem value="it">IT・エンジニア系</SelectItem>
                <SelectItem value="service">サービス系</SelectItem>
                <SelectItem value="manufacturing">製造・軽作業系</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              はたらき方
            </label>
            <Select value={workStyle} onValueChange={setWorkStyle}>
              <SelectTrigger className="border-animate click-animate">
                <SelectValue placeholder="はたらき方を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fulltime">正社員</SelectItem>
                <SelectItem value="parttime">パート・アルバイト</SelectItem>
                <SelectItem value="contract">契約社員</SelectItem>
                <SelectItem value="dispatch">派遣社員</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              キーワード
            </label>
            <Input
              type="text"
              placeholder="職種、勤務地など"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border-animate click-animate"
            />
          </div>
        </div>
        
        {resultCount !== undefined && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              該当する求人: <span className="font-semibold text-primary">{resultCount}件</span>
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button type="submit" className="w-full md:w-auto px-8 py-2 bg-primary text-primary-foreground hover:bg-primary/90 click-animate">
            <Search className="w-4 h-4 mr-2" />
            検索
          </Button>
        </div>
      </form>
    </div>
  );
};