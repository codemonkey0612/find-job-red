import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Heart
} from 'lucide-react';
import logo from '@/assets/logo.jpg';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 会社情報 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Bizresearch" className="w-8 h-8 rounded" />
              <h3 className="text-xl font-bold">Bizresearch</h3>
            </div>
            <p className="text-gray-300 text-sm">
              革新的な求人プラットフォームで、理想のキャリアを見つけましょう。
              企業と求職者を繋ぐ信頼できるパートナーです。
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://x.com" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* 求職者向けリンク */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">求職者向け</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  求人を探す
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-gray-300 hover:text-white transition-colors">
                  企業情報
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors">
                  お役立ち情報
                </Link>
              </li>
              <li>
                <Link to="/applications" className="text-gray-300 hover:text-white transition-colors">
                  応募履歴
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
                  プロフィール
                </Link>
              </li>
            </ul>
          </div>

          {/* 企業向けリンク */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">企業向け</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/add-job" className="text-gray-300 hover:text-white transition-colors">
                  求人を投稿
                </Link>
              </li>
              <li>
                <Link to="/employer/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  企業ダッシュボード
                </Link>
              </li>
              <li>
                <Link to="/employer/jobs" className="text-gray-300 hover:text-white transition-colors">
                  求人管理
                </Link>
              </li>
              <li>
                <Link to="/employer/applications" className="text-gray-300 hover:text-white transition-colors">
                  応募者管理
                </Link>
              </li>
              <li>
                <Link to="/employer/analytics" className="text-gray-300 hover:text-white transition-colors">
                  分析レポート
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート・お問い合わせ */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">サポート</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  よくある質問
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
            </ul>
            
            {/* 連絡先情報 */}
            <div className="pt-4 border-t border-gray-700">
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@bizresearch.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>03-1234-5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>東京都渋谷区恵比寿1-1-1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 下部バー */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 Bizresearch. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>in Japan</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
