import { getContactMessages } from "@/lib/server-data";
import { MessageSquare, Mail, Phone, Clock, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-gray-100 text-gray-600",
  replied: "bg-green-100 text-green-700",
};

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();

  const newCount = messages.filter((m) => m.status === "new").length;
  const readCount = messages.filter((m) => m.status === "read").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Messages submitted via the contact form</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "New", value: newCount, icon: Inbox, color: "text-blue-600 bg-blue-50" },
          { label: "Read", value: readCount, icon: MessageSquare, color: "text-gray-600 bg-gray-50" },
          { label: "Replied", value: repliedCount, icon: Mail, color: "text-green-600 bg-green-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Messages list */}
      {messages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 flex flex-col items-center text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No messages yet</p>
          <p className="text-sm text-gray-400 mt-1">Messages from the contact form will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white border rounded-xl p-5 ${msg.status === "new" ? "border-blue-200" : "border-gray-200"}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 font-semibold text-gray-600 text-sm">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{msg.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLES[msg.status]}`}>
                        {msg.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <a href={`mailto:${msg.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Mail className="h-3 w-3" />
                        {msg.email}
                      </a>
                      {msg.phone && (
                        <a href={`tel:${msg.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:underline">
                          <Phone className="h-3 w-3" />
                          {msg.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <Clock className="h-3 w-3" />
                  {timeAgo(msg.createdAt)}
                </div>
              </div>
              {msg.message && (
                <div className="mt-3 pl-13 ml-13">
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3 leading-relaxed ml-13">
                    {msg.message}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
