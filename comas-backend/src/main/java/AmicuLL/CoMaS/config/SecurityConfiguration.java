package AmicuLL.CoMaS.config;

import AmicuLL.CoMaS.user.Permission;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static AmicuLL.CoMaS.user.Role.*;
import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final UserDetailsService userDetailsService;
    private final CustomAccesDeniedHandler customAccesDeniedHandler;
    private final LogoutHandler logoutHandler;

    public SecurityConfiguration(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider, UserDetailsService userDetailsService, CustomAccesDeniedHandler customAccesDeniedHandler, LogoutHandler logoutHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
        this.userDetailsService = userDetailsService;
        this.customAccesDeniedHandler = customAccesDeniedHandler;
        this.logoutHandler = logoutHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/public/**").permitAll() // Endpointuri publice
                        .requestMatchers(POST, "/api/v1/auth/**").permitAll()
                        .requestMatchers(POST, "/api/v1/timesheet/**").permitAll() //as using check-in from non-authenticated method (hardware ESP32)
                        .requestMatchers(GET, "/api/v1/timesheet/**").hasAnyRole(ADMIN.name(), SysOP.name(), EMPLOYEE.name()) //this one must be authenticated and an employee

                        //employee view
                        .requestMatchers(GET, "/api/v1/employee/all").hasAnyAuthority(
                                Permission.VIEW_EMPLOYEE
                                        .stream().map(Permission::getPermission)
                                        .toArray(String[]::new))

                        //employee add
                        .requestMatchers(POST, "/api/v1/employee/add").hasAnyAuthority(
                                Permission.EDIT_EMPLOYEE
                                .stream().map(Permission::getPermission)
                                        .toArray(String[]::new))

                        //user view // checked for perms in UserDTO. Easier this way than creating another endpoint. Bad for scalability?
                        /*.requestMatchers(GET, "/api/v1/user").hasAnyAuthority(
                                Permission.VIEW_USER
                                        .stream().map(Permission::getPermission)
                                        .toArray(String[]::new))*/

                        //user forgot password. Move it in auth?
                        .requestMatchers(PATCH, "/api/v1/user/forgot_password").permitAll()

                        //inventory view
                        //employees get this permission by default(as standard). Admin can remove the perm
                        .requestMatchers(GET, "/api/v1/inventory").hasAuthority(Permission.INVENTORY_VIEW.getPermission())
                        .requestMatchers(GET, "/api/v1/inventory/types").hasAuthority(Permission.INVENTORY_VIEW.getPermission())

                        //inventory add
                        .requestMatchers(POST, "/api/v1/inventory").hasAuthority(Permission.INVENTORY_ADD.getPermission())

                        //inventory edit
                        .requestMatchers(PATCH, "/api/v1/inventory").hasAuthority(Permission.INVENTORY_EDIT.getPermission())

                        //inventory delete
                        .requestMatchers(DELETE, "/api/v1/inventory").hasAuthority(Permission.INVENTORY_DELETE.getPermission())

                        //project add
                        .requestMatchers(POST, "/api/v1/project").hasAuthority(
                                Permission.PROJECTS_ADD.getPermission())

                        //project edit
                        .requestMatchers(PATCH, "/api/v1/project").hasAuthority(
                                Permission.PROJECTS_EDIT.getPermission())

                        //project delete
                        .requestMatchers(DELETE, "/api/v1/project").hasAuthority(
                                Permission.PROJECTS_DELETE.getPermission())

                        //project view is done in project service

                        //Orice alt request necesita autentificare
                        .anyRequest().authenticated()
                ).userDetailsService(userDetailsService).exceptionHandling(e -> e.accessDeniedHandler(customAccesDeniedHandler)
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Stateless pentru JWT
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class).logout(logout ->
                        logout.logoutUrl("/api/v1/auth/logout")
                                .addLogoutHandler(logoutHandler)
                                .logoutSuccessHandler((request, response, authentication) -> SecurityContextHolder.clearContext())
                ).build();
    }

    private UrlBasedCorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(List.of("https://192.168.1.135", "http://localhost:5173", "127.0.0.1:5173", "127.0.0.1:443"/*, "https://a***.****.**"*/));
        corsConfig.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfig.setAllowedHeaders(List.of("*"));
        corsConfig.setExposedHeaders(List.of("*"));
        corsConfig.setAllowCredentials(true);
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }
}
