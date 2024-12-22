import { DashboardLayout } from "@/components/DashboardLayout";

const TermsOfService = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <p>
            These Terms of Service govern your access to and use of our services.
          </p>
          
          <h2>Your Account</h2>
          <p>
            When you create an account with us, you must provide accurate information. You are responsible for maintaining the security of your account.
          </p>
          
          <h2>Use of Services</h2>
          <p>
            Our services allow you to post content to social media platforms. You are responsible for:
          </p>
          <ul>
            <li>Content you post through our service</li>
            <li>Compliance with applicable laws and regulations</li>
            <li>Maintaining necessary permissions and rights</li>
          </ul>
          
          <h2>Changes to Terms</h2>
          <p>
            We may modify these terms at any time. We will notify you of any material changes.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TermsOfService;