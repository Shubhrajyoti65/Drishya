export default function Profile() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex gap-6">
          <img
            src="https://via.placeholder.com/150"
            alt="Avatar"
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h3 className="text-xl font-bold">Username</h3>
            <p className="text-gray-400">user@example.com</p>
            <p className="text-gray-400 mt-2">0 Subscribers • 0 Videos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
