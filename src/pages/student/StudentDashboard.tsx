export default function StudentDashboard() {
  console.log('[StudentDashboard] SIMPLIFIED TEST VERSION - Component mounting');
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Student Dashboard</h1>
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-2">✅ Success!</h2>
          <p className="text-lg mb-4">The StudentDashboard component is loading correctly.</p>
          <p className="text-muted-foreground">
            You are viewing this as a super_admin/developer. The full student dashboard 
            with profile data has been temporarily simplified for testing.
          </p>
          <div className="mt-6 p-4 bg-secondary rounded">
            <p className="font-medium">Next step:</p>
            <p className="text-sm">Once this loads, we'll restore the full dashboard functionality.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
