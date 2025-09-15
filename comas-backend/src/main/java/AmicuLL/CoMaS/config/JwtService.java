package AmicuLL.CoMaS.config;

import AmicuLL.CoMaS.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

@Service
public class JwtService {
    @Value("${security.jwt.secret}")
    private String SECRET_KEY;
    @Value("${security.jwt.expire.refresh.token}")
    private long refreshExpiration;
    @Value("${security.jwt.expire.access.token}")
    private long jwtExpiration;
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public String generateRefreshToken(
            UserDetails userDetails
    ) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        if (userDetails instanceof User user) {
            extraClaims.put("lastChange", user.getLastCredentialsChange());
        }
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .claim("roles", userDetails.getAuthorities().stream().filter(auth -> auth.getAuthority().startsWith("ROLE_")).map(GrantedAuthority::getAuthority).toList())
                .claim("permissions", userDetails.getAuthorities().stream().filter(auth -> !auth.getAuthority().startsWith("ROLE_")).map(GrantedAuthority::getAuthority).toList())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        if (!username.equals(userDetails.getUsername()) || isTokenExpired(token)) {
            return false;
        }

        Date tokenIssuedAt = extractClaim(token, Claims::getIssuedAt);
        if (userDetails instanceof User user) {
            Date lastChange = user.getLastCredentialsChange();
            if (lastChange != null && lastChange.after(tokenIssuedAt)) {
                return false;
            }
        }

        return true;
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
