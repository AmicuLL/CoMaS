package AmicuLL.CoMaS.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findUserById(Long id);

    //Optional<User> findUserByIdRef(Long userRefId);
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username)") //Username will be saved as user inserted it
    Optional<User> findUserByUsername(String username);
    Optional<User> findUserByEmail(String email);
    Optional<User> findUsersByUserType(UserType userType);
    Optional<User> findUserByUserRefIdAndUserType(Long id, UserType userType);
}
