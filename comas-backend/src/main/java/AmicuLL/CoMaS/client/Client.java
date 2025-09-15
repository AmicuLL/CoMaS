package AmicuLL.CoMaS.client;

import jakarta.persistence.*;

@Entity
@Table(name = "client")
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String companyName;
    private String address;
    private String contactPerson;
    private String phone;
    private String email;

    public Client() {}

    public Client(String companyName, String address, String contactPerson, String phone, String email) {
        this.companyName = companyName;
        this.address = address;
        this.contactPerson = contactPerson;
        this.phone = phone;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

}