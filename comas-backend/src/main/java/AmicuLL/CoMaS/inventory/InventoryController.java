package AmicuLL.CoMaS.inventory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "api/v1/inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getInventoryItems(@RequestParam(name = "item_id", required = false) String id,
                                                                            @RequestParam(name = "type", required = false) String type){
        return inventoryService.getInventoryItems(id, type);
    }

    @GetMapping(path = "/types")
    public ResponseEntity<List> getItemTypes(){
        return inventoryService.getItemTypes();
    }

    @PostMapping
    public ResponseEntity<String> setInventoryItem (@RequestBody Map<String, String> body ) {
        return inventoryService.setInventoryItem(body);
    }

    @PatchMapping
    public ResponseEntity<String> editInventoryItem(@RequestParam(name = "item_id", required = false) Long itemId, @RequestBody Map<String, String> body ) {
        return inventoryService.editInventoryItem(itemId, body);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteInventoryItem(@RequestParam(name = "item_id", required = false) Long itemId) {
        return inventoryService.deleteInventoryItem(itemId);
    }
}
