import UserManagementContainer from "@/components/admin/user/UserManagement"


export default function UserManagement() {
 

  return (
    <>
     {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <UserManagementContainer/>
        </main>
    </>
  )
}