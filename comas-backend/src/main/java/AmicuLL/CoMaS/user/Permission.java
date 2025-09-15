package AmicuLL.CoMaS.user;

import java.util.EnumSet;
import java.util.Set;

public enum Permission {
    //USER RELATED
    USER_VIEW("user:view"), USER_VIEWPASSWORD("user:viewPassword"), USER_VIEWROLE("user:viewRole"), USER_VIEWPERM("user:viewPermissions"),
    USER_VIEWAVATAR("user:viewAvatar"), USER_VIEWUSERTYPE("user:viewUserType"), USER_VIEWREFID("user:viewLinkAccount"), USER_VIEWEMAIL("user:viewEmail"),
    USER_VIEWUSERNAME("user:viewUsername"), USER_VIEWCREATIONAT("user:viewCreationDate"),
    USER_EDIT("user:edit"), USER_EDITPASSWORD("user:editPassword"), USER_EDITROLE("user:editRole"), USER_EDITPERM("user:editPermissions"), USER_EDITAVATAR("user:editAvatar"),
    USER_EDITUSERTYPE("user:editUserType"), USER_EDITREFID("user:editLinkAccount"), USER_EDITEMAIL("user:editEmail"), USER_EDITUSERNAME("user:editUsername"),
    USER_DELETE("user:delete"),

    //EMPLOYEE RELATED
    EMPLOYEE_VIEW("employee:view"),EMPLOYEE_VIEWEMAIL("employee:viewEmail"), EMPLOYEE_VIEWPHONE("employee:viewPhone"), EMPLOYEE_VIEWNAME("employee:viewName"),
    EMPLOYEE_VIEWPOSITION("employee:viewPosition"), EMPLOYEE_VIEWHIREDATE("employee:viewHireDate"), EMPLOYEE_VIEWDEPARTMENTID("employee:viewDepartmentId"),
    EMPLOYEE_VIEWUUID("employee:viewEUUID"), EMPLOYEE_VIEWWORKHOURS("employee:viewWorkHours"), EMPLOYEE_VIEWBREAK("employee:viewBreak"),
    EMPLOYEE_EDIT("employee:edit"),EMPLOYEE_EDITEMAIL("employee:editEmail"), EMPLOYEE_EDITPHONE("employee:editPhone"), EMPLOYEE_EDITNAME("employee:editName"),
    EMPLOYEE_EDITPOSITION("employee:editPosition"), EMPLOYEE_EDITHIREDATE("employee:editHireDate"), EMPLOYEE_EDITDEPARTMENTID("employee:editDepartmentId"),
    EMPLOYEE_EDITUUID("employee:editEUUID"), EMPLOYEE_EDITWORKHOURS("employee:editWorkHours"), EMPLOYEE_EDITBREAK("employee:editBreak"),
    EMPLOYEE_DELETE("employee:delete"),


    TIMESHEETS_VIEW("timesheets:view"), TIMESHEETS_EDIT("timesheets:edit"), TIMESHEETS_DELETE("timesheets:delete"),

    TASK_VIEW("task:view"), TASK_ADD("task:add"),TASK_EDIT("task:edit"), TASK_DELETE("task:delete"),

    PROJECTS_VIEW("projects:view"), PROJECTS_ADD("projects:add"), PROJECTS_EDIT("projects:edit"), PROJECTS_DELETE("projects:delete"),

    INVENTORY_VIEW("inventory:view"), INVENTORY_ADD("inventory:add"), INVENTORY_EDIT("inventory:edit"), INVENTORY_DELETE("inventory:delete"),

    CLIENT_EDIT("client:edit"), CLIENT_DELETE("client:delete");

    private final String permission;

    Permission(String permission) {
        this.permission = permission;
    }
    public static final Set<Permission> ALL = EnumSet.allOf(Permission.class);

    public static final Set<Permission> VIEW_USER = EnumSet.of(
            USER_VIEW,
            USER_VIEWPASSWORD,
            USER_VIEWROLE,
            USER_VIEWPERM,
            USER_VIEWAVATAR,
            USER_VIEWUSERTYPE,
            USER_VIEWREFID,
            USER_VIEWEMAIL,
            USER_VIEWUSERNAME,
            USER_VIEWCREATIONAT
    );

    public static final Set<Permission> EDIT_USER = EnumSet.of(
            USER_EDIT,
            USER_EDITPASSWORD,
            USER_EDITROLE,
            USER_EDITPERM,
            USER_EDITAVATAR,
            USER_EDITUSERTYPE,
            USER_EDITREFID,
            USER_EDITEMAIL,
            USER_EDITUSERNAME
    );

    public static final Set<Permission> VIEW_EMPLOYEE = EnumSet.of(
            EMPLOYEE_VIEW,
            EMPLOYEE_VIEWEMAIL,
            EMPLOYEE_VIEWPHONE,
            EMPLOYEE_VIEWNAME,
            EMPLOYEE_VIEWPOSITION,
            EMPLOYEE_VIEWHIREDATE,
            EMPLOYEE_VIEWDEPARTMENTID,
            EMPLOYEE_VIEWUUID,
            EMPLOYEE_VIEWWORKHOURS,
            EMPLOYEE_VIEWBREAK
    );

    public static final Set<Permission> EDIT_EMPLOYEE = EnumSet.of(
            EMPLOYEE_EDIT,
            EMPLOYEE_EDITEMAIL,
            EMPLOYEE_EDITPHONE,
            EMPLOYEE_EDITNAME,
            EMPLOYEE_EDITPOSITION,
            EMPLOYEE_EDITHIREDATE,
            EMPLOYEE_EDITDEPARTMENTID,
            EMPLOYEE_EDITUUID,
            EMPLOYEE_EDITWORKHOURS,
            EMPLOYEE_EDITBREAK
    );
    public String getPermission() {
        return permission;
    }
}
