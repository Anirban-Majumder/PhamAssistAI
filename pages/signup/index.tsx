import { Layout } from "@/components/layout";
import { createClient } from "@/utils/supabase/component";
import { useRouter } from "next/router";
import { Icon } from '@iconify/react';
import React from "react";

const SignUp = () => {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = React.useState({ email: "", password: "" });
  const handleChange = (e:any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error) alert(error.message);
    else router.push("/Dashboard");
  };

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/Dashboard", // Make sure this is correct
      },
    });
    if (error) alert(error.message);
  };

  return (
    <Layout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 min-h-screen"> {/* Added min-h-screen */}
        <div className="inline-block max-w-lg text-center justify-center w-full"> {/* Added w-full */}
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white dark:bg-zinc-800 px-8 pb-10 pt-6 shadow-md dark:shadow-lg"> {/* Tailwind classes for styling */}
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  Welcome
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Create your FinSeva account
                </p>
              </div>

              <form className="flex flex-col gap-3 mt-4" onSubmit={handleSubmit}> {/* Added mt-4 for spacing */}
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm text-zinc-700 dark:text-zinc-300">Email Address</label>
                  <input
                    required
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="password" className="text-sm text-zinc-700 dark:text-zinc-300">Password</label>
                  <input
                    required
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="border border-zinc-300 dark:border-zinc-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center py-4">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mr-2 rounded dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-zinc-700 dark:text-zinc-300">
                    I agree with the&nbsp;
                    <a href="/terms" className="text-blue-500 hover:underline">
                      Terms
                    </a>
                    &nbsp; and&nbsp;
                    <a href="/privacypolicy" className="text-blue-500 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Sign Up
                </button>
              </form>

              <button
                onClick={handleGoogleSignIn}
                className="border border-blue-500 hover:bg-blue-500 hover:text-white text-blue-500 font-bold py-2 px-4 rounded flex items-center justify-center"
              >
               <Icon icon="flat-color-icons:google" width={24} />
                Sign Up with Google
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-600"></div>
                <p className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  OR
                </p>
                <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-600"></div>
              </div>

              <p className="text-center text-sm text-zinc-700 dark:text-zinc-300">
                Already have an account?&nbsp;
                <a href="/signin" className="text-blue-500 hover:underline">
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SignUp;

