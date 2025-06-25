import { getCsrfToken } from "next-auth/react";

export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

export default function SignIn({ csrfToken }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold">Please Sign In</h1>
      <form method="POST" action="/api/auth/callback/credentials">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <div>
          <input
            name="email"
            placeholder="Email"
            required
            className="border rounded p-2 mt-2 w-64"
            type="email"
          />
        </div>
        <div>
          <input
            name="password"
            placeholder="Password"
            required
            className="border rounded p-2 mt-2 w-64"
            type="password"
          />
        </div>
        <button
          className="bg-blue-600 text-white rounded p-2 mt-4 w-64"
          type="submit"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
