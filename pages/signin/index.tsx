
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/component';
import { Icon } from '@iconify/react';
import { Layout } from "@/components/layout"

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (event:any) => {
    event.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      router.push('/Dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.protocol}//${window.location.host}/Dashboard`
      },
    });
    if (error) alert(error.message);
  };

  return (
    
      <Layout>
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Sign in to your account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">to continue to FinSeva</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg dark:bg-zinc-700 dark:text-white focus:ring focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <div className="relative">
              <input
                type={isVisible ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-700 dark:text-white focus:ring focus:ring-blue-300"
              />
              <button type="button" onClick={toggleVisibility} className="absolute inset-y-0 right-3 flex items-center">
                <Icon icon={isVisible ? 'solar:eye-closed-linear' : 'solar:eye-bold'} className="text-zinc-500 dark:text-zinc-300" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input type="checkbox" className="w-4 h-4" /> <span>Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
          </div>
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Sign In</button>
        </form>
        <div className="flex items-center justify-between">
          <hr className="w-full border-zinc-300 dark:border-zinc-600" />
          <span className="px-2 text-sm text-zinc-500 dark:text-zinc-400">OR</span>
          <hr className="w-full border-zinc-300 dark:border-zinc-600" />
        </div>
        <button onClick={handleGoogleLogin} className="flex items-center justify-center w-full px-4 py-2 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700">
          <Icon icon="flat-color-icons:google" width={24} className="mr-2" /> Continue with Google
        </button>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Need to create an account? <a href="signup" className="text-blue-500 hover:underline">Sign Up</a>
        </p>
      </div>
    </Layout>
  );
}
