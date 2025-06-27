import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Wallet, Target } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => {
  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-black/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/60 text-sm font-medium">{title}</div>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="text-white text-xl font-bold mb-1">{value}</div>
      {change && (
        <div className={`flex items-center gap-1 text-sm ${
          changeType === 'positive' ? 'text-green-400' : 'text-red-400'
        }`}>
          {changeType === 'positive' ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {change}
        </div>
      )}
    </div>
  );
};

export const UserStats: React.FC = () => {
  return (
    <div className="w-80 bg-black/40 backdrop-blur-sm border-r border-white/10 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-2">Financial Overview</h2>
        <p className="text-white/60 text-sm">Your financial health at a glance</p>
      </div>

      <div className="space-y-4">
        <StatCard
          title="Total Balance"
          value="$45,230.50"
          change="+2.5%"
          changeType="positive"
          icon={<Wallet className="size-5" />}
        />

        <StatCard
          title="Monthly Savings"
          value="$3,200.00"
          change="+12.3%"
          changeType="positive"
          icon={<Target className="size-5" />}
        />

        <StatCard
          title="Investment Portfolio"
          value="$28,450.75"
          change="-1.2%"
          changeType="negative"
          icon={<PieChart className="size-5" />}
        />

        <StatCard
          title="Monthly Income"
          value="$8,500.00"
          change="+5.8%"
          changeType="positive"
          icon={<DollarSign className="size-5" />}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-white text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          <div className="bg-black/20 border border-white/10 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white text-sm font-medium">Salary Deposit</div>
                <div className="text-white/60 text-xs">Jan 15, 2025</div>
              </div>
              <div className="text-green-400 font-semibold">+$8,500</div>
            </div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white text-sm font-medium">Investment Purchase</div>
                <div className="text-white/60 text-xs">Jan 12, 2025</div>
              </div>
              <div className="text-red-400 font-semibold">-$2,000</div>
            </div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white text-sm font-medium">Dividend Payment</div>
                <div className="text-white/60 text-xs">Jan 10, 2025</div>
              </div>
              <div className="text-green-400 font-semibold">+$450</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-white text-lg font-semibold mb-4">Goals Progress</h3>
        <div className="space-y-4">
          <div className="bg-black/20 border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-medium">Emergency Fund</span>
              <span className="text-white/60 text-sm">75%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="text-white/60 text-xs mt-1">$7,500 / $10,000</div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-medium">Retirement Fund</span>
              <span className="text-white/60 text-sm">45%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="text-white/60 text-xs mt-1">$45,000 / $100,000</div>
          </div>
        </div>
      </div>
    </div>
  );
};