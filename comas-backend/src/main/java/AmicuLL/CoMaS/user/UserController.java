package AmicuLL.CoMaS.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "api/v1/user")
public class UserController {
    private final UserService userService;
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    private UserDTO mapUserToDTO(User user, User authUser) {
        UserDTO dto = new UserDTO();

        List<String> perms = authUser.getPermissions().stream()
                .map(Permission::getPermission)
                .toList();

        dto.setId(user.getId());

        if (perms.contains("user:view") || perms.contains("user:viewUsername") || user.getId().equals(authUser.getId()))
            dto.setUsername(user.getDBUsername());
        else dto.setUsername(user.getDBUsername().substring(0,5) + "*".repeat(user.getDBUsername().length() - 5));

        if (perms.contains("user:view") || perms.contains("user:viewEmail"))
            dto.setEmail(user.getEmail());

        if (perms.contains("user:view") || perms.contains("user:viewRole"))
            dto.setRole(user.getRole().name());

        if (perms.contains("user:view") || perms.contains("user:viewPermissions"))
            dto.setPermissions(user.getPermissions().stream()
                    .map(Permission::getPermission)
                    .toList());

        if (perms.contains("user:view") || perms.contains("user:viewAvatar"))
            dto.setAvatar(user.getAvatar());

        if (perms.contains("user:view") || perms.contains("user:viewCreationDate"))
            dto.setCreatedAt(user.getCreation_date().toString());

        if(perms.contains("user:view") || perms.contains("user:viewPassword"))
            dto.setPassword_hash(user.getPassword_hash());

        if(perms.contains("user:view") || perms.contains("user:viewLinkAccount"))
            dto.setUserRefId(user.getUserRefId());

        if(perms.contains("user:view") || perms.contains("user:viewUserType"))
            dto.setUserType(user.getUserType().toString());

        return dto;
    }

    @GetMapping
    public List<UserDTO> getUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User authUser = (User) authentication.getPrincipal();

        return userService.getUsers().stream()
                .map(user -> mapUserToDTO(user, authUser))
                .toList();
    }
    @GetMapping(path = "/me")
    public User getAuthUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User authUser = (User) authentication.getPrincipal();

        return userService.getAuthUser(authUser.getId());
    }

    @PostMapping(path = "/add")
    public void registerNewUser(@RequestBody User user) {
        userService.addNewUser(user);
    }

    @PatchMapping
    public ResponseEntity<String> changeInfo(
            @RequestBody Map<String, String> body,
            Principal connectedUser
    ) {
        String current_password = body.get("current_password") != null ? body.get("current_password") : null;
        String new_password = body.get("new_password") != null ? body.get("new_password") : null;
        String confirm_password = body.get("confirm_password") != null ? body.get("confirm_password") : null;
        String username = body.get("username") != null ? body.get("username") : null;
        String email = body.get("email") != null ? body.get("email") : null;
        String avatar = body.get("avatar") != null ? body.get("avatar") : null;
        return userService.changeUserDetails(current_password, new_password, confirm_password, username, email, avatar, connectedUser);
    }

    @PatchMapping(path = "/forgot_password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String username = body.get("username") != null ? body.get("username") : null;
        String new_password = body.get("new_password") != null ? body.get("new_password") : null;
        String confirm_password = body.get("confirm_password") != null ? body.get("confirm_password") : null;
        String euuid = body.get("euuid") != null ? body.get("euuid") : null;
        String contactPerson = body.get("contact_person") != null ? body.get("contact_person") : null;
        boolean isClient = body.get("isClient") != null ? body.get("isClient").equals("true") : false;
        return userService.forgotPassword(username,euuid,contactPerson,new_password, confirm_password, isClient);
    }

}
