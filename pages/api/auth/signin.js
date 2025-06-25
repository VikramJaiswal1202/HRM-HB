export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl">Sign In</h1>
      <form method="POST" action="/api/auth/callback/credentials">
        <input
          name="email"
          placeholder="Email"
          className="border p-2 rounded"
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          className="border p-2 rounded"
        />
        <button
          className="bg-blue-600 text-white rounded p-2 mt-2"
          type="submit"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
