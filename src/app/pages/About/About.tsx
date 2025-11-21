import { Battery, Zap, TrendingUp, Shield, Users, Award } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Battery,
      title: "Premium Batteries",
      description: "High-quality EV batteries from trusted manufacturers",
      color: "from-ocean-500 to-ocean-600",
    },
    {
      icon: Zap,
      title: "Fast Transactions",
      description: "Quick and secure payment processing",
      color: "from-energy-500 to-energy-600",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data and transactions are protected",
      color: "from-ocean-500 to-energy-500",
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      description: "Competitive pricing with auction system",
      color: "from-energy-500 to-ocean-500",
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join thousands of satisfied customers",
      color: "from-ocean-400 to-ocean-600",
    },
    {
      icon: Award,
      title: "Certified Quality",
      description: "All products verified and certified",
      color: "from-energy-400 to-energy-600",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-ocean-500 via-energy-500 to-ocean-600 text-white">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fadeIn">
            About ChargeX
          </h1>
          <p className="text-xl sm:text-2xl text-ocean-100 max-w-3xl mx-auto animate-slideUp">
            Nền tảng đáng tin cậy của bạn cho pin xe điện cao cấp
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="mb-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl border border-ocean-200/50">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-dark-800 text-center max-w-3xl mx-auto leading-relaxed font-medium">
              ChargeX cam kết cách mạng hóa nền tảng pin xe điện bằng cách cung cấp 
              a secure, transparent, and efficient platform for buying and selling premium 
              electric vehicle batteries. We connect buyers and sellers while ensuring quality, 
              safety, and the best possible prices through our innovative auction system.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-12 text-center">
            Why Choose ChargeX?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-ocean-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 mb-2 group-hover:text-ocean-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-dark-800 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-ocean-500 to-energy-500 rounded-3xl p-8 sm:p-12 shadow-2xl text-white mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-ocean-100 text-lg">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-ocean-100 text-lg">Batteries Sold</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-ocean-100 text-lg">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl border border-ocean-200/50">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-6 text-center">
            Get in Touch
          </h2>
          <p className="text-lg text-dark-800 text-center max-w-2xl mx-auto mb-8 font-medium">
            Have questions? We're here to help! Reach out to our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@chargex.id.vn"
              className="px-8 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white rounded-xl font-semibold shadow-lg shadow-ocean-500/30 hover:shadow-xl hover:scale-105 transition-all text-center"
            >
              Contact Support
            </a>
            <a
              href="tel:+84123456789"
              className="px-8 py-3 bg-gradient-to-r from-energy-500 to-energy-600 hover:from-energy-600 hover:to-energy-700 text-white rounded-xl font-semibold shadow-lg shadow-energy-500/30 hover:shadow-xl hover:scale-105 transition-all text-center"
            >
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
