package AmicuLL.CoMaS.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Inventory getInventoryById(Long id);
    List<Inventory> findAll();
    List<Inventory> findAllByItemType(ItemType itemType);
}
