import { Shield, User, GraduationCap } from "lucide-react";

const accessCards = [
  {
    title: "Administrator Access",
    badge: "Admin",
    badgeClassName: "bg-red-500",
    iconClassName: "bg-red-50 text-red-500",
    icon: Shield,
    demo: "admin@college.edu / admin123",
    features: [
      "Full system access",
      "Manage students and faculty",
      "Configure courses",
      "Set role permissions",
      "Generate reports",
      "View all analytics",
    ],
  },
  {
    title: "Faculty Access",
    badge: "Faculty",
    badgeClassName: "bg-blue-500",
    iconClassName: "bg-blue-50 text-blue-500",
    icon: User,
    demo: "faculty@college.edu / faculty123",
    features: [
      "View assigned classes",
      "Access student lists",
      "Mark attendance",
      "Manage course activities",
      "Review student progress",
      "View class analytics",
    ],
  },
  {
    title: "Student Access",
    badge: "Student",
    badgeClassName: "bg-green-500",
    iconClassName: "bg-green-50 text-green-500",
    icon: GraduationCap,
    demo: "student@college.edu / student123",
    features: [
      "View enrolled courses",
      "Track attendance",
      "Follow course updates",
      "Check grades",
      "View results",
      "Access course materials",
    ],
  },
];

const featureSections = [
  {
    title: "User Interface",
    items: [
      "Clean and modern design",
      "Responsive layout for all devices",
      "Interactive charts and graphs",
      "Real-time notifications",
      "Easy navigation with sidebar",
      "Search and filter capabilities",
    ],
  },
  {
    title: "Functionality",
    items: [
      "Role-based access control",
      "CRUD operations for all entities",
      "Attendance management",
      "Course and classroom management",
      "Grade management",
      "Analytics and reporting",
    ],
  },
];

function HelpGuide() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">Quick Guide</h1>
        <p className="mt-1 text-sm text-gray-400">
          Learn how to use the College Management System
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto pr-1">
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {accessCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClassName}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold text-white ${card.badgeClassName}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <h2 className="text-base font-bold text-gray-900">{card.title}</h2>

                <ul className="flex-1 space-y-1.5 text-sm text-gray-600">
                  {card.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>

                <div className="mt-2 rounded-xl bg-gray-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-gray-500">Demo Login:</p>
                  <p className="text-xs text-gray-700">{card.demo}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-base font-bold text-gray-800">Key Features</h2>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {featureSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-sm font-bold text-gray-800">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-semibold text-gray-400">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpGuide;
