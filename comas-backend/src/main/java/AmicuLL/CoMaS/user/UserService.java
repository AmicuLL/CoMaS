package AmicuLL.CoMaS.user;
import AmicuLL.CoMaS.client.Client;
import AmicuLL.CoMaS.client.ClientRepository;
import AmicuLL.CoMaS.employee.Employee;
import AmicuLL.CoMaS.employee.EmployeeRepository;
import AmicuLL.CoMaS.notification.Notification;
import AmicuLL.CoMaS.notification.NotificationRepository;
import AmicuLL.CoMaS.notification.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ClientRepository clientRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final Pattern passwordRegex = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!$&+,:;=?@#|'<>.^*()%!-]).{6,}$");

    public UserService(UserRepository userRepository, EmployeeRepository employeeRepository, ClientRepository clientRepository, NotificationRepository notificationRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.clientRepository = clientRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public User getAuthUser(Long id) {
        return userRepository.findUserById(id).get();
    }

    public User getUser(String email) {return userRepository.findUserByEmail(email).orElseThrow();}

    public void addNewUser(User user) {
        Optional<User> userOptional = userRepository.findUserByEmail(user.getEmail());
        if(userOptional.isPresent()) {
            throw new IllegalStateException("Email taken");
        }
        userOptional = userRepository.findUserByUsername(user.getUsername());
        if(userOptional.isPresent()) {
            throw new IllegalStateException("Username taken");
        }
        userRepository.save(user);
    }
    public ResponseEntity<?> forgotPassword(String username, String euuid, String contactPerson, String new_password, String confirm_password, boolean isClient) {
        if(username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Username is required.\"}");
        }
        if(!isClient && (euuid == null || euuid.isBlank())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Employee universally unique identifier is required.\"}");
        }
        if(isClient && (contactPerson == null || contactPerson.isBlank())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Company name is required.\"}");
        }
        if(new_password == null || new_password.isBlank() || confirm_password == null || confirm_password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Password is required.\"}");
        }
        if(!new_password.equals(confirm_password) || !passwordRegex.matcher(new_password).matches()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Passwords don't match or requirements are not met.\"}");
        }
        Optional<User> optionalUser;
        User user;
        if(isClient) {
            Optional<Client> client = clientRepository.findClientByContactPerson(contactPerson);
            if(client.isEmpty()) return ResponseEntity.status(HttpStatus.NO_CONTENT).body("{\"message\":\"Client not found.\"}");
            optionalUser = userRepository.findUserByUserRefIdAndUserType(client.get().getId(), UserType.CLIENT);
        } else {
            Optional<Employee> employee = employeeRepository.findEmployeeByEUUID(euuid);
            if(employee.isEmpty()) return ResponseEntity.status(HttpStatus.NO_CONTENT).body("{\"message\":\"Employee not found.\"}");
            optionalUser = userRepository.findUserByUserRefIdAndUserType(employee.get().getId(), UserType.EMPLOYEE);
        }
        if(optionalUser.isEmpty()) return ResponseEntity.status(HttpStatus.NO_CONTENT).body("{\"message\":\"User not found.\"}");
        else user = optionalUser.get();

        user.setPassword_hash(passwordEncoder.encode(new_password));
        user.setLastCredentialsChange(new Date());
        userRepository.save(user);

        Notification notification = new Notification(user.getId(), null, NotificationType.ACTION_RECEIVED, "Password changed: System", LocalDateTime.now().withNano(0),null);
        notificationRepository.save(notification);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
    public ResponseEntity<String> changeUserDetails(String current_password, String new_password, String confirm_password, String username, String email, String avatar, Principal connectedUser) {
        var user = (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal();
        if(current_password!= null && new_password != null && confirm_password != null) {
            if (!passwordEncoder.matches(current_password, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Wrong password.\"}");
            }
            if (!new_password.equals(confirm_password)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"Passwords are not the same.\"}");
            }

            user.setPassword_hash(passwordEncoder.encode(new_password));
            user.setLastCredentialsChange(new Date());
            userRepository.save(user);
            Notification notification = new Notification(user.getId(), 1L, NotificationType.ACTION_RECEIVED, "", LocalDateTime.now().withNano(0),null);
            return ResponseEntity.ok().body("{\n\t\"message\": \"Password changed. Reauthenticate is mandatory.\"\n}");
        } else if (username != null && email != null && avatar != null) {
            String message = "\"message\": \"";
            String api_mesage = "\"api\": \"";
            String error = "";
            boolean usernameChanged = false;
            boolean emailChanged = false;
            boolean avatarChanged = false;
            if(!user.getUsername().equals(username.toLowerCase()) && username.matches("^[a-zA-Z0-9._-]{3,20}$")) {
                usernameChanged = true;
                message += "Username Changed. ";
                api_mesage += "[username],";
                user.setUsername(username);
                user.setLastCredentialsChange(new Date()); //force relogin with new username
            } else if (!user.getUsername().equals(username.toLowerCase())){
                error += "Wrong_Username,";
            }
            if(!user.getEmail().equalsIgnoreCase(email.toLowerCase()) && email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
                emailChanged = true;
                message += "Email Changed. ";
                api_mesage += "[email],";
                user.setEmail(email);
            } else if(!user.getEmail().equalsIgnoreCase(email.toLowerCase())){
                error += "Wrong_Email";
            }
            if(!user.getAvatar().equals(avatar)) {
                avatarChanged = true;
                message += " Avatar Changed.";
                api_mesage += "[avatar]";
                user.setAvatar(avatar);
            }
            if(!error.isBlank() && error.split(",").length == 1) {
                error = "\"error\": \"" + error.split(",")[0] + "\"";
            } else {
                error = "\"error\": \"" + error + "\"";
            }
            String response = "{" + message + "\"," + api_mesage +"\"," + error + "}";
            if(!usernameChanged && !emailChanged && !avatarChanged) return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();

            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } else return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\": \"God knows what you tried to do.\"}");
    }
}
