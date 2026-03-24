// import StatCard from './StatCard';
import StatCard from "./StatCard"
import { Users, UsersRound, BookOpen, Calendar } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. Sarah Johnson</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value="2,845"
          change="+12.5%"
          changeType="increase"
          icon={Users}
          iconBgColor="bg-blue-600"
        />
        <StatCard
          title="Total Faculty"
          value="142"
          change="+3.2%"
          changeType="increase"
          icon={UsersRound}
          iconBgColor="bg-green-500"
        />
        <StatCard
          title="Active Courses"
          value="68"
          change="+5.8%"
          changeType="increase"
          icon={BookOpen}
          iconBgColor="bg-purple-600"
        />
        <StatCard
          title="Avg. Attendance"
          value="87.3%"
          change="-2.1%"
          changeType="decrease"
          icon={Calendar}
          iconBgColor="bg-orange-500"
        />
      </div>
    </div>
  );
}