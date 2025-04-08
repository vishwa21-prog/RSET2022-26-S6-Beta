import IssueCard from "../components/IssueCard";

const issues = [
  { id: 1, title: "Pothole on Main Street", description: "Large pothole causing traffic issues.", status: "Open", location: "Main Street, NY" },
  { id: 2, title: "Broken Streetlight", description: "Streetlight not working for a week.", status: "In Progress", location: "5th Avenue, CA" },
  { id: 3, title: "Overflowing Garbage Bin", description: "Garbage bin has not been cleared.", status: "Resolved", location: "Maple Road, TX" },
];

export default function IssueList() {
  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800">Reported Issues</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {issues.map(issue => (
          <div key={issue.id} className="p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
            <IssueCard {...issue} />
          </div>
        ))}
      </div>
    </div>
  );
}
