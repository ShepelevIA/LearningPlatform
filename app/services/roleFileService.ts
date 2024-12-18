const RoleFileService: Record<string, Record<string, string[]>> = {
    users: {
      admin: ['view-all', 'view', 'create', 'update', 'delete'],
    },
    assignments: {
      admin: ['view-all', 'view', 'create', 'update', 'delete'],
      teacher: ['view', 'view-students', 'create', 'update-own', 'delete-own'],
      student: ['view', 'create', 'update-own', 'delete-own'],
    },
  }
  
  export default RoleFileService