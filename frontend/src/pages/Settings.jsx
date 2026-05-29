export default function Settings() {
  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Account Settings</h3>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white mb-2">
            Change Password
          </button>
          <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white">
            Delete Account
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Privacy & Safety</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span>Make my channel private</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span>Allow comments on my videos</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
