import { LandingNav } from "@/components/LandingNav";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 space-y-8 md:space-y-12">
          <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Manage Your Social Media Presence
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Schedule posts, analyze engagement, and grow your audience across multiple platforms with our powerful social media management tool.
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Try Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-12 md:py-24 lg:py-32 bg-accent/5">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full p-4 bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
              </div>
              <h3 className="text-xl font-bold">Schedule Posts</h3>
              <p className="text-muted-foreground">
                Plan and schedule your content across multiple platforms with our intuitive calendar interface.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full p-4 bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
              </div>
              <h3 className="text-xl font-bold">Track Analytics</h3>
              <p className="text-muted-foreground">
                Get detailed insights into your social media performance with comprehensive analytics.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="rounded-full p-4 bg-primary/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
              </div>
              <h3 className="text-xl font-bold">Manage Media</h3>
              <p className="text-muted-foreground">
                Organize and manage your media assets in one centralized location.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container py-12 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SocialManager?</h2>
            <p className="text-muted-foreground">Streamline your social media workflow with our powerful features</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Time Saving</h3>
              <p className="text-sm text-muted-foreground">Schedule posts in advance and save hours of manual posting</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Better Engagement</h3>
              <p className="text-sm text-muted-foreground">Post at optimal times to maximize audience engagement</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Unified Dashboard</h3>
              <p className="text-sm text-muted-foreground">Manage all your social media accounts from one place</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Data-Driven Insights</h3>
              <p className="text-sm text-muted-foreground">Make informed decisions with detailed analytics</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-12 md:py-24 bg-primary text-primary-foreground">
          <div className="max-w-[64rem] mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Social Media Strategy?</h2>
            <p className="mb-8 text-primary-foreground/90">
              Join thousands of social media managers who trust SocialManager for their content management needs.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90"
            >
              Start Your Free Trial
            </Button>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container py-12 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground">Trusted by social media managers worldwide</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-6 rounded-lg border bg-card">
              <p className="text-muted-foreground mb-4">"SocialManager has revolutionized how we handle our social media presence. The scheduling features are incredible!"</p>
              <div className="font-semibold">Sarah Johnson</div>
              <div className="text-sm text-muted-foreground">Digital Marketing Manager</div>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <p className="text-muted-foreground mb-4">"The analytics tools have helped us understand our audience better and improve our engagement rates."</p>
              <div className="font-semibold">Michael Chen</div>
              <div className="text-sm text-muted-foreground">Social Media Strategist</div>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <p className="text-muted-foreground mb-4">"A game-changer for managing multiple social media accounts. The interface is intuitive and user-friendly."</p>
              <div className="font-semibold">Emma Davis</div>
              <div className="text-sm text-muted-foreground">Content Creator</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}