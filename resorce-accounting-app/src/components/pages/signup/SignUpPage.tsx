import React, { useState } from "react";
import { signUp } from "../../../api/signup";
import { useNavigate, Link } from "react-router-dom";

import { FaGithub, FaLinkedin, FaTwitter, FaGoogle } from "react-icons/fa";

const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const data = await signUp(email, password);

      localStorage.setItem("token", data.accessToken);

      navigate("/home");
    } catch {
      setError("Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden">

        {/* 🔵 BRAND GRADIENT (BLUE + PURPLE) */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600" />

        {/* glowing shapes */}
        <div className="absolute w-96 h-96 bg-blue-400/40 rounded-full blur-3xl top-20 left-10" />
        <div className="absolute w-96 h-96 bg-purple-400/40 rounded-full blur-3xl bottom-10 right-10" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">

          {/* BRAND */}
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              MyApp
            </h1>

            <p className="mt-4 text-white/80 text-lg max-w-md leading-relaxed">
              Resource analytics platform for modern organizations.
              Simple. Fast. Powerful.
            </p>
          </div>

          {/* FEATURES */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">📊 Analytics</h3>
              <p className="text-white/80 text-sm">
                Track and understand your resources in real time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg">⚡ Performance</h3>
              <p className="text-white/80 text-sm">
                Fast insights for better decisions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg">🔐 Secure</h3>
              <p className="text-white/80 text-sm">
                Role-based access for your organization.
              </p>
            </div>
          </div>

          {/* SOCIAL ICONS */}
          <div className="flex gap-5 text-white/80 text-xl">
            <a href="#" className="hover:text-white transition">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-white transition">
              <FaLinkedin />
            </a>
            <a href="#" className="hover:text-white transition">
              <FaGithub />
            </a>
            <a href="#" className="hover:text-white transition">
              <FaGoogle />
            </a>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white p-6">

        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-600">
              Create account
            </h2>
            <p className="text-gray-500 mt-2">
              Start managing your organization
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              className="w-full px-4 py-3 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full px-4 py-3 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition shadow-md"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-blue-500 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};
