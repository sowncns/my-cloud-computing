import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cloud, Upload, Lock, Share2, Zap } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cloud className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">DataStore Cloud</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button onClick={() => navigate("/register")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Cloud className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your Files, Anywhere,{" "}
            <span className="text-primary">Anytime</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Securely store, share, and access your files from any device. DataStore Cloud makes file management simple and powerful.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/register")}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-lg border">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Easy Upload</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop files or folders to upload instantly
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Secure Storage</h3>
            <p className="text-sm text-muted-foreground">
              Your files are encrypted and protected with enterprise-grade security
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
              <Share2 className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold mb-2">Smart Sharing</h3>
            <p className="text-sm text-muted-foreground">
              Share files and folders with anyone, anywhere, with custom permissions
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-warning" />
            </div>
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Access your files instantly with our optimized cloud infrastructure
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 DataStore Cloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
