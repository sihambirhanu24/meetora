import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-primary-900 mb-6">
          Welcome to Meetora
        </h1>
        <p className="text-xl text-primary-700 mb-8">
          Professional video conferencing and communication platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/sign-in"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-colors font-medium border-2 border-primary-600"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
