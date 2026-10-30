import { useAuth } from '../hooks/useAuth'

const RoleBasedExample = () => {
  const { 
    user, 
    username, 
    userRole, 
    canEditActs, 
    isAdmin, 
    isEditor
  } = useAuth()

  if (!user) {
    return (
      <div className="p-4 bg-white/10 rounded-lg">
        <p className="text-white">Please sign in to see role-based features.</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white/10 rounded-lg space-y-4">
      <h3 className="text-xl font-bold text-white">Role-Based Access Control Demo</h3>
      
      <div className="space-y-2">
        <p className="text-white/80">
          <span className="font-semibold">Username:</span> {username}
        </p>
        <p className="text-white/80">
          <span className="font-semibold">Role:</span> {userRole}
        </p>
        <p className="text-white/80">
          <span className="font-semibold">Can Edit Acts:</span> {canEditActs ? 'Yes' : 'No'}
        </p>
        <p className="text-white/80">
          <span className="font-semibold">Is Admin:</span> {isAdmin ? 'Yes' : 'No'}
        </p>
        <p className="text-white/80">
          <span className="font-semibold">Is Editor:</span> {isEditor ? 'Yes' : 'No'}
        </p>
      </div>

      {/* Example of role-based UI elements */}
      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-white">Available Actions:</h4>
        
        {canEditActs && (
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Edit Act Information
          </button>
        )}
        
        {isAdmin && (
          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors ml-2">
            Delete Act
          </button>
        )}
        
        {isEditor && !isAdmin && (
          <p className="text-yellow-300 text-sm">
            You can edit acts but cannot delete them.
          </p>
        )}
        
        {userRole === 'viewer' && (
          <p className="text-gray-300 text-sm">
            You can only view and rate acts.
          </p>
        )}
      </div>
    </div>
  )
}

export default RoleBasedExample
