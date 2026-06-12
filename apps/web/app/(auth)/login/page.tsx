const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function LoginPage() {
  return (
    <main>
      <h1>Selena&apos;s Chase</h1>
      <a href={`${API}/api/auth/google`}>Sign in with Google</a>
    </main>
  );
}
