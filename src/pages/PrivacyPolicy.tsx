import { DashboardLayout } from "@/components/DashboardLayout";

const PrivacyPolicy = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <p>
            This Privacy Policy describes how we collect, use, and handle your information when you use our services.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            When you use our service, we collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>Account information (name, email)</li>
            <li>Social media account access tokens</li>
            <li>Content you create and post through our service</li>
          </ul>
          
          <h2>How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process and complete your social media posts</li>
            <li>Send you technical notices and updates</li>
          </ul>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrivacyPolicy;