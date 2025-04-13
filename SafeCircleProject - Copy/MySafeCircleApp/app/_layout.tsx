import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <Stack>
      {/* Index (Home) Screen */}
      <Stack.Screen
        name="index" // Corresponds to app/index.tsx
        options={{
          title: "SafeCircle", // Custom title for the screen
          headerShown: false, // Hide the header for this screen
        }}
      />

      {/* Login Screen */}
      <Stack.Screen
        name="login" // Corresponds to app/login.tsx
        options={{
          title: "Login", // Custom title for the screen
          headerShown: true, // Show the header for this screen
        }}
      />
    </Stack>
  );
}