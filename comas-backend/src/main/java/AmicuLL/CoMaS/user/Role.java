package AmicuLL.CoMaS.user;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public enum Role {
    SysOP(Permission.ALL),
    ADMIN(Set.of(Permission.INVENTORY_VIEW)), //Here you can put default permissions for roles. I'll leave it empty.

    EMPLOYEE(Set.of(Permission.INVENTORY_VIEW)),

    //Set.of() or Collections.emptySet() to declare an empty set
    WORKER(Set.of()), //Worker is used as creating new user, he's not an accepted employee until someone does

    CLIENT(Set.of()); // clients may don't have any permissions as they can see just their projects

    private final Set<Permission> permissions;

    Role(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public List<SimpleGrantedAuthority> getAuthorities() {
        var authorities = getPermissions()
                .stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toList());
        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
        return authorities;
    }
}
