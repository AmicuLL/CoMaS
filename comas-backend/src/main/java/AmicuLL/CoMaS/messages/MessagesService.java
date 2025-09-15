package AmicuLL.CoMaS.messages;

import AmicuLL.CoMaS.notification.Notification;
import AmicuLL.CoMaS.notification.NotificationRepository;
import AmicuLL.CoMaS.notification.NotificationService;
import AmicuLL.CoMaS.notification.NotificationType;
import AmicuLL.CoMaS.user.User;
import AmicuLL.CoMaS.user.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class MessagesService {
    private final MessagesRepository messagesRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;


    public MessagesService(MessagesRepository messagesRepository, NotificationRepository notificationRepository, UserRepository userRepository, NotificationService notificationService) {
        this.messagesRepository = messagesRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getAuthUser(){
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void MessageBuilder(Messages message, Map<String, String> map) {
        map.put("id", message.getId() != null ? message.getId().toString() : "null");
        map.put("content", message.getContent());
        map.put("createdAt", message.getCreatedAt().toString());
        map.put("senderId", message.getSenderId().toString());
        map.put("receiverId", message.getReceiverId().toString());
        map.put("readAt", message.getReadAt() != null ? message.getReadAt().toString() : null);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, String>>> getMessages(Long lastMessageId, int batchSize) {

        List<Messages> messages;
        if(lastMessageId == null) messages = messagesRepository.findBroadcastMessagesBatch(batchSize);
        else messages = messagesRepository.findNextBroadcastMessagesBatch(lastMessageId, batchSize);
        if (messages.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        messages.sort(Comparator.comparing(Messages::getCreatedAt));
        List<Map<String, String>> result = new ArrayList<>();

        for (Messages message : messages) {
            Map<String, String> map = new LinkedHashMap<>();
            MessageBuilder(message, map);
            map.put("senderUsername", userRepository.findUserById(message.getSenderId()).get().getDBUsername());
            map.put("senderAvatar", userRepository.findUserById(message.getSenderId()).get().getAvatar());

            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, String>>> getConversationBySenderId(Long sender_id, Long lastMessageId, int batchSize) {
        User authUser = getAuthUser();
        List<Messages> conversation;// = messagesRepository.findConversationBetweenUsers(authUser.getId(), sender_id);
        if (lastMessageId != null) {
            conversation = messagesRepository.findNextMessagesBatch(authUser.getId(), sender_id, lastMessageId, batchSize);
        } else if (batchSize == 0) {
            conversation = messagesRepository.findConversationBetweenUsers(authUser.getId(), sender_id); //will get all messages | For testing now
        } else {
            conversation = messagesRepository.findMessagesBatch(authUser.getId(), sender_id, batchSize);
        }

        if (conversation.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        conversation.sort(Comparator.comparing(Messages::getCreatedAt));
        List<Map<String, String>> mappedConversation = conversation.stream().map(message -> {
            Map<String, String> map = new HashMap<>();
            MessageBuilder(message, map);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(mappedConversation);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, String>>> getUserChatPartners() {
        User authUser = getAuthUser();

        List<User> allUsers = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(authUser.getId()))
                .toList();

        List<Messages> messages = messagesRepository.findMessagesBySenderIdOrReceiverId(
                authUser.getId(), authUser.getId()
        );

        Set<Long> partnerIds = messages.stream()
                .flatMap(m -> Stream.of(m.getSenderId(), m.getReceiverId()))
                .filter(id -> !id.equals(authUser.getId()))
                .collect(Collectors.toSet());

        List<Map<String, String>> result = allUsers.stream()
                .map(user -> Map.of(
                        "id", user.getId().toString(),
                        "username", user.getDBUsername(),
                        "avatar", user.getAvatar(),
                        "hasConversation", String.valueOf(partnerIds.contains(user.getId()))
                ))
                .collect(Collectors.toList());

        if (result.isEmpty()) return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    public ResponseEntity<List<Map<String, String>>> sendMessage(String recvID, String content){
        User authUser = getAuthUser();
        Messages message;
        Long receiverId = 0L;
        if(recvID != null && !recvID.isBlank()) {
            try {
                receiverId = Long.parseLong(recvID);
                if (receiverId == authUser.getId()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        Collections.singletonList(
                                new HashMap<>() {{
                                    put("message", "Sending messages to yourself is prohibited.");
                                    put("error", "Incorrect Receiver ID");
                                }}
                        )
                );
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        Collections.singletonList(
                                new HashMap<>() {{
                                    put("message", "Receiver ID is invalid.");
                                    put("error", e.toString());
                                }}
                        )
                );
            }
        }
        message = new Messages(authUser.getId(), receiverId, content, LocalDateTime.now(), null, "Sent");
        Map<String, String> map = new HashMap<>();
        MessageBuilder(message, map);

        List<Map<String, String>> response;
        try {

            messagesRepository.save(message);
            map.put("id", message.getId().toString());
            Notification notif = new Notification(receiverId,authUser.getId(),NotificationType.MESSAGE_RECEIVED,"Message id: " + message.getId().toString() + ", Sender: " + authUser.getDBUsername(), LocalDateTime.now().withNano(0), null);
            notificationRepository.save(notif);
            notificationService.sendNotification(receiverId, authUser.getId(), notif);

            response = Collections.singletonList(map);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Collections.singletonList(
                            new HashMap<>() {{
                                put("message", "Data validation failed.");
                                put("error", e.toString());
                            }}
                    )
            );
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(
                    Collections.singletonList(
                            new HashMap<>() {{
                                put("message", "An error occurred while sending the message.");
                                put("error", e.toString());
                            }}
                    )
            );
        }
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    //auto-run at 00:00 every day
    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteOldMessages() {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        messagesRepository.deleteAllByCreatedAt(oneMonthAgo);
    }
}
