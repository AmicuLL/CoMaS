package AmicuLL.CoMaS.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByReceiverId(Long id);
    List<Notification> findAllByNotificationTypeAndReceiverId(NotificationType notificationType, Long userId);
    Optional<Notification> findNotificationByIdAndReceiverId(Long id, Long userId);
    void deleteAllByTimestampBefore(LocalDateTime timestamp);
}
