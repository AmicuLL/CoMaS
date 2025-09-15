package AmicuLL.CoMaS.inventory;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String manufacturer;
    private String code;
    private String name;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;
    private ItemType itemType;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String location;
    private Long quantity;
    private String image;
    private Long minimumQuantity;

    public Inventory() {
    }
    public Inventory(String manufacturer, String code, String name, String description, ItemType itemType, String location, Long quantity, String image, Long minimumQuantity) {
        this.manufacturer = manufacturer;
        this.code = code;
        this.name = name;
        this.description = description;
        this.itemType = itemType;
        this.location = location;
        this.quantity = quantity;
        this.image = image;
        this.minimumQuantity = minimumQuantity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Long getQuantity() {
        return quantity;
    }

    public void setQuantity(Long quantity) {
        this.quantity = quantity;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Long getMinimumQuantity() {
        return minimumQuantity;
    }

    public void setMinimumQuantity(Long minimumQuantity) {
        this.minimumQuantity = minimumQuantity;
    }
}
