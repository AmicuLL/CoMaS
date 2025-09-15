package AmicuLL.CoMaS.messages;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "api/v1/messages")
public class MessagesController {
    private final MessagesService messagesService;
    @Autowired
    public MessagesController(MessagesService messagesService) {
        this.messagesService = messagesService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getPrivateConversation(@RequestParam(name = "sender_id", required = false) Long sender_id,
    @RequestParam(name = "batch_size", required = false) int batchSize,
    @RequestParam(name = "last_id", required = false) Long lastId){
        if (sender_id != null && sender_id != 0) {
            //private conversation
            if(lastId != null) return messagesService.getConversationBySenderId(sender_id, lastId, batchSize);
            return messagesService.getConversationBySenderId(sender_id,null, batchSize);
        }
        else {
            //broadcast messages
            if (lastId != null) return messagesService.getMessages(lastId, batchSize);
            return messagesService.getMessages(null, batchSize); //first batch to fetch I guess xD
        }
    }
    @PostMapping
    public ResponseEntity<List<Map<String, String>>> sendMessage(@RequestParam(name = "receiver_id", required = false) String receiver_id, @RequestBody Map<String, String> body){
        if((receiver_id != null && !receiver_id.isBlank() && body.get("content") != null && !body.get("content").isBlank())) return messagesService.sendMessage(receiver_id, body.get("content"));
        else if (body.get("content") != null && !body.get("content").isBlank()) return messagesService.sendMessage(null, body.get("content"));
        else return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonList(
                new HashMap<>() {{
                    put("message", "Message content cannot be null or empty.");
                    put("error", "message content invalid");
                }}
        ));
    }

    @GetMapping(path = "/senders")
    public ResponseEntity<List<Map<String, String>>> getUsersSender(){
        return messagesService.getUserChatPartners();
    }


}
