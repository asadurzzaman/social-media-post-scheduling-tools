import { LandingNav } from "@/components/LandingNav";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
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

        <section className="container py-12 md:py-24 lg:py-32">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h3 className="text-xl font-bold">Schedule Posts</h3>
              <p className="text-muted-foreground">
                Plan and schedule your content across multiple platforms with our intuitive calendar interface.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <h3 className="text-xl font-bold">Track Analytics</h3>
              <p className="text-muted-foreground">
                Get detailed insights into your social media performance with comprehensive analytics.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <h3 className="text-xl font-bold">Manage Media</h3>
              <p className="text-muted-foreground">
                Organize and manage your media assets in one centralized location.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}