import { Shield, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function ProfileSecurity() {
  const verificationSteps = [
    {
      id: "identity",
      label: "Identity Verification",
      status: "completed",
      description: "Your identity has been verified",
      icon: CheckCircle2,
    },
    {
      id: "address",
      label: "Address Proof",
      status: "pending",
      description: "Upload proof of address document",
      icon: Clock,
    },
    {
      id: "bank",
      label: "Bank Account Linking",
      status: "required",
      description: "Link your bank account for transactions",
      icon: AlertCircle,
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800 border-green-300",
      pending: "bg-orange-100 text-orange-800 border-orange-300",
      required: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const completedCount = verificationSteps.filter(s => s.status === "completed").length;
  const progressPercentage = (completedCount / verificationSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-500 to-energy-500 bg-clip-text text-transparent">
          Security Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ensure a secure trading environment by completing verification
        </p>
      </div>

      {/* Verification Progress Card */}
      <Card className="border-ocean-200/30 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ocean-700">
            <Shield className="w-5 h-5 text-ocean-600" />
            KYC Verification Status
          </CardTitle>
          <CardDescription className="text-ocean-600">
            Complete all verification steps to unlock full platform features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ocean-700">
                Verification Progress
              </span>
              <span className="font-semibold text-ocean-600">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="w-full h-3 bg-ocean-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-ocean-500 to-energy-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Verification Steps */}
          <div className="space-y-4">
            {verificationSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 transition-all",
                    step.status === "completed"
                      ? "border-green-200 bg-green-50/60"
                      : step.status === "pending"
                      ? "border-orange-200 bg-orange-50/60"
                      : "border-blue-200 bg-blue-50/60"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      step.status === "completed"
                        ? "bg-green-100"
                        : step.status === "pending"
                        ? "bg-orange-100"
                        : "bg-blue-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        step.status === "completed"
                          ? "text-green-600"
                          : step.status === "pending"
                          ? "text-orange-600"
                          : "text-blue-600"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-ocean-700">
                        {step.label}
                      </h3>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium border",
                          getStatusColor(step.status)
                        )}
                      >
                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-ocean-200/30">
            <Link to="/profile/kyc">
              <Button className="w-full gap-2">
                Complete Verification
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
