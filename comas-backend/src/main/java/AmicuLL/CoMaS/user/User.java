package AmicuLL.CoMaS.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name="\"user\"")
public class User implements UserDetails {
    @Id
    @SequenceGenerator(
            name = "user_sequence",
            sequenceName = "user_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "user_sequence"
    )
    private Long id;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(nullable = false)
    private String password_hash;
    private String avatar;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_permissions", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permission")
    private Set<Permission> permissions = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserType userType = UserType.USER;

    private Long userRefId;
    private LocalDateTime creation_date = LocalDateTime.now();

    @Column(name = "last_credentials_change")
    private Date lastCredentialsChange;
//    @ElementCollection(fetch = FetchType.EAGER)
//    @CollectionTable(name = "user_changes", joinColumns = @JoinColumn(name = "user_id"))
//    @Enumerated(EnumType.STRING)
//    @Column(name = "notifications")
//    private Set<String> userChanges = new HashSet<>();
//    @Column(name = "change_at")
//    private LocalDate changedAt;

    public User(String username, String password_hash, String avatar, String email){
        this.username = username;
        this.password_hash = password_hash;
        this.avatar = avatar;
        this.email = email;
    }

    public User() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        //return role.getAuthorities();
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        authorities.addAll(role.getAuthorities());
        authorities.addAll(
                permissions.stream()
                        .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                        .collect(Collectors.toSet())
        );
        return authorities;
    }

    @Override
    public String getPassword() {
        return password_hash;
    }

    public String getUsername() {
        return username.toLowerCase();
    }

    public String getDBUsername() { return username; }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword_hash() {
        return password_hash;
    }

    public void setPassword_hash(String password_hash) {
        this.password_hash = password_hash;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreation_date() {
        return creation_date;
    }

    public void setCreation_date(LocalDateTime creation_date) {
        this.creation_date = creation_date;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }

    public Long getUserRefId() {
        return userRefId;
    }

    public void setUserRefId(Long userRefId) {
        this.userRefId = userRefId;
    }

    public Date getLastCredentialsChange() {
        return lastCredentialsChange;
    }

    public void setLastCredentialsChange(Date lastCredentialsChange) {
        this.lastCredentialsChange = lastCredentialsChange;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", password_hash='" + password_hash + '\'' +
                ", avatar='" + avatar + '\'' +
                ", email='" + email + '\'' +
                ", creation_date=" + creation_date +
                '}';
    }
}
