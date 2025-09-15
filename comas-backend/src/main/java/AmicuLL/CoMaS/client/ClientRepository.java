package AmicuLL.CoMaS.client;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findClientByCompanyName(String name);
    Optional<Client> findClientByEmail(String email);
    Optional<Client> findClientByPhone(String phone);
    Optional<Client> findClientById(Long id);
    Optional<Client> findClientByContactPerson(String name);
}
