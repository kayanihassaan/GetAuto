export default function Owners({ theme }) {
  const bg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const muted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  return (
    <div className={`${bg} min-h-screen`}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold ${textColor} mb-6`}>Owners Information</h1>

        <div className={`${cardBg} rounded-xl p-6 shadow-md space-y-6`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">HK</div>
            <div>
              <h2 className={`font-semibold ${textColor}`}>Hassaan Abdullah Kayani</h2>
              <p className={`text-sm ${muted}`}>23-ARID-896</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-white text-xl font-bold">QS</div>
            <div>
              <h2 className={`font-semibold ${textColor}`}>Qasim Shahid</h2>
              <p className={`text-sm ${muted}`}>23-ARID-946</p>
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-6 shadow-md mt-4`}>
          <h2 className={`font-semibold ${textColor} mb-2`}>Project Details</h2>
          <ul className={`space-y-2 ${textColor}`}>
            <li><span className={muted}>Degree:</span> BS Software Engineering</li>
            <li><span className={muted}>Subject:</span> Mobile Application Development</li>
            <li><span className={muted}>Version:</span> 1.0.0 (PWA)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
