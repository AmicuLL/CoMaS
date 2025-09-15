package AmicuLL.CoMaS.client;

import AmicuLL.CoMaS.projects.Project;
import AmicuLL.CoMaS.projects.ProjectRepository;
import AmicuLL.CoMaS.user.Permission;
import AmicuLL.CoMaS.user.User;
import AmicuLL.CoMaS.user.UserType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClientService {
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;

    public ClientService(ClientRepository clientRepository, ProjectRepository projectRepository) {
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
    }
    public ResponseEntity<?> getAuthClient() {
        User authUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if(authUser.getUserType() == UserType.CLIENT) {
            Optional<Client> client = clientRepository.findClientById(authUser.getUserRefId());
            if(client.isPresent()) return ResponseEntity.status(HttpStatus.OK).body(client.get());
            else return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }
    public ResponseEntity<?> editClient(Map<String, String> body, Long clientID) {
        System.out.println(body);
        User authUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Client> client = null;
        if(clientID != null) {
            if(authUser.getPermissions().contains(Permission.CLIENT_EDIT)) client = clientRepository.findClientById(clientID);
            else return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } else if (authUser.getUserType() == UserType.CLIENT) {
            client = clientRepository.findClientById(authUser.getUserRefId());
        }
        if(client != null && client.isPresent()) {
            Client editClient = client.get();
            if(body.get("company_name") != null && !body.get("company_name").isBlank()) {
                List<Project> projects = projectRepository.findAllByClient(editClient.getCompanyName()); //updating new name in projects also
                if(!projects.isEmpty()) {
                    for (Project project : projects) {
                        project.setClient(body.get("company_name"));
                        projectRepository.save(project);
                    }
                }
                editClient.setCompanyName(body.get("company_name"));
            }
            if(body.get("contact_person") != null && !body.get("contact_person").isBlank()) {
                editClient.setContactPerson(body.get("contact_person"));
            }
            if(body.get("company_email") != null && !body.get("company_email").isBlank()) {
                editClient.setEmail(body.get("company_email"));
            }
            if(body.get("company_phone") != null && !body.get("company_phone").isBlank()) {
                editClient.setPhone(body.get("company_phone"));
            }
            clientRepository.save(editClient);
            return ResponseEntity.status(HttpStatus.OK).build();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }
}
