import { useState, useEffect } from "react";
import { db, collection, query, orderBy, onSnapshot } from "../firebase"; // ✅ Use modular Firestore import

function ScreenTimeStats() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const logsRef = collection(db, "websiteLogs"); // ✅ Get reference to collection
    const logsQuery = query(logsRef, orderBy("timestamp", "desc")); // ✅ Query Firestore

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Website Visit Logs</h2>
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            {log.url} - {log.category} ({new Date(log.timestamp?.toDate()).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScreenTimeStats;
