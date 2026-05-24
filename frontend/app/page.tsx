import Link from "next/link";

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">Abbey Peer Network</h1>
      <p className="text-gray-600 mb-8">
        A simple peer network demo for the assessment.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/auth/login"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Log in
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 border border-gray-300 rounded"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
