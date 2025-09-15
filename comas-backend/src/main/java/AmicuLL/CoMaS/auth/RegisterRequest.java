package AmicuLL.CoMaS.auth;

public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String regKey;
    private boolean isClient;
    private String companyName;

    private String avatar;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) { this.username = username; }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRegKey() {
        return regKey;
    }

    public void setRegKey(String regKey) {
        this.regKey = regKey;
    }

    public boolean isClient() { return isClient; }

    public void setClient(boolean client) {
        isClient = client;
    }

    public String getCompanyName() { return companyName; }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getAvatar() { return avatar; }
}