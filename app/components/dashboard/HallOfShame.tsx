const failedTests = [
  "QUnit Integration Tests, Chrome 22 (Java 6)",
  "Selenium, Firefox 3.6, Documentation Theme (Java 6)",
  "Selenium, Firefox 3.6",
  "WebDriver Chrome",
  "QUnit Firefox 17.0.1 (PT)",
  "Selenium Tests (Java 6) OD À la carte",
];

export function HallOfShame() {
  return (
    <div className="bg-black rounded-sm p-4">
      <h2 className="text-lg font-bold mb-4 text-zinc-200">HALL OF SHAME</h2>
      <div className="space-y-2">
        {failedTests.map((test, index) => (
          <div
            key={index}
            className="bg-red-950 text-red-400 p-2 rounded-sm text-sm"
          >
            {test}
          </div>
        ))}
      </div>
    </div>
  );
} 