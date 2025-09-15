package AmicuLL.CoMaS.notification;

import AmicuLL.CoMaS.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@Controller
@RequestMapping(path = "api/v1/notification")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/subscribe")
    public SseEmitter subscribe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User authUser = (User) authentication.getPrincipal();
        return notificationService.subscribe(authUser.getId());
    }

    @GetMapping()
    public ResponseEntity<List<Notification>> getNotifications(){
        User authUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return notificationService.getNotifications(authUser);
    }
    @DeleteMapping()
    public ResponseEntity<String> deleteNotifications(@RequestParam(name = "notification_id", required = false) Long notif_id, @RequestParam(name = "notification_type", required = false) String notif_type) {
        User authUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return  notificationService.deleteNotifications(authUser, notif_id, notif_type);
    }
}
