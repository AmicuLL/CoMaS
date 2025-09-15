package AmicuLL.CoMaS.client;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping(path = "api/v1/client")
public class ClientController {
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping()
    public ResponseEntity<?> getAuthClient() {
        return clientService.getAuthClient();
    }

    @PatchMapping()
    public ResponseEntity<?> editClient(@RequestBody Map<String, String> body, @RequestBody(required = false) Long clientID) {
        return clientService.editClient(body, clientID);
    }
}
