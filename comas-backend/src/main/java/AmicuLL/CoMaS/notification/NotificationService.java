package AmicuLL.CoMaS.notification;

import AmicuLL.CoMaS.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public ResponseEntity<List<Notification>> getNotifications(User authUser) {
        List<Notification> notifications = notificationRepository.findAllByReceiverId(authUser.getId());
        if(notifications.isEmpty()) return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        return ResponseEntity.status(HttpStatus.OK).body(notifications);
    }
    public ResponseEntity<String> deleteNotifications(User authUser, Long notif_id, String notif_type) {
        if(notif_id != null && notif_id != 0) {
            try {
                notificationRepository.delete(notificationRepository.findNotificationByIdAndReceiverId(notif_id, authUser.getId()).orElseThrow());
                return ResponseEntity.status(HttpStatus.OK).body("{\"message\":\"Notification deleted\"}");
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
        }
        if (notif_type != null && !notif_type.isBlank()) {
            try {
                NotificationType notification_type = NotificationType.valueOf(notif_type.toUpperCase());
                notificationRepository.deleteAll(notificationRepository.findAllByNotificationTypeAndReceiverId(notification_type, authUser.getId()));
                return ResponseEntity.status(HttpStatus.OK).body("{\"message\":\"Notification deleted\"}");
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"No id or type\"}");
    }
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));

        return emitter;
    }

    public void sendNotification(Long receiverId, Long senderId, Notification notification) {
        if (receiverId == null) {
            for (Map.Entry<Long, SseEmitter> entry : emitters.entrySet()) {
                Long currentUserId = entry.getKey();
                SseEmitter emitter = entry.getValue();
                    try {
                        emitter.send(notification);
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                        emitters.remove(currentUserId);
                    }
            }
        } else {
            SseEmitter emitter = emitters.get(receiverId);
            if (emitter != null) {
                try {
                    emitter.send(notification);
                } catch (IOException e) {
                    emitter.completeWithError(e);
                    emitters.remove(receiverId);
                }
            }
        }
    }

    //Auto-run every day at 00:00
    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteOldNotifications() {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        notificationRepository.deleteAllByTimestampBefore(oneMonthAgo);
    }

}
