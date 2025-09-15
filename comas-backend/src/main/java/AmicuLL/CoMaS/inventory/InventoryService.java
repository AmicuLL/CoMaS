package AmicuLL.CoMaS.inventory;

import AmicuLL.CoMaS.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private User getAuthUser(){
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Autowired
    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    private void InventoryBuilder(Inventory inventory, Map<String, String> map) {
        map.put("id", inventory.getId().toString());
        map.put("manufacturer", inventory.getManufacturer());
        map.put("code", inventory.getCode());
        map.put("name", inventory.getName());
        map.put("description", inventory.getDescription());
        map.put("type", inventory.getItemType().toString());
        map.put("location", inventory.getLocation());
        map.put("quantity", inventory.getQuantity().toString());
        map.put("image", inventory.getImage());
        map.put("minimum_quantity", inventory.getMinimumQuantity().toString());
        map.put("isQuantityLow", inventory.getMinimumQuantity() != 0 ? inventory.getQuantity() < inventory.getMinimumQuantity() ? "true" : "false" : "never");
    }

    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, String>>> getInventoryItems(String id, String type) {
        Long itemId = null;
        ItemType itemType = null;
        if(id != null && !id.isBlank()) {
            try {
                itemId = Long.parseLong(id);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonList(new HashMap<>() {{put("message", "Item id is incorrect.");}}));
            }
        }
        if (type != null && !type.isBlank()) {
            try {
                itemType = ItemType.valueOf(type);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonList(new HashMap<>() {{put("message", "Item type is incorrect.");}}));
            }
        }

        List<Map<String, String>> result;
        List<Inventory> inventories = null;
        if(id!=null) {
            Optional<Inventory> inv = inventoryRepository.findById(itemId);
            if(inv.isPresent()) {
                inventories = List.of(inv.get());
            }
        }
        else if (itemType != null) {
            inventories = inventoryRepository.findAllByItemType(itemType);
            if(inventories.isEmpty()) inventories = null;
        }
        else {
            inventories = inventoryRepository.findAll();
            if(inventories.isEmpty()) inventories = null;
        }

        if(inventories == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonList(new HashMap<>() {{put("message", "No items found.");}}));
        result = inventories.stream().map(message -> {
            Map<String, String> map = new HashMap<>();
            InventoryBuilder(message, map);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    public ResponseEntity<List> getItemTypes(){
        return ResponseEntity.status(HttpStatus.OK).body(List.of(ItemType.values()));
    }
    @Transactional
    public ResponseEntity<String> setInventoryItem(Map<String, String> body) {
        String manufacturer = "N/A";
        String code = "N/A";
        String itemName;
        String description = "N/A";
        ItemType itemType = ItemType.MISCELLANEOUS; //item type request can be null
        String location = "N/A";
        Long quantity;
        String image = null;
        Long minimumQuantity = 0L;

        if(body.get("manufacturer") != null && !body.get("manufacturer").isBlank()) {
            manufacturer = body.get("manufacturer");
        }

        if(body.get("code") != null && !body.get("code").isBlank()) {
            code = body.get("code");
        }

        if(body.get("name") != null && !body.get("name").isBlank()) {
            itemName = body.get("name");
        } else return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Item name is null\"}");

        if(body.get("description") != null && !body.get("description").isBlank()) {
            description = body.get("description");
        }

        if(body.get("type") != null && !body.get("type").isBlank()) {
            try {
                itemType = ItemType.valueOf(body.get("type"));
            } catch (IllegalArgumentException e) {
                itemType = null;
            }
        }
        if(body.get("location") != null && !body.get("location").isBlank()) {
            location = body.get("location");
        }
        if(body.get("quantity") != null && !body.get("quantity").isBlank()) {
            try {
                quantity = Long.parseLong(body.get("quantity"));
            } catch (IllegalArgumentException e) {
                quantity = 0L;
            }
        } else return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"message\":\"Quantity is null\"}");
        if(body.get("min_quantity") != null && !body.get("min_quantity").isBlank()) {
            try {
                minimumQuantity = Long.parseLong(body.get("min_quantity"));
            } catch (IllegalArgumentException e) {
                minimumQuantity = 0L;
            }
        }
        if(body.get("image") != null && !body.get("image").isBlank()) {
            image = body.get("image");
        }

        Inventory newInventory = new Inventory(manufacturer, code, itemName, description, itemType, location, quantity, image, minimumQuantity);
        inventoryRepository.save(newInventory);
        return ResponseEntity.status(HttpStatus.CREATED).body("{\"message\":\"Item added.\"}");
    }
    @Transactional
    public ResponseEntity<String> editInventoryItem(Long id, Map<String, String> body) {
        Boolean changed = false;
        Inventory item = inventoryRepository.getInventoryById(id);
        if(item == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\":\"The item for the specified id could not be found.\"}");
        if(body.get("manufacturer") != null && !body.get("manufacturer").isBlank() && !body.get("manufacturer").equals(item.getDescription())) {
            item.setManufacturer(body.get("manufacturer"));
            changed = true;
        }
        if(body.get("name") != null && !body.get("name").isBlank() && !body.get("name").equals(item.getName())) {
            item.setName(body.get("name"));
            changed = true;
        }
        if(body.get("description") != null && !body.get("description").isBlank() && !body.get("description").equals(item.getDescription())) {
            item.setDescription(body.get("description"));
            changed = true;
        }
        if(body.get("code") != null && !body.get("code").isBlank() && !body.get("code").equals(item.getDescription())) {
            item.setCode(body.get("code"));
            changed = true;
        }
        if(body.get("type") != null && !body.get("type").isBlank()) {
            try {
                if(!ItemType.valueOf(body.get("type")).equals(item.getItemType())) {
                    item.setItemType(ItemType.valueOf(body.get("type")));
                    changed = true;
                }
            } catch (IllegalArgumentException e) {}
        }
        if(body.get("quantity") != null && !body.get("quantity").isBlank()) {
            try {
                if(Long.parseLong(body.get("quantity")) != item.getQuantity()) {
                    item.setQuantity(Long.parseLong(body.get("quantity")));
                    changed = true;
                }
            } catch (IllegalArgumentException e) {}
        }
        if(body.get("min_quantity") != null && !body.get("min_quantity").isBlank()) {
            try {
                if(Long.parseLong(body.get("min_quantity")) != item.getMinimumQuantity()) {
                    item.setMinimumQuantity(Long.parseLong(body.get("min_quantity")));
                    changed = true;
                }
            } catch (IllegalArgumentException e) {}
        }
        if(body.get("image") != null && !body.get("image").isBlank() && !body.get("image").equals(item.getImage())) {
            item.setImage(body.get("image"));
            changed = true;
        }
        if(changed) {
            inventoryRepository.save(item);
            return ResponseEntity.status(HttpStatus.OK).body("{\"message\":\"Item updated.\"}");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
        }
    }
    @Transactional
    public ResponseEntity<String> deleteInventoryItem(Long id) {
        Inventory item = inventoryRepository.getInventoryById(id);
        if (item != null) {
            inventoryRepository.delete(item);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("{\"message\":\"Item deleted\"}");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\":\"The item for the specified id could not be found.\"}");
        }


    }

}
