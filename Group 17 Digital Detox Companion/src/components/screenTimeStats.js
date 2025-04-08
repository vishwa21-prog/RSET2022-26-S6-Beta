import { useEffect, useState } from "react";
import { db } from "../firebase";  
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

function ScreenTimeStats() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const logsRef = collection(db, "websiteLogs");
        const logsQuery = query(logsRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
            const logData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || null, // ✅ Convert timestamp
            }));

            console.log("Fetched Logs:", logData);  // ✅ Check if logs are received
            setLogs(logData);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <h2>Website Visit Logs</h2>
            {logs.length === 0 ? (  
                <p>No data available</p>  // ✅ Display message if no data
            ) : (
                <ul>
                    {logs.map(log => (
                        <li key={log.id}>
                            {log.url} - {log.category} ({log.timestamp ? new Date(log.timestamp).toLocaleString() : "No timestamp"})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ScreenTimeStats;
