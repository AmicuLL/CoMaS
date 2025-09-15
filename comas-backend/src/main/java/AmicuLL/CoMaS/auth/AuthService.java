package AmicuLL.CoMaS.auth;

import AmicuLL.CoMaS.client.Client;
import AmicuLL.CoMaS.client.ClientRepository;
import AmicuLL.CoMaS.config.JwtService;
import AmicuLL.CoMaS.employee.Employee;
import AmicuLL.CoMaS.employee.EmployeeRepository;
import AmicuLL.CoMaS.user.Role;
import AmicuLL.CoMaS.user.User;
import AmicuLL.CoMaS.user.UserRepository;
import AmicuLL.CoMaS.user.UserType;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthService {
    @Value("${isRegKeyRequired}")
    boolean isEmployeeRequired;
    private final Pattern passwordRegex = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!$&+,:;=?@#|'<>.^*()%!-]).{6,}$");
    private final Pattern emailRegex = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    private final Pattern phoneRegex = Pattern.compile("^\\+?\\d{1,4}?[\\s.-]?(\\(?\\d{1,4}\\)?[\\s.-]?)?\\d{1,4}[\\s.-]?\\d{1,4}[\\s.-]?\\d{1,9}$");
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ClientRepository clientRepository;
    @Autowired
    public AuthService(PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService, UserRepository userRepository, EmployeeRepository employeeRepository, ClientRepository clientRepository) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.clientRepository = clientRepository;
    }
    public ResponseEntity<Employee> checkEEUID(String euuid) {
        Optional<Employee> employeeOptional = employeeRepository.findEmployeeByEUUID(euuid);
        if (employeeOptional.isPresent()) {
            Optional<User> registeredUser = userRepository.findUserByUserRefIdAndUserType(employeeOptional.get().getId(), UserType.EMPLOYEE);
            if(registeredUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            return ResponseEntity.status(HttpStatus.OK).body(employeeOptional.get());
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    public  ResponseEntity<String> registerClient(Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String confirm_password = body.get("confirm_password");
        String avatar = body.get("avatar");
        String email = body.get("email");
        String company_name = body.get("company_name");
        String company_address = body.get("company_address");
        String contact_person = body.get("company_contact_person");
        String company_phone = body.get("company_phone");
        String company_email = body.get("company_email");
        if(company_name == null || company_name.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Company name blank");
        if(contact_person==null || contact_person.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Contact person blank");
        if(company_phone== null || company_phone.isBlank() || !phoneRegex.matcher(company_phone).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Company phone blank or invalid.");
        if(company_email ==null || company_email.isBlank() || !emailRegex.matcher(company_email).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Company email blank or invalid.");
        if(username == null || username.isBlank() || username.length() < 5) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username blank or incorrect.");
        if(password == null || password.isBlank() || confirm_password == null || confirm_password.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords empty");
        if(!password.equals(confirm_password) || !passwordRegex.matcher(password).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords don't match or requirements are not met.");
        if(email == null | email.isBlank() || !emailRegex.matcher(email).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is blank or invalid");

        Client newClient = new Client(company_name, company_address, contact_person, company_phone, company_email);
        User newUser = new User(username, passwordEncoder.encode(password), avatar, email);
        if(userRepository.findUserByUsername(newUser.getDBUsername()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body("User with that username already exist");
        if(clientRepository.findClientByEmail(newClient.getEmail()).isPresent() || clientRepository.findClientByPhone(newClient.getPhone()).isPresent() || clientRepository.findClientByCompanyName(newClient.getCompanyName()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body("Company already exists.");
        clientRepository.save(newClient);
        newUser.setUserType(UserType.CLIENT);
        newUser.setUserRefId(newClient.getId());
        newUser.setRole(Role.CLIENT);


        userRepository.save(newUser);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
    public ResponseEntity<String> allocateUserToEmployee(String EUUID, Map<String, String> body) {
        Optional<Employee> employeeOptional = employeeRepository.findEmployeeByEUUID(EUUID);
        if(!employeeOptional.isPresent()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee not found");
        if(userRepository.findUserByUserRefIdAndUserType(employeeOptional.get().getId(), UserType.EMPLOYEE).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body("User already registered.");
        String username = body.get("username");
        String password = body.get("password");
        String confirm_password = body.get("confirm_password");
        String avatar = body.get("avatar");
        String email = body.get("email");
        if(username == null || username.isBlank() || username.length() < 5) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username blank or invalid");
        if(userRepository.findUserByUsername(username).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken.");
        if(password == null || password.isBlank() || confirm_password == null || confirm_password.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password are empty");
        if(!password.equals(confirm_password) || !passwordRegex.matcher(password).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords don't match or requirements are not met.");
        if(email == null | email.isBlank() || !emailRegex.matcher(email).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email blank or invalid");
        if(userRepository.findUserByEmail(email).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already taken.");

        User newUser = new User(username, passwordEncoder.encode(password), avatar, email);
        newUser.setUserType(UserType.EMPLOYEE);
        newUser.setUserRefId(employeeOptional.get().getId());
        newUser.setRole(Role.WORKER);
        userRepository.save(newUser);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    public ResponseEntity<String> registerUserAndEmployee(Map<String, String> body) {
        if(isEmployeeRequired) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("This feature is disabled");
        String employee_email = body.get("employee_email");
        String employee_phone = body.get("employee_phone");
        String employee_firstName = body.get("employee_firstName");
        String employee_lastName = body.get("employee_lastName");
        String position = "Trainee";
        String employee_hireDate = body.get("employee_hireDate");
        Long departmentId = 0L;
        if(employee_email == null || employee_email.isBlank() || !emailRegex.matcher(employee_email).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Employee Email is blank or invalid");
        if(employee_phone == null || employee_phone.isBlank() || !phoneRegex.matcher(employee_phone).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Employee phone is blank or invalid");
        if(employee_firstName == null || employee_firstName.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Employee first name is blank");
        if(employee_lastName == null || employee_lastName.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Employee last name is blank");
        if(employee_hireDate == null || employee_hireDate.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Hire date is blank");
        LocalDate hireDate;
        try {
            hireDate = LocalDate.parse(employee_hireDate);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }

        String username = body.get("username");
        String password = body.get("password");
        String confirm_password = body.get("confirm_password");
        String avatar = body.get("avatar");
        String email = body.get("email");
        if(username == null || username.isBlank() || username.length() < 5) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is blank or invalid");
        if(password == null || password.isBlank() || confirm_password == null || confirm_password.isBlank()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords are blank");
        if(!password.equals(confirm_password) || !passwordRegex.matcher(password).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Passwords don't match or requirements are not met.");
        if(email == null | email.isBlank() || emailRegex.matcher(email).matches()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is blank or invalid");

        Employee newEmployee = new Employee(employee_email, employee_phone, employee_firstName, employee_lastName, position, hireDate, departmentId);
        employeeRepository.save(newEmployee);
        User newUser = new User(username, passwordEncoder.encode(password), avatar, email);
        newUser.setUserType(UserType.EMPLOYEE);
        newUser.setUserRefId(newEmployee.getId());
        newUser.setRole(Role.WORKER);
        userRepository.save(newUser);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
    public AuthResponse authenticate(AuthRequest request, HttpServletResponse response) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername().toLowerCase(), request.getPassword()));
        User user = userRepository.findUserByUsername(request.getUsername().toLowerCase()).orElseThrow();

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        Employee employee = new Employee();
        Client client = new Client();
        if(user.getUserType().equals(UserType.EMPLOYEE) || user.getUserType().equals(UserType.USER)){
            employee = employeeRepository.findEmployeeById(user.getUserRefId()).get();
        } else if (user.getUserType().equals(UserType.CLIENT)) {
            client = clientRepository.findClientById(user.getUserRefId()).get();
        }
        setJwtCookies(response, accessToken, refreshToken);
        return new AuthResponse(
                user.getRole(),
                employee.getFirstName() != null && !employee.getFirstName().isBlank() ? employee.getFirstName() : client.getCompanyName() != null && !client.getCompanyName().isBlank() ? client.getCompanyName() : "N/A",
                employee.getLastName() != null && !employee.getLastName().isBlank() ? employee.getLastName() : client.getContactPerson() != null && !client.getContactPerson().isBlank() ? " | " + client.getContactPerson() : "",
                employee.getEmail() != null && !employee.getEmail().isBlank() ? employee.getEmail() : client.getEmail() != null && !client.getEmail().isBlank() ? client.getEmail() : "N/A",
                employee.getPhone() != null && !employee.getPhone().isBlank() ? employee.getPhone() : client.getPhone() != null && !client.getPhone().isBlank() ? client.getPhone() : "N/A",
                user.getDBUsername(),
                user.getAvatar(),
                user.getId().toString(),
                accessToken,
                refreshToken
        );
    }
    public void refreshToken(
            String authHeader,
            String refreshToken,
            HttpServletResponse response,
            boolean isCookie
    ) throws IOException {
        if(!isCookie) { //httponly cookie, no need to check for acceess_token (extra security?)
            if (refreshToken == null || refreshToken.isBlank()) { //no point to continue
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            if (!refreshToken.split("\\.")[0].equals(authHeader.substring(7).split("\\.")[0])) { //if header not same, means refreshToken is not a token
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        final String username;
        try {
            username = jwtService.extractUsername(refreshToken);
        } catch (ExpiredJwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        User user = userRepository.findUserByUsername(username).orElseThrow();
        Client client = new Client();
        Employee employee = new Employee();
        if(user.getUserType().equals(UserType.EMPLOYEE) || user.getUserType().equals(UserType.USER)){
            employee = employeeRepository.findEmployeeById(user.getUserRefId()).get();
        } else if (user.getUserType().equals(UserType.CLIENT)) {
            client = clientRepository.findClientById(user.getUserRefId()).get();
        }
        if (jwtService.isTokenValid(refreshToken, user)) {
            String accessTokenGenerated = jwtService.generateToken(user);
            AuthResponse authResponse = new AuthResponse(
                    user.getRole(),
                    employee.getFirstName() != null && !employee.getFirstName().isBlank() ? employee.getFirstName() : client.getCompanyName() != null && !client.getCompanyName().isBlank() ? client.getCompanyName() : "N/A",
                    employee.getLastName() != null && !employee.getLastName().isBlank() ? employee.getLastName() : client.getContactPerson() != null && !client.getContactPerson().isBlank() ? " | " + client.getContactPerson() : "",
                    employee.getEmail() != null && !employee.getEmail().isBlank() ? employee.getEmail() : client.getEmail() != null && !client.getEmail().isBlank() ? client.getEmail() : "N/A",
                    employee.getPhone() != null && !employee.getPhone().isBlank() ? employee.getPhone() : client.getPhone() != null && !client.getPhone().isBlank() ? client.getPhone() : "N/A",
                    user.getDBUsername(),
                    user.getAvatar(),
                    user.getId().toString(),
                    accessTokenGenerated,
                    refreshToken
            );
            response.setContentType("application/json");
            new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            setJwtCookies(response, accessTokenGenerated, refreshToken);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }
    @Value("${security.jwt.expire.refresh.token}")
    private long refreshExpiration;
    @Value("${security.jwt.expire.access.token}")
    private long jwtExpiration;
    private void setJwtCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(jwtExpiration/1000 + 3) //from milis to seconds (+3 seconds error window)
                .sameSite("None")
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshExpiration)
                .sameSite("None")
                .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }
}
