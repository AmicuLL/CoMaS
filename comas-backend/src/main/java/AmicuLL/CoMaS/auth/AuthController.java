package AmicuLL.CoMaS.auth;

import AmicuLL.CoMaS.employee.Employee;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/employee")
    public ResponseEntity<String> isEUUIDReq() {
        return ResponseEntity.status(HttpStatus.OK).body("{\"employee_required\":\"" + authService.isEmployeeRequired + "\"}");

    }
    @PostMapping("/register/employee_key")
    public ResponseEntity<Employee>  findEmployee(@RequestBody Map<String, String> body){
        if(body.get("employee_registration_key") != null && !body.get("employee_registration_key").isBlank()) return authService.checkEEUID(body.get("employee_registration_key"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestParam(name = "isClient", required = false) boolean isClient, @RequestBody Map<String, String> body) {

        if(isClient) return authService.registerClient(body);
        if(body.get("registration_key") != null && !body.get("registration_key").isBlank()) return authService.allocateUserToEmployee(body.get("registration_key"),body);
        return authService.registerUserAndEmployee(body);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request, HttpServletResponse response){
        return ResponseEntity.ok(authService.authenticate(request, response));
    }

    @PostMapping("/refresh-token")
    public void refreshToken(
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        String cookieRefreshToken = "";
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    cookieRefreshToken = cookie.getValue();
                    break;
                }
            }
        }
        authService.refreshToken(request.getHeader(HttpHeaders.AUTHORIZATION), cookieRefreshToken.isBlank() ? body.get("refresh_token"):cookieRefreshToken, response, !cookieRefreshToken.isBlank());
    }
}