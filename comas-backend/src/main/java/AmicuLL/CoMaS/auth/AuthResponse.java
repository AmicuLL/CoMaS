package AmicuLL.CoMaS.auth;

import AmicuLL.CoMaS.user.Role;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private Role role;
    private String firstname, lastName, email, phoneNumber, username, avatar, access_token, refresh_token, id;
    public AuthResponse(String access_token, String refresh_token, String firstname, String lastName, String email, String phoneNumber, String avatar){
        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.firstname = firstname;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.avatar = avatar;

    }
    public AuthResponse(Role role, String firstname, String lastName, String email, String phoneNumber, String username, String avatar, String id, String access_token, String refresh_token) {
        this.role = role;
        this.firstname = firstname;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.username = username;
        this.avatar = avatar;
        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.id = id;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getFirstName() {
        return firstname;
    }

    public void setFirstName(String firstname) {
        this.firstname = firstname;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAccess_token() {
        return access_token;
    }

    public void setAccess_token(String access_token) {
        this.access_token = access_token;
    }

    public String getRefresh_token() {
        return refresh_token;
    }

    public void setRefresh_token(String refresh_token) {
        this.refresh_token = refresh_token;
    }
}
