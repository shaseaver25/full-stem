import { motion } from "framer-motion";
import PilotInterestForm from "@/components/PilotInterestForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet";

export default function PilotInterestPage() {
  return (
    <>
      <Helmet>
        <title>Join TailorEDU Pilot Program | Request Access</title>
        <meta name="description" content="Join the TailorEDU Pilot Program for personalized STEM education. Apply for Tech Together, AI Professional Development, Workforce Training, or Partnership opportunities." />
        <meta name="keywords" content="TailorEDU pilot, STEM education, AI professional development, teacher training, workforce development, educational technology" />
      </Helmet>
      
      <main className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
        {/* Header */}
        <div className="bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Join the TailorEDU <span className="text-primary">Pilot Program</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Be among the first to experience personalized, adaptive STEM education 
              powered by AI. Transform your classroom or workforce training program.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto"
          >
            <BenefitCard
              title="Early Access"
              description="Get exclusive access to cutting-edge adaptive learning technology"
            />
            <BenefitCard
              title="Dedicated Support"
              description="Work directly with our team for personalized implementation"
            />
            <BenefitCard
              title="Shape the Future"
              description="Your feedback directly influences product development"
            />
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <PilotInterestForm />
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12 text-muted-foreground"
          >
            <p className="mb-2">
              Questions? Email us at{" "}
              <a href="mailto:info@creatempls.org" className="text-primary hover:underline">
                info@creatempls.org
              </a>
            </p>
            <p className="text-sm">
              We typically respond within 2-3 business days
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}

interface BenefitCardProps {
  title: string;
  description: string;
}

function BenefitCard({ title, description }: BenefitCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
