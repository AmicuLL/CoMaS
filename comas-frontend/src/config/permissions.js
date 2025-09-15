export function hasPermission(perm, list) {
  if (Array.isArray(perm)) {
    return perm.some((p) => list.includes(p));
  }
  return list.includes(perm);
}

export const userViewPermissionsList = [
  "user:view", //master permission for viewing(get method backend). If has this, includes the below ones 0
  "user:viewUsername", //can see the username 1
  "user:viewPassword", //can see the password_hash. Idk why i  though about this... 2
  "user:viewEmail", //can see the email 3
  "user:viewAvatar", //can see the avatar links 4
  "user:viewRole", //can see the role 5
  "user:viewPermissions", //can see permissions 6
  "user:viewCreationDate", //can see registration date 7
  "user:viewUserType", //can see account type [client, employee] 8
  "user:viewLinkAccount", //can see the id of account linked [i.e: Employee with id 6: UserType: Employee|Link account 6] 9
];
export const userEditPermissionsList = [
  "user:edit", //can edit all
  "user:editUsername", //same as above, but let you edit (put method)
  "user:editPassword", //...prev.replace("view", "edit")
  "user:editEmail",
  "user:editAvatar",
  "user:editRole",
  "user:editPermissions",
  "user:editUserType",
  "user:editLinkAccount",
];

export const employeeViewPermissionsList = [
  "employee:view", //0
  "employee:viewEmail", //1
  "employee:viewPhone", //2
  "employee:viewName", //3
  "employee:viewPosition", //4
  "employee:viewHireDate", //5
  "employee:viewDepartmentId", //6
  "employee:viewEUUID", //7
  "employee:viewWorkHours", //8
  "employee:viewBreak", //9
];

export const employeeEditPermissionsList = [
  "employee:edit", //0
  "employee:editEmail", //1
  "employee:editPhone", //2
  "employee:editName", //3
  "employee:editPosition", //4
  "employee:editHireDate", //5
  "employee:editDepartmentId", //6
  "employee:editEUUID", //7
  "employee:editWorkHours", //8
  "employee:editBreak", //9
];

export const employeeDeletePermissionsList = ["employee:delete"];

export const userDeletePermissionList = ["user:delete"];

export const timeSheetsPermissionsList = [
  "timesheets:view", //this perm grants access to see all employees timesheets
  "timesheets:edit", //this perm let edit/create a timesheet
  "timesheets:delete", //can delete
];

export const inventoryPermissionsList = [
  "inventory:edit",
  "inventory:add",
  "inventory:delete",
];

export const projectsPermissionsList = [
  "projects:add",
  "projects:edit",
  "projects:delete",
  "projects:view",
];

export const tasksPermissionsList = [
  "task:view",
  "task:edit",
  "task:delete",
  "task:add",
];

//TODO Seful de echipa sa poata accesa pontajul echipei lui. Are drepturi cica
