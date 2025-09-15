package AmicuLL.CoMaS.messages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessagesRepository extends JpaRepository<Messages, Long> {
    List<Messages> findMessagesBySenderIdOrReceiverId(Long user1, Long user2);

    @Query(value = """
        SELECT * FROM messages
        WHERE (receiver_id = 0)
        ORDER BY created_at DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Messages> findBroadcastMessagesBatch(int limit);


    @Query(value = """
        SELECT * FROM messages
        WHERE (receiver_id = 0)
        AND id < :lastMessageId
        ORDER BY created_at DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Messages> findNextBroadcastMessagesBatch(Long lastMessageId, int limit);


    @Query(value = """
        SELECT * FROM messages
        WHERE ((sender_id = :user1 AND receiver_id = :user2)
        OR (sender_id = :user2 AND receiver_id = :user1))
        AND id < :lastMessageId
        ORDER BY created_at DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Messages> findNextMessagesBatch(Long user1, Long user2, Long lastMessageId, int limit);

    @Query(value = """
        SELECT * FROM messages
        WHERE ((sender_id = :user1 AND receiver_id = :user2)
        OR (sender_id = :user2 AND receiver_id = :user1))
        ORDER BY created_at DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Messages> findMessagesBatch(Long user1, Long user2, int limit);

    @Query("SELECT m FROM Messages m WHERE " +
            "(m.senderId = :user1 AND m.receiverId = :user2) OR " +
            "(m.senderId = :user2 AND m.receiverId = :user1) " +
            "ORDER BY m.createdAt DESC")
    List<Messages> findConversationBetweenUsers(Long user1, Long user2);

    void deleteAllByCreatedAt(LocalDateTime createdAt);

}
