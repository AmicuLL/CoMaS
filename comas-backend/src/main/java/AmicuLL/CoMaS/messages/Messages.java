package AmicuLL.CoMaS.messages;

import jakarta.persistence.*;

import java.time.LocalDateTime;
@Entity
@Table(name = "messages")
public class Messages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long senderId;
    private Long receiverId;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String status;

    public Messages(Long senderId, Long receiverId, String content, LocalDateTime createdAt, LocalDateTime readAt, String status) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.createdAt = createdAt;
        this.readAt = readAt;
        this.status = status;
    }

    public Messages() {
    }

    public Long getId() {
        return id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
