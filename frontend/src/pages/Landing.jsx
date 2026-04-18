import React from "react";
import { MdApproval, MdDescription, MdManageHistory, MdSecurity } from "react-icons/md";
import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "Track Every Document",
    description:
      "Monitor document lifecycle from submission to final decision with complete visibility.",
    icon: MdDescription,
  },
  {
    title: "Structured Workflow",
    description:
      "Route documents through review stages with clear ownership and accountability.",
    icon: MdApproval,
  },
  {
    title: "Audit-Ready History",
    description:
      "Maintain action logs for forwards, approvals, and rejections for compliance reporting.",
    icon: MdManageHistory,
  },
  {
    title: "Secure Access",
    description:
      "Role-based access ensures employees, managers, and admins see only what they should.",
    icon: MdSecurity,
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-cream text-darkest">
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-sage/15 text-sage px-3 py-1 rounded-full text-xs font-medium mb-4">
              Document Tracking System
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Manage, Review, and Track Documents with Confidence
            </h1>
            <p className="text-sage text-base md:text-lg max-w-xl mb-8">
              Centralize document operations with role-based workflows, real-time status updates,
              and complete movement history across departments.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="bg-dark text-cream px-6 py-3 rounded-md text-sm font-medium hover:bg-darkest text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border border-sage text-sage px-6 py-3 rounded-md text-sm font-medium hover:bg-sage hover:text-cream text-center"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sage/20 to-dark/10 border border-sage/30 rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article key={feature.title} className="bg-cream border border-sage/20 rounded-xl p-4">
                    <Icon className="text-2xl text-sage mb-2" />
                    <h2 className="text-darkest font-semibold text-sm mb-1">{feature.title}</h2>
                    <p className="text-sage text-xs leading-relaxed">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
