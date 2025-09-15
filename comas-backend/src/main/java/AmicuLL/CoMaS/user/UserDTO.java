package AmicuLL.CoMaS.user;

import java.util.List;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private List<String> permissions;
    private String avatar;
    private String createdAt;
    private String password_hash;
    private String userType;
    private Long userRefId;

    public UserDTO(Long id, String username, String email, String role, List<String> permissions, String avatar, String createdAt, String password_hash, String userType, Long userRefId) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.permissions = permissions;
        this.avatar = avatar;
        this.createdAt = createdAt;
        this.password_hash = password_hash;
        this.userType = userType;
        this.userRefId = userRefId;
    }

    public UserDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getPassword_hash() {
        return password_hash;
    }

    public void setPassword_hash(String password_hash) {
        this.password_hash = password_hash;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public Long getUserRefId() {
        return userRefId;
    }

    public void setUserRefId(Long userRefId) {
        this.userRefId = userRefId;
    }
}

