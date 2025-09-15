package AmicuLL.CoMaS;

import AmicuLL.CoMaS.client.Client;
import AmicuLL.CoMaS.client.ClientRepository;
import AmicuLL.CoMaS.employee.Employee;
import AmicuLL.CoMaS.employee.EmployeeRepository;
import AmicuLL.CoMaS.inventory.Inventory;
import AmicuLL.CoMaS.inventory.InventoryRepository;
import AmicuLL.CoMaS.inventory.ItemType;
import AmicuLL.CoMaS.messages.Messages;
import AmicuLL.CoMaS.messages.MessagesRepository;
import AmicuLL.CoMaS.projects.Project;
import AmicuLL.CoMaS.projects.ProjectRepository;
import AmicuLL.CoMaS.projects.Status;
import AmicuLL.CoMaS.task.Task;
import AmicuLL.CoMaS.task.TaskRepository;
import AmicuLL.CoMaS.user.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Configuration
public class AppStartupConfig {
    @Bean
    CommandLineRunner commandLineRunner(UserRepository userRepository, EmployeeRepository employeeRepository, MessagesRepository messagesRepository, InventoryRepository inventoryRepository, TaskRepository taskRepository, ProjectRepository projectRepository, ClientRepository clientRepository){
        return args -> {
            User SysOP = new User("SysOP","$2a$12$IUPhK6UqqryUKJUx6P59M.tBzjFLQs/l5qiYqvOW/KXRANL38i89S" /*1234*/,"https://i.imgur.com/xugUdq8.png", "email@company.com");
            User AmicuLL = new User("AmicuLL","$2a$12$ot.Ac7uC/TD0AA4dcGdItundF8h48ga710WF23W3zI3LycGj/p0ei" ,"https://avatars.fastly.steamstatic.com/e26c98dcd24181be8c83e22ab39e8b74d22291d0_full.jpg", "ionutberfela@gmail.com");
            User Larisa = new User("LarisaI","$2a$12$ot.Ac7uC/TD0AA4dcGdItundF8h48ga710WF23W3zI3LycGj/p0ei","https://i.imgur.com/PCugi8F.jpeg", "larisa.personal@personal.com");

            Employee SysWorker = new Employee("SysOP@CoMaS.com", "0123456789", "Sys", "OP", "GOD", LocalDate.of(1969,01,01), 1L, "00:00-23:59", LocalTime.of(1,0));
            Employee AmicuLLWorker = new Employee("AmicuLL_Ionut@CoMaS.com", "0700000000", "Ionut", "AmicuLL", "Jr. Network Engineer", LocalDate.of(2020,01,01), 1L);
            Employee LarisaWorker = new Employee("LarisaI@CoMaS.com", "9876543210", "Larisa", "[LastName]", "Viitoare inginer", LocalDate.of(2020,01,01), 1L);
            SysWorker.setEUUID("11112222-3333-4444-5555-666677778888"); //hardcoded euuid for esp32 timesheet testing
            AmicuLLWorker.setEUUID("1a1a2b2b-3c3c-4d4d-5d5d-6c6c7b7b8a8a"); //second rfid tag
            employeeRepository.saveAll(List.of(SysWorker, AmicuLLWorker, LarisaWorker));


            SysOP.setUserType(UserType.EMPLOYEE);
            SysOP.setUserRefId(1l);
            SysOP.setRole(Role.SysOP);


            SysOP.setPermissions(Permission.ALL); //pt a salva in database. El oricum le are pe toate
            AmicuLL.setUserType(UserType.EMPLOYEE);
            AmicuLL.setUserRefId(2L);
            AmicuLL.setRole(Role.ADMIN);
            AmicuLL.setPermissions(Set.of(Permission.USER_VIEW, Permission.USER_EDIT, Permission.PROJECTS_DELETE, Permission.USER_DELETE));
            Larisa.setUserType(UserType.EMPLOYEE);
            Larisa.setUserRefId(3L);
            Larisa.setRole(Role.EMPLOYEE);
            Larisa.setPermissions(Set.of(Permission.USER_VIEWROLE, Permission.USER_VIEWUSERNAME, Permission.USER_VIEWEMAIL, Permission.USER_VIEWPERM));

            userRepository.saveAll(List.of(SysOP, AmicuLL, Larisa));


            //Hardcoded messages
            Messages messageFromAmicuLLToSysOp = new Messages(2L,1L,"Mesaj din CommandLineRunner pentru SysOp de la AmicuLL", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(messageFromAmicuLLToSysOp);
            messageFromAmicuLLToSysOp = new Messages(2L,1L,"Test de la AmicuLL", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(messageFromAmicuLLToSysOp);


            Messages messageFromLarisaToSysOp = new Messages(3L,1L,"CommandLineRunner LarisaI pentru SysOp", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(messageFromLarisaToSysOp);
            messageFromLarisaToSysOp = new Messages(3L,1L,"Larisa Testeaza", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(messageFromLarisaToSysOp);

            Messages toAll = new Messages(1L,0L,"SysOp a scris din System acest mesaj.", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"AmicuLL rupe testele dupa ce a stat sa codeze de 15 ore partea asta incontinuu", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"Inca un mesaj random", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"Si asta e random, consecutiv.", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(1L,0L,"SysOp Worker is asleep!", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);

            toAll = new Messages(1L,0L,"1", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"2", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"3", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"4", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"5", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"6", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"7", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(1L,0L,"8", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"9", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"10", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);

            toAll = new Messages(2L,0L,"1", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"2", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"3", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(1L,0L,"4", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"5", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"6", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(1L,0L,"7", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"8", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(3L,0L,"9", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);
            toAll = new Messages(2L,0L,"10", LocalDateTime.now(), null, "Sent");
            messagesRepository.save(toAll);

            //Hardcoded inventory for testing
            Inventory newItem = new Inventory("Samsung", "SM-S9360","Galaxy S25+","Android smartphone, Snapdragon 8 Elite chipset, 4900 mAh battery, 512 GB storage, 12 GB RAM", ItemType.DEVICES, "Depozit birou. Zona A, Raft 2, Sertar 7", 2L,"https://phonedb.net/img/samsung_galaxy_s24_plus_5g_7.jpg",0L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Apple", "A3296","iPhone 16 Pro Max","iOS smartphone, Apple A18 Pro chipset, 4685 mAh battery, 256 GB storage, 8GB RAM", ItemType.DEVICES, "Depozit birou", 5L,"https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg",0L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Asus", "FA506IV-AL064","TUF Gaming A15","AMD Ryzen™ 7 4800H chipset, 15.6\" display, 16GB, 512GB SSD, NVIDIA® GeForce RTX™ 2060 6GB", ItemType.DEVICES, "Depozit birou",1L,"https://lcdn.mediagalaxy.ro/media/catalog/product/0/3/03-FX506_L_d602c423.jpg",0L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Romcim", "CU-425","Ciment Ultra 42,5","Ciment de calitate pentru betoane simple si armate, pentru constructii ultrarezistente. Este un ciment de clasa 42,5 R, ideal pentru aplicatii multiple – orice lucrari individuale din beton simplu si armat.", ItemType.MATERIAL, "Depozit secundar. Str Fictiva nr.32",50L,"https://cdn.dedeman.ro/media/catalog/product/6/0/6011034_2.jpg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",20L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Holcim", "EP-P425-PR","Ecoplanet+ 42,5R","Ciment Portland compozit, aditivat, cu performanta ridicata, dezvoltat special pentru o gama larga de aplicatii: constructii rezidentiale, comerciale si industriale, inclusiv lucrari de renovare si modernizare. Aditivarea cimentului cu Duraditiv imbunatateste proprietatile betonului preparat cu Ecoplanet Plus, asigurand o calitate superioara a produsului final.", ItemType.MATERIAL, "Depozit secundar. Str Fictiva nr.32",10L,"https://cdn.dedeman.ro/media/catalog/product/6/0/6062992_2.jpg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",20L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Frankfurt", "1108","Lopata 1108 cu maner","Lopata este executata prin presare la rece a tablei de otel cu grosimea de 1.5 m, are gura ascutita, marginile drepte si este protejata impotriva coroziunii prin vopsire cu pulbere in camp electrostatic.", ItemType.TOOL, "Depozit principal. Str Reala nr.23",15L,"https://cdn.dedeman.ro/media/catalog/product/7/0/7032984_1.jpg?optimize=low&fit=bounds&height=266&width=266&canvas=266:266",0L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Makita", "XGT-DF002GA101","Masina de gaurit / insurubat","Pentru lucrarile universale, viteza de 2200 rotatii pe minut, perfecta pentru gaurirea rapida a diametrelor mici. Aceasta vine echipata cu doua functii esentiale: gaurire si insurubare, asigurand astfel versatilitatea necesara pentru diverse aplicatii.", ItemType.TOOL, "Depozit principal. Str Reala nr.23",3L,"https://cdn.dedeman.ro/media/catalog/product/1/0/1084084_7.jpg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",0L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("DeWalt", "DWE490-QS","Polizor unghiular","Pentru taiere si slefuire in materiale precum metal, beton sau piatra. Motor de 2000 W, viteza maxima de rotatie de 6600 rotatii pe minut si un disc de 230 mm", ItemType.TOOL, "Depozit principal. Str Reala nr.23",2L,"https://cdn.dedeman.ro/media/catalog/product/1/0/1093820_1.jpg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",0L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Uni-T", "UT204R","Clampmetru digital","Masurarea fara contact a instalatiilor aflate in functiune, dupa principiul inductiei, fara a se intrerupe circuitele.", ItemType.TOOL, "Depozit principal. Str Reala nr.23",10L,"https://cdn.dedeman.ro/media/catalog/product/1/0/1058699.jpg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",0L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Samus", "SA-TE1310AN","Cafetiera Tempora","Face cafea. Capacitate 10 cesti, functie antipicurare, functie reglare intensitate cafea.", ItemType.MISCELLANEOUS, "Depozit birou.",1L,"https://cdn.dedeman.ro/media/catalog/product/3/0/3049932.jpg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",0L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Interbabis", "TERINT-60A62","Salopeta albastra","Salopeta de lucru din material tercot. Marime 60/62. Culoare albastru. Bretele late.", ItemType.EQUIPMENT, "Depozit principal. Str Reala nr.23",7L,"https://cdn.dedeman.ro/media/catalog/product/7/0/7065697_4.jpg?optimize=low&fit=bounds&height=266&width=266&canvas=266:266",5L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Interbabis", "TERINT-46A48","Salopeta albastra","Salopeta de lucru din material tercot. Marime 46/48. Culoare albastru. Bretele late.", ItemType.EQUIPMENT, "Depozit principal. Str Reala nr.23",7L,"https://cdn.dedeman.ro/media/catalog/product/7/0/7065697_4.jpg?optimize=low&fit=bounds&height=266&width=266&canvas=266:266",5L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Climax", "5-RS/5-RG","Casca de protectie galbena","Casca e confectionata din HDPE, este destinata protectiei capului in medii industriale si in timpul lucrarilor susceptibile sa produca descarcari electrice de pana la 1000 V c.a. - 1500 V c.c. Casca absoarbe energia cauzata de o lovitura prin distrugerea sau deteriorarea partiala a calotei si a captuselii de protectie.", ItemType.EQUIPMENT, "Depozit secundar. Str Fictiva 2 nr.13",1L,"https://cdn.dedeman.ro/media/catalog/product/7/0/7074259.jpg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",2L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Endurance", "PL90-ABS79","Casca de protectie alba","Casca este realizata din ABS policarbonat, fara ventilatie, avand o cochilie robusta. Produsul este destinat pentru protectia capului, oferind rezistenta sporita impotriva socurilor si uzurii.", ItemType.EQUIPMENT, "Depozit principal. Str Reala nr.23",3L,"https://cdn.dedeman.ro/media/catalog/product/7/0/7074261.jpg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",2L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Climax", "5RS-ABW","Casca de protectie alba","Casca de protectie fabricata din polietilena HDPE, este conceputa pentru a oferi o protectie superioara in mediile de lucru cu risc ridicat. Asigura o protectie excelenta impotriva impactului cu obiecte dure precum pietre, tigle, caramizi si alte materiale de greutate similara, reducand riscul de accidentare a utilizatorului. Protejeaza impotriva trecerii curentului electric prin corpul uman, fiind eficienta pentru tensiuni de pana la 1000 V CA sau 1500 V CC, in intervalul de joasa tensiune.", ItemType.EQUIPMENT, "Depozit secundar. Str Fictiva nr.32",5L,"https://cdn.dedeman.ro/media/catalog/product/b/e/betterimage.ai_1727768366586.jpeg?optimize=low&fit=bounds&height=700&width=700&canvas=700:700",3L);
            inventoryRepository.save(newItem);
            newItem = new Inventory("Nescafe", "NES3I1-PL","Pliculete cafea","Cafea 3 in 1 pentru diminetile somnoroase", ItemType.MISCELLANEOUS, "Depozit birouri.",100L,"https://gomagcdn.ro/domains/cafea-premium.ro/files/product/large/nescafe-3in1-strong-cafea-instant-plic-24x15g-265-6847.png",50L);
            inventoryRepository.save(newItem);

            //Hardcoded tasks and projects
            Task newTask1 = new Task("Tema", "Alegerea unei teme pe baza cunostintelor", Set.of(1L,2L), 100f);
            Task newTask2 = new Task("Dezvoltare", "Dezvoltarea temei dupa anumite idei. Pe parcurs aceste idei se mai pot schimba", Set.of(2L), 95.6f);
            Task newTask3 = new Task("Aplicare", "Aplica aceste idei in a construi ceva frumos", Set.of(1L), 63.7f);
            Task newTask4 = new Task("Implementare", "Implementeaza dupa tehnologiile alese", Set.of(1L), 29.9f);
            taskRepository.saveAll(List.of(newTask1, newTask2, newTask3, newTask4));
            Project newProject = new Project("Elaborarea proiectului de licenta", "AmicuLL", LocalDate.parse("2025-01-20"), LocalDate.parse("2025-05-20"), Set.of(newTask1.getId(), newTask2.getId(), newTask3.getId(), newTask4.getId()), 2L, Set.of("0_1","0_2"), 1000d, 34.6f, Status.INITIATED);
            projectRepository.save(newProject);

            newTask1 = new Task("Documentare", "Documentare despre tema aleasa si de ce se intampla asa", Set.of(1L,2L), 52.16f);
            newTask2 = new Task("Motivare decizii", "De ce ai ales sa fie asa? De ce ai implementat asa? De unde te-ai informat?", Set.of(2L), 0.18f);
            newTask3 = new Task("Dezvoltare", "Baga frumos si incearca sa dezvolti cat de mult poti ideile pe care le ai fara sa dai o dovada ca esti tampit!", Set.of(1L), 0f);
            taskRepository.saveAll(List.of(newTask1, newTask2, newTask3));
            newProject = new Project("Elaborarea proiectului de diploma", "AmicuLL", LocalDate.parse("2024-06-12"), LocalDate.parse("2025-06-13"), Set.of(newTask1.getId(), newTask2.getId(), newTask3.getId()), 2L, Set.of("0_1","0_2"), 200d, 12.12f, Status.INITIATED);
            projectRepository.save(newProject);

            Client newClient = new Client("ELIF","Franta", "Rober Mihailescu", "0875645385", "contact@elif.ro");
            clientRepository.save(newClient);
            User newuser = new User("client","$2a$12$L3N.hYf8k3K0jBUo/U5UWOdiFDUVL6tyfNXWc0tpFQj6saDN6q/Fu","https://png.pngtree.com/png-clipart/20220118/ourmid/pngtree-cartoon-customer-service-avatar-png-image_4308952.png","personal@client.ro");
            newuser.setUserType(UserType.CLIENT);
            newuser.setRole(Role.CLIENT);
            newuser.setUserRefId(1L);
            userRepository.save(newuser);
        };
    }
}
