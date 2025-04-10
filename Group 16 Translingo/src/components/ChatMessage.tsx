type ChatMessageProps = {
    message: string;
    isCurrentUser: boolean;
    timestamp: string;
};

export const ChatMessage = ({ message, isCurrentUser, timestamp }: ChatMessageProps) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
            marginBottom: '10px'
        }}>
            <div style={{
                backgroundColor: isCurrentUser ? '#0084ff' : '#3a3a3a',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '15px',
                maxWidth: '70%',
                wordBreak: 'break-word'
            }}>
                <div>{message}</div>
                <div style={{
                    fontSize: '0.7em',
                    opacity: 0.7,
                    marginTop: '5px'
                }}>
                    {new Date(timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

// Add this debug function to test message history
const verifyMessageHistory = async () => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*');
        
        if (error) {
            console.error("Database error:", error);
            // Check if it's an authentication error
            if (error.code === 'PGRST301') {
                console.log("Authentication failed");
            }
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
};

// Add this health check
const checkRealtimeConnection = () => {
    const status = supabase.realtime.status;
    console.log("Realtime connection status:", status);
    
    supabase.realtime.onOpen(() => {
        console.log("Realtime connection established");
    });

    supabase.realtime.onError((error) => {
        console.error("Realtime connection error:", error);
    });
}; 