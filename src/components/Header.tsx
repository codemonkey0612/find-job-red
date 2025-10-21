import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Briefcase, FileText, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.jpg";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="Bizresearch" className="w-10 h-10 rounded" />
          <h1 className="text-2xl font-bold text-foreground">Bizresearch</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            求人を探す
          </button>
          <button 
            onClick={() => navigate('/companies')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            企業情報
          </button>
                 <button 
                   onClick={() => navigate('/resources')}
                   className="text-muted-foreground hover:text-foreground transition-colors"
                 >
                   お役立ち情報
                 </button>
                 {user?.role === 'employer' && (
                   <button 
                     onClick={() => navigate('/add-job')}
                     className="text-muted-foreground hover:text-foreground transition-colors"
                   >
                     求人を投稿
                   </button>
                 )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role === 'employer' ? '企業' : user.role === 'admin' ? '管理者' : '求職者'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>プロフィール</span>
                </DropdownMenuItem>
                {user.role === 'employer' && (
                  <DropdownMenuItem onClick={() => navigate('/employer/jobs')}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>求人管理</span>
                  </DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>管理者ダッシュボード</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>ユーザー管理</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/jobs')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>求人管理</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin/jobs/approval')}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span>求人承認</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate('/applications')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>応募履歴</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>設定</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/login')}
              >
                ログイン
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/login')}
              >
                新規登録
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};


export default Header;