export default function IssueCard({ title, description, status, location, category, upvotes }) {
  return (
    <div className="p-4 border rounded-lg shadow-md bg-white w-full max-w-sm">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <p className="text-sm text-gray-500">Category: {category}</p>
      <p className="text-sm text-gray-500">Location: {location}</p>
      <p className="text-sm text-gray-700 font-semibold">Upvotes: {upvotes} 🔼</p>
      <p
        className={`text-sm font-semibold ${
          status === "Open" ? "text-red-500" : status === "In Progress" ? "text-yellow-500" : "text-green-500"
        }`}
      >
        Status: {status}
      </p>
    </div>
  );
}
