import { Mail, Users } from "lucide-react";
import { getNewsletterSubscribers } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await getNewsletterSubscribers();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Email addresses submitted through the storefront newsletter form.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
          <p className="text-xs text-gray-500">Subscribers</p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-16 text-center">
          <Mail className="mb-4 h-12 w-12 text-gray-300" />
          <p className="font-medium text-gray-700">No newsletter subscribers yet</p>
          <p className="mt-1 text-sm text-gray-400">
            New subscribers will appear here after they submit the newsletter form.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subscribed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.email}>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`mailto:${subscriber.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {subscriber.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(subscriber.subscribedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
